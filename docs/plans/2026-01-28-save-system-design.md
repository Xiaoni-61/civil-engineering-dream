# 自动存档系统设计

> **版本**: v1.0
> **日期**: 2026-01-28
> **类型**: 功能设计文档

---

## 1. 功能概述

实现基于后端的自动存档系统，支持 2 个存档槽位（slot1 最新，slot2 次新），用户可在首页选择继续游戏、开始新游戏或读取存档。

### 核心需求

- 退出游戏时自动保存
- 基于 deviceId 识别用户（无需账号）
- 保存完整游戏状态，加载后可无缝继续
- 同一局游戏更新 slot1，新游戏时 slot1 → slot2

---

## 2. 整体架构

### 系统组件

**后端**：
- API：`POST /api/saves/save` - 保存存档
- API：`GET /api/saves/list` - 获取存档列表
- API：`POST /api/saves/load` - 加载存档
- 数据库：`game_saves` 表

**前端**：
- 首页改造：新增"继续游戏"/"读取存档"选项
- Store 扩展：`saveGame()`, `loadGame()`, `getSavesList()`
- 退出监听：页面卸载 + 导航到首页

### 数据流

**保存流程**：
```
用户退出 → 触发保存 → 获取 deviceId + runId
→ 判断是否同一局（相同runId更新slot1，不同runId则slot1→slot2）
→ 序列化游戏状态 → 调用后端API保存
```

**加载流程**：
```
进入首页 → 检查存档（基于deviceId）
→ 显示选项 → 用户选择 → 调用API加载
→ 反序列化状态 → 更新store → 进入游戏
```

---

## 3. 数据库设计

### game_saves 表结构

```sql
CREATE TABLE IF NOT EXISTS game_saves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  slot_id INTEGER NOT NULL,          -- 1 或 2
  run_id TEXT NOT NULL,

  -- 游戏基础信息（用于列表展示）
  player_name TEXT,
  player_gender TEXT,
  current_quarter INTEGER,
  rank TEXT,
  status TEXT,

  -- 完整游戏状态（JSON）
  game_state TEXT NOT NULL,

  -- 元数据
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,

  UNIQUE(device_id, slot_id)
);

CREATE INDEX IF NOT EXISTS idx_saves_device
  ON game_saves(device_id, updated_at DESC);
```

### SaveGameState 数据结构

**保存的完整数据**：

```typescript
interface SaveGameState {
  // 玩家基础信息
  playerName: string;
  playerGender: 'male' | 'female';
  runId: string;
  deviceId: string;

  // 核心数值
  stats: PlayerStats;  // cash, health, reputation, workAbility, luck
  rank: Rank;
  actualSalary: number;
  score: number;

  // 游戏进度
  status: GameStatus;
  endReason: EndReason | null;
  currentQuarter: number;
  phase: GamePhase;

  // 材料系统（完整）
  inventory: Record<MaterialType, number>;              // 持仓数量
  materialPrices: Record<MaterialType, MaterialPrice>;  // 当前价格+趋势
  materialPriceHistory: Record<MaterialType, number[]>; // 历史价格曲线
  nextQuarterRealPrices: Record<MaterialType, number> | null;
  pricePredictions: Record<MaterialType, PricePrediction> | null;

  // 关系系统
  relationships: Record<RelationshipType, number>;

  // 项目状态
  projectProgress: number;
  projectQuality: number;
  projectCompletedThisQuarter: boolean;

  // 团队系统
  team: TeamState;

  // 事件系统
  quarterEvents: DecisionEvent[];
  currentEventIndex: number;
  completedEventResults: EventResult[];
  eventHistory: EventCard[];
  allEventHistory: EventResult[];
  currentEvent: EventCard | null;
  pendingEvents: EventCard[];

  // 行动系统
  actionPoints: number;
  maxActionPoints: number;
  actionsThisQuarter: number;
  actionsSinceLastEventCheck: number;

  // 训练系统
  trainingCooldowns: {
    basic_work: number;
    advanced_work: number;
    basic_luck: number;
    advanced_luck: number;
  };

  // 特殊效果
  pricePredictionBonus: number;
  storageFeeDiscount: number;
  qualityProjectJustCompleted: boolean;

  // 游戏统计
  gameStats: GameStats;

  // LLM相关
  specialEventCount: number;
}
```

**排除字段**（不保存的 UI 临时状态）：
- `isLLMEnhancing`
- `showEventResult`
- `pendingEventResult`
- `currentSettlement`

---

## 4. 后端 API 设计

### 4.1 保存存档

**端点**：`POST /api/saves/save`

**请求体**：
```json
{
  "deviceId": "uuid-xxx",
  "runId": "run-xxx",
  "gameState": { /* SaveGameState */ }
}
```

**响应**：
```json
{
  "success": true,
  "slotId": 1,
  "message": "存档保存成功"
}
```

**保存逻辑**：
1. 查询 `deviceId` 的现有存档
2. 如果没有存档 → 创建 slot1
3. 如果有存档：
   - 读取 slot1 的 `run_id`
   - 如果 `run_id` 相同 → 更新 slot1（UPDATE）
   - 如果 `run_id` 不同 → slot1 复制到 slot2，新游戏存到 slot1
4. 更新 `updated_at` 时间戳
5. 提取关键信息存到表字段（player_name, rank, current_quarter 等）

### 4.2 获取存档列表

**端点**：`GET /api/saves/list?deviceId=xxx`

**响应**：
```json
{
  "success": true,
  "saves": [
    {
      "slotId": 1,
      "runId": "run-xxx",
      "playerName": "张三",
      "rank": "工程师",
      "currentQuarter": 12,
      "updatedAt": "2026-01-28T10:30:00Z",
      "hasSlot": true
    },
    {
      "slotId": 2,
      "hasSlot": false
    }
  ]
}
```

### 4.3 加载存档

**端点**：`POST /api/saves/load`

**请求体**：
```json
{
  "deviceId": "uuid-xxx",
  "slotId": 1
}
```

**响应**：
```json
{
  "success": true,
  "gameState": { /* SaveGameState */ }
}
```

---

## 5. 前端实现

### 5.1 Store 扩展 (gameStoreNew.ts)

**新增方法**：

```typescript
interface GameStore {
  // ... 现有方法

  saveGame: () => Promise<{ success: boolean; slotId?: number; error?: string }>;
  loadGame: (slotId: number) => Promise<{ success: boolean; error?: string }>;
  getSavesList: () => Promise<{ success: boolean; saves: SaveSlot[] }>;
}
```

**saveGame() 实现**：
```typescript
saveGame: async () => {
  const state = get();

  const saveData: SaveGameState = {
    playerName: state.playerName,
    playerGender: state.playerGender,
    runId: state.runId,
    deviceId: state.deviceId,
    stats: state.stats,
    rank: state.rank,
    actualSalary: state.actualSalary,
    score: state.score,
    status: state.status,
    endReason: state.endReason,
    currentQuarter: state.currentQuarter,
    phase: state.phase,
    inventory: state.inventory,
    materialPrices: state.materialPrices,
    materialPriceHistory: state.materialPriceHistory,
    nextQuarterRealPrices: state.nextQuarterRealPrices,
    pricePredictions: state.pricePredictions,
    relationships: state.relationships,
    projectProgress: state.projectProgress,
    projectQuality: state.projectQuality,
    projectCompletedThisQuarter: state.projectCompletedThisQuarter,
    team: state.team,
    quarterEvents: state.quarterEvents,
    currentEventIndex: state.currentEventIndex,
    completedEventResults: state.completedEventResults,
    eventHistory: state.eventHistory,
    allEventHistory: state.allEventHistory,
    currentEvent: state.currentEvent,
    pendingEvents: state.pendingEvents,
    actionPoints: state.actionPoints,
    maxActionPoints: state.maxActionPoints,
    actionsThisQuarter: state.actionsThisQuarter,
    actionsSinceLastEventCheck: state.actionsSinceLastEventCheck,
    trainingCooldowns: state.trainingCooldowns,
    pricePredictionBonus: state.pricePredictionBonus,
    storageFeeDiscount: state.storageFeeDiscount,
    qualityProjectJustCompleted: state.qualityProjectJustCompleted,
    gameStats: state.gameStats,
    specialEventCount: state.specialEventCount,
  };

  try {
    const response = await fetch('/api/saves/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deviceId: state.deviceId,
        runId: state.runId,
        gameState: saveData,
      }),
    });
    return await response.json();
  } catch (error) {
    // 失败时备份到 localStorage
    localStorage.setItem('game_backup', JSON.stringify(saveData));
    return { success: false, error: '网络错误，已保存到本地' };
  }
},
```

**loadGame() 实现**：
```typescript
loadGame: async (slotId: number) => {
  const deviceId = get().deviceId;

  try {
    const response = await fetch('/api/saves/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, slotId }),
    });

    const result = await response.json();

    if (result.success) {
      // 验证必需字段
      if (!result.gameState.runId || !result.gameState.stats) {
        throw new Error('存档数据不完整');
      }

      // 恢复完整游戏状态
      set({
        ...result.gameState,
        // 重置UI临时状态
        isLLMEnhancing: false,
        showEventResult: false,
        pendingEventResult: null,
        currentSettlement: null,
      });

      return { success: true };
    }

    return result;
  } catch (error) {
    console.error('加载存档失败:', error);
    return {
      success: false,
      error: '存档已损坏或网络错误'
    };
  }
},
```

### 5.2 首页改造 (Home.tsx)

**新增状态**：
```typescript
const [savesList, setSavesList] = useState<any>(null);
const [showLoadMenu, setShowLoadMenu] = useState(false);
const getSavesList = useGameStoreNew((state) => state.getSavesList);
const loadGame = useGameStoreNew((state) => state.loadGame);

useEffect(() => {
  getSavesList().then(result => {
    if (result.success) {
      setSavesList(result.saves);
    }
  });
}, []);

const hasSlot1 = savesList?.saves?.[0]?.hasSlot;
const hasSlot2 = savesList?.saves?.[1]?.hasSlot;
```

**UI 改造**：
```tsx
{/* 继续游戏按钮（slot1有存档时显示） */}
{hasSlot1 && (
  <button onClick={handleContinue}>
    继续游戏
    <div className="text-xs">
      {savesList.saves[0].playerName} | {savesList.saves[0].rank} |
      第{savesList.saves[0].currentQuarter}季度
    </div>
  </button>
)}

{/* 新游戏按钮 */}
<button onClick={() => navigate('/character-creation')}>
  {hasSlot1 ? '开始新游戏' : '开始游戏'}
</button>

{/* 读取存档按钮 */}
{(hasSlot1 || hasSlot2) && (
  <button onClick={() => setShowLoadMenu(true)}>
    读取存档
  </button>
)}

{/* 存档选择弹窗 */}
{showLoadMenu && (
  <div className="modal">
    {hasSlot1 && (
      <SaveSlotCard
        slot={savesList.saves[0]}
        onLoad={() => handleLoad(1)}
      />
    )}
    {hasSlot2 && (
      <SaveSlotCard
        slot={savesList.saves[1]}
        onLoad={() => handleLoad(2)}
      />
    )}
    <button onClick={() => setShowLoadMenu(false)}>取消</button>
  </div>
)}
```

**事件处理**：
```typescript
const handleContinue = async () => {
  const result = await loadGame(1);
  if (result.success) {
    navigate('/game-new');
  } else {
    alert(result.error || '加载失败');
  }
};

const handleLoad = async (slotId: number) => {
  const result = await loadGame(slotId);
  if (result.success) {
    setShowLoadMenu(false);
    navigate('/game-new');
  } else {
    alert(result.error || '加载失败');
  }
};
```

### 5.3 退出监听 (App.tsx)

**监听页面卸载**：
```typescript
useEffect(() => {
  const handleBeforeUnload = () => {
    const state = useGameStoreNew.getState();
    if (state.status === GameStatus.PLAYING && state.runId) {
      // 使用 sendBeacon 确保发送成功
      const saveData = {
        deviceId: state.deviceId,
        runId: state.runId,
        gameState: { /* ... */ },
      };
      navigator.sendBeacon(
        '/api/saves/save',
        JSON.stringify(saveData)
      );
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, []);
```

**监听导航到首页**：
```typescript
const location = useLocation();
const prevLocation = useRef(location.pathname);

useEffect(() => {
  if (prevLocation.current !== '/' && location.pathname === '/') {
    const state = useGameStoreNew.getState();
    if (state.status === GameStatus.PLAYING && state.runId) {
      state.saveGame();
    }
  }
  prevLocation.current = location.pathname;
}, [location.pathname]);
```

---

## 6. 错误处理和边界情况

### 6.1 存档损坏

**场景**：JSON 解析失败、必需字段缺失

**处理**：
- 加载时验证 `runId` 和 `stats` 等必需字段
- 验证失败提示"存档已损坏，请开始新游戏"

### 6.2 网络失败

**场景**：保存/加载时网络断开

**处理**：
- 保存失败时备份到 `localStorage`
- 加载失败时提示错误信息

### 6.3 deviceId 缺失

**场景**：新用户首次访问

**处理**：
- `startGame()` 时检查并生成 `deviceId`
- 确保所有存档操作前 `deviceId` 已存在

### 6.4 存档冲突

**场景**：多设备同时玩（理论上不会发生，因为 deviceId 不同）

**处理**：
- 基于 `updated_at` 时间戳，后保存的覆盖先保存的
- 不做冲突检测，保持简单

### 6.5 游戏版本兼容性

**未来扩展**：
- 在表中添加 `version` 字段
- 加载时检查版本，不兼容则提示
- 或提供迁移脚本转换旧存档

---

## 7. 实现计划

### 7.1 后端实现

1. 创建 `game_saves` 表和索引
2. 实现 `/api/saves/save` 接口
3. 实现 `/api/saves/list` 接口
4. 实现 `/api/saves/load` 接口
5. 测试存档逻辑（同一局更新，不同局复制）

### 7.2 前端实现

1. 扩展 `gameStoreNew` 添加存档方法
2. 改造首页 UI（继续游戏、读档按钮）
3. 实现存档选择弹窗组件
4. 添加退出监听（页面卸载 + 导航）
5. 测试完整流程

### 7.3 测试验证

1. 测试保存 → 加载流程
2. 测试同一局多次保存
3. 测试新游戏时 slot1 → slot2
4. 测试网络失败场景
5. 测试存档损坏恢复

---

## 8. 技术亮点

1. **无账号体系**：基于 deviceId，用户无感知
2. **完整状态保存**：包括价格历史、事件进度，加载后无缝继续
3. **双重保险**：页面卸载 + 导航监听，确保不丢失进度
4. **智能槽位管理**：自动维护最新和次新两个存档
5. **降级方案**：网络失败时备份到 localStorage

---

## 9. 未来优化

1. **云端同步**：增加账号体系，支持跨设备同步
2. **存档管理**：支持手动删除、重命名存档
3. **自动保存频率**：增加定期自动保存（每N分钟）
4. **存档预览**：读档界面显示更多信息（截图、统计）
5. **版本迁移**：游戏更新时自动迁移旧存档

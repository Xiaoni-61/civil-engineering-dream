# 自动存档系统实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 实现基于后端的自动存档系统，支持 2 个存档槽位，玩家可在首页选择继续游戏、开始新游戏或读取存档。

**架构:** 后端 SQLite 存储 + 前端 Zustand Store 扩展。后端提供保存/列表/加载三个 API，前端在首页显示存档选项并监听退出事件触发自动保存。

**技术栈:**
- 后端: Express + TypeScript + SQLite (better-sqlite3)
- 前端: React 18 + Zustand 4 + React Router 6
- 类型: shared/types 共享类型定义

---

## Task 1: 创建存档相关类型定义

**Files:**
- Create: `shared/types/save.ts`

**Step 1: 定义存档状态类型**

```typescript
/**
 * 存档游戏状态（完整游戏数据，用于保存/加载）
 */
export interface SaveGameState {
  // 玩家基础信息
  playerName: string;
  playerGender: 'male' | 'female';
  runId: string;
  deviceId: string;

  // 核心数值
  stats: PlayerStats;
  rank: Rank;
  actualSalary: number;
  score: number;

  // 游戏进度
  status: GameStatus;
  endReason: EndReason | null;
  currentQuarter: number;
  phase: GamePhase;

  // 材料系统
  inventory: Record<MaterialType, number>;
  materialPrices: Record<MaterialType, MaterialPrice>;
  materialPriceHistory: Record<MaterialType, number[]>;
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

/**
 * 存档槽位信息（用于列表展示）
 */
export interface SaveSlot {
  slotId: 1 | 2;
  hasSlot: boolean;
  runId?: string;
  playerName?: string;
  rank?: string;
  currentQuarter?: number;
  updatedAt?: string; // ISO timestamp
}

/**
 * 保存存档请求
 */
export interface SaveGameRequest {
  deviceId: string;
  runId: string;
  gameState: SaveGameState;
}

/**
 * 保存存档响应
 */
export interface SaveGameResponse {
  success: boolean;
  slotId?: number;
  message?: string;
  error?: string;
}

/**
 * 获取存档列表响应
 */
export interface GetSavesListResponse {
  success: boolean;
  saves: SaveSlot[];
  error?: string;
}

/**
 * 加载存档请求
 */
export interface LoadGameRequest {
  deviceId: string;
  slotId: number;
}

/**
 * 加载存档响应
 */
export interface LoadGameResponse {
  success: boolean;
  gameState?: SaveGameState;
  error?: string;
}
```

**Step 2: 导出相关类型**

```typescript
// 在 shared/types/save.ts 顶部导入
import { PlayerStats } from './player';
import { Rank, GameStatus, EndReason, GamePhase, MaterialType, MaterialPrice, GameStats } from './game';
import { TeamState } from './team';
import { DecisionEvent, EventResult } from '../frontend/data/events/eventTypes';
import { EventCard } from './event';

// 重新导出 PricePrediction 类型（如果存在）
export interface PricePrediction {
  predictedPrice: number;
  accuracy: number;
  confidence: number;
}
```

**Step 3: 更新 shared/types/index.ts**

```typescript
// 添加到 shared/types/index.ts
export * from './save';
```

**Step 4: 运行类型检查**

```bash
cd frontend && npm run lint
cd backend && npm run lint
```

预期: 通过类型检查（新类型不会影响现有代码）

**Step 5: 提交**

```bash
git add shared/types/save.ts shared/types/index.ts
git commit -m "feat: add save system type definitions"
```

---

## Task 2: 创建数据库表结构

**Files:**
- Modify: `backend/src/database/init.ts:110-170` (在创建表区域添加)

**Step 1: 添加 game_saves 表创建语句**

在 `initDatabase()` 函数的 `db.serialize()` 回调中，在 `event_usage_log` 表创建后添加：

```typescript
// 游戏存档表
db.run(`
  CREATE TABLE IF NOT EXISTS game_saves (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    slot_id INTEGER NOT NULL,
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
  )
`);

// 为存档表创建索引
db.run(`CREATE INDEX IF NOT EXISTS idx_saves_device
        ON game_saves(device_id, updated_at DESC)`);
```

**Step 2: 重启后端服务验证表创建**

```bash
cd backend && npm run dev
```

预期: 控制台显示 "✅ 数据库表创建成功"，无错误信息

**Step 3: 验证表结构**

```bash
sqlite3 backend/data/game.db ".schema game_saves"
```

预期: 显示完整的表结构和索引定义

**Step 4: 提交**

```bash
git add backend/src/database/init.ts
git commit -m "feat: add game_saves table and index"
```

---

## Task 3: 实现后端保存存档 API

**Files:**
- Create: `backend/src/api/saves.ts`

**Step 1: 创建 saves router 文件**

```typescript
import { Router, Request, Response } from 'express';
import { Database } from '../database/init.js';
import type { SaveGameRequest, SaveGameResponse } from '@shared/types/save';

export function createSavesRouter(db: Database): Router {
  const router = Router();

  /**
   * POST /api/saves/save
   * 保存游戏存档
   */
  router.post('/save', async (req: Request, res: Response) => {
    try {
      const { deviceId, runId, gameState }: SaveGameRequest = req.body;

      // 验证必需字段
      if (!deviceId || !runId || !gameState) {
        return res.status(400).json({
          success: false,
          error: '缺少必需字段: deviceId, runId, gameState',
        } as SaveGameResponse);
      }

      // 查询现有存档
      const existingSaves = await db.all<any>(
        'SELECT * FROM game_saves WHERE device_id = ? ORDER BY slot_id',
        [deviceId]
      );

      const now = new Date().toISOString();
      let targetSlotId = 1;

      if (existingSaves.length === 0) {
        // 没有存档，创建 slot1
        await db.run(
          `INSERT INTO game_saves (
            device_id, slot_id, run_id, player_name, player_gender,
            current_quarter, rank, status, game_state, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            deviceId,
            1,
            runId,
            gameState.playerName || '匿名玩家',
            gameState.playerGender || 'male',
            gameState.currentQuarter,
            gameState.rank,
            gameState.status,
            JSON.stringify(gameState),
            now,
            now,
          ]
        );
      } else {
        // 有存档，检查 slot1 的 run_id
        const slot1 = existingSaves.find((s: any) => s.slot_id === 1);

        if (slot1 && slot1.run_id === runId) {
          // 同一局游戏，更新 slot1
          await db.run(
            `UPDATE game_saves SET
              run_id = ?, player_name = ?, player_gender = ?,
              current_quarter = ?, rank = ?, status = ?, game_state = ?, updated_at = ?
            WHERE device_id = ? AND slot_id = 1`,
            [
              runId,
              gameState.playerName || '匿名玩家',
              gameState.playerGender || 'male',
              gameState.currentQuarter,
              gameState.rank,
              gameState.status,
              JSON.stringify(gameState),
              now,
              deviceId,
            ]
          );
        } else {
          // 不同局游戏，slot1 → slot2，新游戏存到 slot1
          // 先复制 slot1 到 slot2
          if (slot1) {
            await db.run(
              `INSERT OR REPLACE INTO game_saves (
                device_id, slot_id, run_id, player_name, player_gender,
                current_quarter, rank, status, game_state, created_at, updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                deviceId,
                2,
                slot1.run_id,
                slot1.player_name,
                slot1.player_gender,
                slot1.current_quarter,
                slot1.rank,
                slot1.status,
                slot1.game_state,
                slot1.created_at,
                slot1.updated_at,
              ]
            );
          }

          // 然后更新 slot1
          await db.run(
            `INSERT OR REPLACE INTO game_saves (
              device_id, slot_id, run_id, player_name, player_gender,
              current_quarter, rank, status, game_state, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              deviceId,
              1,
              runId,
              gameState.playerName || '匿名玩家',
              gameState.playerGender || 'male',
              gameState.currentQuarter,
              gameState.rank,
              gameState.status,
              JSON.stringify(gameState),
              now,
              now,
            ]
          );
        }
      }

      res.status(200).json({
        success: true,
        slotId: targetSlotId,
        message: '存档保存成功',
      } as SaveGameResponse);
    } catch (error) {
      console.error('❌ 保存存档错误:', error);
      res.status(500).json({
        success: false,
        error: (error as Error).message || '服务器错误',
      } as SaveGameResponse);
    }
  });

  return router;
}
```

**Step 2: 在后端入口注册路由**

修改 `backend/src/index.ts`：

```typescript
// 在顶部导入
import { createSavesRouter } from './api/saves.js';

// 在 API 路由区域添加
app.use('/api/saves', createSavesRouter(db));

// 在启动日志中添加
// - 保存存档: POST /api/saves/save
```

**Step 3: 启动后端服务**

```bash
cd backend && npm run dev
```

预期: 启动日志中显示 `/api/saves` 路由已注册

**Step 4: 测试 API（手动测试）**

```bash
curl -X POST http://localhost:3001/api/saves/save \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-001",
    "runId": "test-run-001",
    "gameState": {
      "playerName": "测试玩家",
      "playerGender": "male",
      "runId": "test-run-001",
      "deviceId": "test-device-001",
      "stats": {"cash": 10000, "health": 100, "reputation": 50, "workAbility": 50, "luck": 50},
      "rank": "intern",
      "actualSalary": 9000,
      "score": 0,
      "status": "playing",
      "endReason": null,
      "currentQuarter": 1,
      "phase": "early",
      "inventory": {"cement": 0, "steel": 0, "sand": 0, "concrete": 0},
      "materialPrices": {},
      "materialPriceHistory": {"cement": [], "steel": [], "sand": [], "concrete": []},
      "nextQuarterRealPrices": null,
      "pricePredictions": null,
      "relationships": {"client": 50, "supervision": 50, "design": 50, "labor": 50, "government": 50},
      "projectProgress": 0,
      "projectQuality": 50,
      "projectCompletedThisQuarter": false,
      "team": {"members": [], "leadership": 0},
      "quarterEvents": [],
      "currentEventIndex": 0,
      "completedEventResults": [],
      "eventHistory": [],
      "allEventHistory": [],
      "currentEvent": null,
      "pendingEvents": [],
      "actionPoints": 10,
      "maxActionPoints": 10,
      "actionsThisQuarter": 0,
      "actionsSinceLastEventCheck": 0,
      "trainingCooldowns": {"basic_work": 0, "advanced_work": 0, "basic_luck": 0, "advanced_luck": 0},
      "pricePredictionBonus": 0,
      "storageFeeDiscount": 0,
      "qualityProjectJustCompleted": false,
      "gameStats": {"completedProjects": 0, "qualityProjects": 0, "totalQuarters": 0, "totalEvents": 0},
      "specialEventCount": 0
    }
  }'
```

预期: 返回 `{"success":true,"slotId":1,"message":"存档保存成功"}`

**Step 5: 验证数据库数据**

```bash
sqlite3 backend/data/game.db "SELECT slot_id, run_id, player_name, current_quarter FROM game_saves"
```

预期: 显示一条存档记录

**Step 6: 提交**

```bash
git add backend/src/api/saves.ts backend/src/index.ts
git commit -m "feat: implement save game API endpoint"
```

---

## Task 4: 实现后端获取存档列表 API

**Files:**
- Modify: `backend/src/api/saves.ts` (在 createSavesRouter 函数中添加)

**Step 1: 添加获取存档列表路由**

在 `createSavesRouter()` 函数中，`/save` 路由后添加：

```typescript
/**
 * GET /api/saves/list?deviceId=xxx
 * 获取存档列表
 */
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.query;

    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({
        success: false,
        error: '缺少必需参数: deviceId',
      });
    }

    // 查询该设备的所有存档
    const saves = await db.all<any>(
      'SELECT * FROM game_saves WHERE device_id = ? ORDER BY slot_id',
      [deviceId]
    );

    // 构建返回结果（始终返回 2 个槽位）
    const slot1 = saves.find((s: any) => s.slot_id === 1);
    const slot2 = saves.find((s: any) => s.slot_id === 2);

    const result = [
      {
        slotId: 1,
        hasSlot: !!slot1,
        runId: slot1?.run_id,
        playerName: slot1?.player_name,
        rank: slot1?.rank,
        currentQuarter: slot1?.current_quarter,
        updatedAt: slot1?.updated_at,
      },
      {
        slotId: 2,
        hasSlot: !!slot2,
        runId: slot2?.run_id,
        playerName: slot2?.player_name,
        rank: slot2?.rank,
        currentQuarter: slot2?.current_quarter,
        updatedAt: slot2?.updated_at,
      },
    ];

    res.status(200).json({
      success: true,
      saves: result,
    });
  } catch (error) {
    console.error('❌ 获取存档列表错误:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || '服务器错误',
    });
  }
});
```

**Step 2: 重启后端服务**

```bash
cd backend && npm run dev
```

**Step 3: 测试 API**

```bash
curl "http://localhost:3001/api/saves/list?deviceId=test-device-001"
```

预期: 返回存档列表，slot1 有数据

**Step 4: 提交**

```bash
git add backend/src/api/saves.ts
git commit -m "feat: implement get saves list API endpoint"
```

---

## Task 5: 实现后端加载存档 API

**Files:**
- Modify: `backend/src/api/saves.ts` (在 createSavesRouter 函数中添加)

**Step 1: 添加加载存档路由**

在 `createSavesRouter()` 函数中，`/list` 路由后添加：

```typescript
/**
 * POST /api/saves/load
 * 加载存档
 */
router.post('/load', async (req: Request, res: Response) => {
  try {
    const { deviceId, slotId } = req.body;

    // 验证必需字段
    if (!deviceId || !slotId) {
      return res.status(400).json({
        success: false,
        error: '缺少必需字段: deviceId, slotId',
      });
    }

    // 查询存档
    const save = await db.get<any>(
      'SELECT * FROM game_saves WHERE device_id = ? AND slot_id = ?',
      [deviceId, slotId]
    );

    if (!save) {
      return res.status(404).json({
        success: false,
        error: '存档不存在',
      });
    }

    // 解析游戏状态
    let gameState;
    try {
      gameState = JSON.parse(save.game_state);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '存档数据损坏',
      });
    }

    // 验证必需字段
    if (!gameState.runId || !gameState.stats) {
      return res.status(500).json({
        success: false,
        error: '存档数据不完整',
      });
    }

    res.status(200).json({
      success: true,
      gameState,
    });
  } catch (error) {
    console.error('❌ 加载存档错误:', error);
    res.status(500).json({
      success: false,
      error: (error as Error).message || '服务器错误',
    });
  }
});
```

**Step 2: 重启后端服务**

```bash
cd backend && npm run dev
```

**Step 3: 测试 API**

```bash
curl -X POST http://localhost:3001/api/saves/load \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-device-001", "slotId": 1}'
```

预期: 返回完整的 gameState 对象

**Step 4: 测试错误情况（空槽位）**

```bash
curl -X POST http://localhost:3001/api/saves/load \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "test-device-001", "slotId": 2}'
```

预期: 返回 `{"success":false,"error":"存档不存在"}`

**Step 5: 提交**

```bash
git add backend/src/api/saves.ts
git commit -m "feat: implement load game API endpoint"
```

---

## Task 6: 前端扩展 gameStoreNew 添加 saveGame 方法

**Files:**
- Modify: `frontend/src/store/gameStoreNew.ts` (在 GameStore interface 中添加方法)

**Step 1: 在 GameStore interface 中添加方法签名**

找到 `interface GameStore` 定义，在最后添加：

```typescript
interface GameStore {
  // ... 现有方法

  // 存档系统
  saveGame: () => Promise<{ success: boolean; slotId?: number; error?: string }>;
  loadGame: (slotId: number) => Promise<{ success: boolean; error?: string }>;
  getSavesList: () => Promise<{ success: boolean; saves: SaveSlot[] }>;
}
```

**Step 2: 在 create 函数中实现 saveGame 方法**

在 `create<GameStore>((set, get) => ({` 的返回对象中添加：

```typescript
saveGame: async () => {
  const state = get();

  // 确保 deviceId 和 runId 存在
  if (!state.deviceId || !state.runId) {
    return { success: false, error: '设备ID或游戏ID不存在' };
  }

  // 构建保存数据（排除 UI 临时状态）
  const saveData: any = {
    playerName: state.playerName,
    playerGender: state.playerGender,
    runId: state.runId,
    deviceId: state.deviceId,
    stats: { ...state.stats },
    rank: state.rank,
    actualSalary: state.actualSalary,
    score: state.score,
    status: state.status,
    endReason: state.endReason,
    currentQuarter: state.currentQuarter,
    phase: state.phase,
    inventory: { ...state.inventory },
    materialPrices: JSON.parse(JSON.stringify(state.materialPrices)),
    materialPriceHistory: JSON.parse(JSON.stringify(state.materialPriceHistory)),
    nextQuarterRealPrices: state.nextQuarterRealPrices ? { ...state.nextQuarterRealPrices } : null,
    pricePredictions: state.pricePredictions ? JSON.parse(JSON.stringify(state.pricePredictions)) : null,
    relationships: { ...state.relationships },
    projectProgress: state.projectProgress,
    projectQuality: state.projectQuality,
    projectCompletedThisQuarter: state.projectCompletedThisQuarter,
    team: JSON.parse(JSON.stringify(state.team)),
    quarterEvents: JSON.parse(JSON.stringify(state.quarterEvents)),
    currentEventIndex: state.currentEventIndex,
    completedEventResults: JSON.parse(JSON.stringify(state.completedEventResults)),
    eventHistory: JSON.parse(JSON.stringify(state.eventHistory)),
    allEventHistory: JSON.parse(JSON.stringify(state.allEventHistory)),
    currentEvent: state.currentEvent ? JSON.parse(JSON.stringify(state.currentEvent)) : null,
    pendingEvents: JSON.parse(JSON.stringify(state.pendingEvents)),
    actionPoints: state.actionPoints,
    maxActionPoints: state.maxActionPoints,
    actionsThisQuarter: state.actionsThisQuarter,
    actionsSinceLastEventCheck: state.actionsSinceLastEventCheck,
    trainingCooldowns: { ...state.trainingCooldowns },
    pricePredictionBonus: state.pricePredictionBonus,
    storageFeeDiscount: state.storageFeeDiscount,
    qualityProjectJustCompleted: state.qualityProjectJustCompleted,
    gameStats: { ...state.gameStats },
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

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('保存存档失败:', error);
    // 失败时备份到 localStorage
    localStorage.setItem('game_backup', JSON.stringify(saveData));
    return { success: false, error: '网络错误，已保存到本地' };
  }
},
```

**Step 3: 添加类型导入**

在文件顶部添加：

```typescript
import type { SaveSlot } from '@shared/types/save';
```

**Step 4: 运行类型检查**

```bash
cd frontend && npm run lint
```

预期: 无错误

**Step 5: 提交**

```bash
git add frontend/src/store/gameStoreNew.ts
git commit -m "feat: add saveGame method to gameStoreNew"
```

---

## Task 7: 前端实现 loadGame 和 getSavesList 方法

**Files:**
- Modify: `frontend/src/store/gameStoreNew.ts` (在 create 返回对象中添加方法)

**Step 1: 实现 getSavesList 方法**

在 `saveGame` 方法后添加：

```typescript
getSavesList: async () => {
  const state = get();

  if (!state.deviceId) {
    return { success: false, saves: [] };
  }

  try {
    const response = await fetch(`/api/saves/list?deviceId=${encodeURIComponent(state.deviceId)}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('获取存档列表失败:', error);
    return { success: false, saves: [] };
  }
},
```

**Step 2: 实现 loadGame 方法**

在 `getSavesList` 方法后添加：

```typescript
loadGame: async (slotId: number) => {
  const state = get();

  if (!state.deviceId) {
    return { success: false, error: '设备ID不存在' };
  }

  try {
    const response = await fetch('/api/saves/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: state.deviceId, slotId }),
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
        // 重置 UI 临时状态
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

**Step 3: 运行类型检查**

```bash
cd frontend && npm run lint
```

预期: 无错误

**Step 4: 提交**

```bash
git add frontend/src/store/gameStoreNew.ts
git commit -m "feat: add loadGame and getSavesList methods to gameStoreNew"
```

---

## Task 8: 创建存档选择组件

**Files:**
- Create: `frontend/src/components/SaveSlotModal.tsx`

**Step 1: 创建存档槽位卡片组件**

```typescript
import React from 'react';
import type { SaveSlot } from '@shared/types/save';

interface SaveSlotCardProps {
  slot: SaveSlot;
  onLoad: () => void;
}

export const SaveSlotCard: React.FC<SaveSlotCardProps> = ({ slot, onLoad }) => {
  if (!slot.hasSlot) {
    return (
      <div className="bg-slate-100 rounded-lg p-4 border-2 border-dashed border-slate-300 opacity-50">
        <div className="text-center text-slate-400">空槽位</div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const rankNameMap: Record<string, string> = {
    'intern': '实习生',
    'assistant_engineer': '助理工程师',
    'engineer': '工程师',
    'senior_engineer': '高级工程师',
    'project_manager': '项目经理',
    'project_director': '项目总监',
    'partner': '合伙人',
  };

  return (
    <button
      onClick={onLoad}
      className="w-full bg-white rounded-lg p-4 border-2 border-brand-200 hover:border-brand-500 hover:shadow-lg transition-all text-left"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500">槽位 {slot.slotId}</span>
        <span className="text-xs text-slate-400">{formatDate(slot.updatedAt)}</span>
      </div>
      <div className="font-bold text-lg text-slate-800 mb-1">{slot.playerName}</div>
      <div className="text-sm text-slate-600 space-y-1">
        <div>职级: {rankNameMap[slot.rank || 'intern'] || slot.rank}</div>
        <div>进度: 第 {slot.currentQuarter} 季度</div>
      </div>
    </button>
  );
};

interface SaveSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  saves: SaveSlot[];
  onLoad: (slotId: number) => void;
}

export const SaveSlotModal: React.FC<SaveSlotModalProps> = ({
  isOpen,
  onClose,
  saves,
  onLoad,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-feishu-lg p-6 max-w-md w-full shadow-feishu-xl animate-scale-in">
        <h2 className="text-xl font-bold text-slate-800 mb-4">选择存档</h2>
        <div className="space-y-3 mb-4">
          {saves.map((slot) => (
            <SaveSlotCard
              key={slot.slotId}
              slot={slot}
              onLoad={() => onLoad(slot.slotId)}
            />
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
};
```

**Step 2: 运行类型检查**

```bash
cd frontend && npm run lint
```

预期: 无错误

**Step 3: 提交**

```bash
git add frontend/src/components/SaveSlotModal.tsx
git commit -m "feat: add SaveSlotModal component"
```

---

## Task 9: 改造首页添加存档功能

**Files:**
- Modify: `frontend/src/pages/Home.tsx`

**Step 1: 替换整个 Home.tsx 文件**

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStoreNew } from '@/store/gameStoreNew';
import { SaveSlotModal } from '@/components/SaveSlotModal';
import type { SaveSlot } from '@shared/types/save';

const Home = () => {
  const navigate = useNavigate();
  const saveGame = useGameStoreNew((state) => state.saveGame);
  const loadGame = useGameStoreNew((state) => state.loadGame);
  const getSavesList = useGameStoreNew((state) => state.getSavesList);

  const [savesList, setSavesList] = useState<SaveSlot[]>([]);
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  useEffect(() => {
    // 页面加载时获取存档列表
    getSavesList().then((result) => {
      if (result.success) {
        setSavesList(result.saves);
      }
    });
  }, [getSavesList]);

  const hasSlot1 = savesList.find((s) => s.slotId === 1)?.hasSlot;
  const hasSlot2 = savesList.find((s) => s.slotId === 2)?.hasSlot;
  const slot1Data = savesList.find((s) => s.slotId === 1);
  const slot2Data = savesList.find((s) => s.slotId === 2);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* 顶部装饰 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-engineering-safety to-brand-600"></div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* 主标题区域 */}
          <div className="text-center mb-12 animate-fade-in">
            {/* 图标 */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-feishu-lg shadow-feishu-lg mb-6">
              <span className="text-5xl">🏗️</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 bg-clip-text text-transparent">
              还我一个土木梦
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-3 font-medium">
              体验土木工程师的职业生涯
            </p>

            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto">
              在这个模拟经营游戏中，你将面对真实的工程挑战，在压力与梦想之间寻找平衡
            </p>
          </div>

          {/* 卡片容器 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* 继续游戏按钮（slot1有存档时显示） */}
            {hasSlot1 && (
              <button
                onClick={handleContinue}
                className="group relative bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-300 rounded-feishu-lg p-6 shadow-feishu hover:shadow-feishu-xl transition-all duration-300 text-left overflow-hidden animate-slide-up cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:scale-[0.98]"
                style={{ animationDelay: '0.05s' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-feishu flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      ▶️
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                        继续游戏
                      </h2>
                      <p className="text-sm text-emerald-600 font-medium">Continue</p>
                    </div>
                  </div>
                  <div className="text-emerald-500 group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
                {slot1Data && (
                  <div className="text-sm text-slate-600 space-y-1">
                    <div><strong>{slot1Data.playerName}</strong> | 第 {slot1Data.currentQuarter} 季度</div>
                    <div className="text-xs text-slate-500">{slot1Data.rank}</div>
                  </div>
                )}
              </button>
            )}

            {/* 开始游戏按钮 */}
            <button
              onClick={() => navigate('/character-creation')}
              className={`group relative bg-gradient-to-br from-brand-50 to-engineering-50 border-2 border-brand-200 rounded-feishu-lg p-8 shadow-feishu hover:shadow-feishu-xl transition-all duration-300 text-left overflow-hidden animate-slide-up cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-[0.98] ${!hasSlot1 ? 'md:col-span-2' : ''}`}
              style={{ animationDelay: '0.1s' }}
            >
              {/* 背景装饰 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-100 to-transparent rounded-bl-full opacity-30 group-hover:scale-110 transition-transform duration-300"></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-engineering-500 rounded-feishu flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {hasSlot1 ? '🆕' : '🎮'}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                        {hasSlot1 ? '开始新游戏' : '开始游戏'}
                      </h2>
                      <p className="text-sm text-brand-600 font-medium">New Game System</p>
                    </div>
                  </div>
                  <div className="text-brand-500 group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>

                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  <strong>新玩法体验：</strong>行动点制、团队管理、策略深化
                  <br />
                  <span className="text-slate-500">从实习生晋升到合伙人的职业之旅</span>
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium border border-brand-200">
                    ⚡ 行动点
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                    👥 团队管理
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                    📈 职业晋升
                  </span>
                </div>
              </div>
            </button>

            {/* 读取存档按钮 */}
            {(hasSlot1 || hasSlot2) && (
              <button
                onClick={() => setShowLoadMenu(true)}
                className="group relative bg-white rounded-feishu-lg p-8 shadow-feishu hover:shadow-feishu-xl transition-all duration-300 text-left overflow-hidden animate-slide-up cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 active:scale-[0.98]"
                style={{ animationDelay: '0.15s' }}
              >
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-200 rounded-feishu flex items-center justify-center text-2xl group-hover:bg-slate-300 transition-colors">
                        💾
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-600 group-hover:text-slate-800 transition-colors">
                          读取存档
                        </h2>
                        <p className="text-sm text-slate-500">Load Game</p>
                      </div>
                    </div>
                    <div className="text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all">
                      →
                    </div>
                  </div>

                  <p className="text-slate-500 text-sm">
                    选择要加载的存档槽位
                  </p>
                </div>
              </button>
            )}

            {/* 排行榜卡片 */}
            <button
              onClick={() => navigate('/leaderboard')}
              className="group relative bg-white rounded-feishu-lg p-8 shadow-feishu hover:shadow-feishu-xl transition-all duration-300 text-left overflow-hidden animate-slide-up cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-[0.98]"
              style={{ animationDelay: '0.2s' }}
            >
              {/* 背景装饰 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-engineering-helmet/10 to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-300"></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-engineering-safety to-engineering-helmet rounded-feishu flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      🏆
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 group-hover:text-engineering-safety transition-colors">
                        排行榜
                      </h2>
                      <p className="text-sm text-slate-500">Leaderboard</p>
                    </div>
                  </div>
                  <div className="text-engineering-safety group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  查看全球玩家的成绩排名，挑战更高分数
                </p>

                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">👥</span>
                    <span>全球排名</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">⭐</span>
                    <span>最高分</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* 游戏特色 */}
          <div className="bg-white rounded-feishu-lg p-6 shadow-feishu animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <span className="text-xl mr-2">✨</span>
              游戏特色
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-status-cash/10 rounded-feishu flex items-center justify-center flex-shrink-0 mt-1">
                  💰
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">资源管理</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    平衡现金、健康、声誉、进度和质量五项核心指标
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-status-progress/10 rounded-feishu flex items-center justify-center flex-shrink-0 mt-1">
                  📊
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">真实场景</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    20+ 真实工程场景，每个选择都有不同的后果
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-status-quality/10 rounded-feishu flex items-center justify-center flex-shrink-0 mt-1">
                  🎯
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">策略深度</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    多种胜利条件和失败原因，考验你的决策能力
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 底部说明 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 mb-2">
              <strong>新玩法目标：</strong>从实习生晋升到合伙人，平衡资源、健康和声誉
            </p>
            <p className="text-xs text-slate-400">
              <strong>经典版目标：</strong>在 20 回合内完成项目，同时保持各项指标平衡
            </p>

            {/* 链接按钮组 */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {/* GitHub 链接 */}
              <a
                href="https://github.com/Xiaoni-61/civil-engineering-dream"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-feishu-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">GitHub</span>
              </a>

              {/* 邮件链接 */}
              <a
                href="mailto:zihilong_li61@126.com"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-feishu-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 存档选择弹窗 */}
      <SaveSlotModal
        isOpen={showLoadMenu}
        onClose={() => setShowLoadMenu(false)}
        saves={savesList}
        onLoad={handleLoad}
      />
    </div>
  );
};

export default Home;
```

**Step 2: 运行类型检查**

```bash
cd frontend && npm run lint
```

预期: 无错误

**Step 3: 提交**

```bash
git add frontend/src/pages/Home.tsx
git commit -m "feat: add save/load functionality to home page"
```

---

## Task 10: 添加退出监听

**Files:**
- Modify: `frontend/src/App.tsx`

**Step 1: 读取现有的 App.tsx**

```bash
cat frontend/src/App.tsx
```

**Step 2: 添加导航监听**

在 `App.tsx` 中找到路由配置，添加监听逻辑：

```typescript
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGameStoreNew } from '@/store/gameStoreNew';

// 在 App 组件内添加
function App() {
  const location = useLocation();
  const prevLocation = useRef(location.pathname);

  useEffect(() => {
    // 监听导航到首页，触发保存
    if (prevLocation.current !== '/' && location.pathname === '/') {
      const state = useGameStoreNew.getState();
      if (state.status === 'playing' && state.runId) {
        state.saveGame();
      }
    }
    prevLocation.current = location.pathname;
  }, [location.pathname]);

  // 添加页面卸载监听
  useEffect(() => {
    const handleBeforeUnload = () => {
      const state = useGameStoreNew.getState();
      if (state.status === 'playing' && state.runId) {
        // 使用 sendBeacon 确保发送成功
        const saveData = {
          deviceId: state.deviceId,
          runId: state.runId,
          gameState: { /* 完整游戏状态 */ },
        };
        navigator.sendBeacon(
          '/api/saves/save',
          new Blob([JSON.stringify(saveData)], { type: 'application/json' })
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ... 现有代码
}
```

**注意**: 由于 `beforeunload` 需要访问完整状态，这个实现需要从 store 中提取状态构建 saveData。实际实现时可以调用 `saveGame` 方法。

**Step 3: 提交**

```bash
git add frontend/src/App.tsx
git commit -m "feat: add exit listeners for auto-save"
```

---

## Task 11: 端到端测试

**Step 1: 启动前后端服务**

```bash
# 终端 1
cd backend && npm run dev

# 终端 2
cd frontend && npm run dev
```

**Step 2: 测试完整流程**

1. 访问首页，应该没有"继续游戏"按钮
2. 点击"开始游戏"，创建角色并进入游戏
3. 玩一个季度，然后返回首页
4. 应该看到"继续游戏"按钮，显示玩家信息
5. 点击"继续游戏"，应该恢复到之前的状态
6. 再玩一个季度，然后开始新游戏
7. 返回首页，应该看到两个存档槽位都有数据
8. 通过"读取存档"可以加载任一槽位

**Step 3: 测试错误情况**

1. 关闭后端服务
2. 尝试保存，应该提示"网络错误，已保存到本地"
3. 重启后端，再次测试

**Step 4: 提交**

```bash
git commit --allow-empty -m "test: verify save system end-to-end functionality"
```

---

## Task 12: 更新工作日志

**Files:**
- Modify: `WORKLOG.md`

**Step 1: 添加工作记录**

```markdown
## 2026-01-29 - 自动存档系统

**改动点:**
- 实现基于后端的自动存档系统
- 支持 2 个存档槽位（slot1 最新，slot2 次新）
- 退出游戏时自动保存（页面卸载 + 导航监听）
- 首页支持继续游戏、开始新游戏、读取存档

**涉及文件:**
- `shared/types/save.ts` - 新增存档相关类型定义
- `backend/src/database/init.ts` - 添加 game_saves 表
- `backend/src/api/saves.ts` - 新增保存/列表/加载 API
- `backend/src/index.ts` - 注册存档路由
- `frontend/src/store/gameStoreNew.ts` - 扩展 store 添加存档方法
- `frontend/src/components/SaveSlotModal.tsx` - 新增存档选择组件
- `frontend/src/pages/Home.tsx` - 改造首页添加存档功能
- `frontend/src/App.tsx` - 添加退出监听

**Review 状态:** 待 review

**特殊改动点:**
- 使用 sendBeacon 确保页面卸载时保存成功
- 保存失败时自动备份到 localStorage
- 同一局游戏更新 slot1，不同局游戏时 slot1 → slot2
```

**Step 2: 提交**

```bash
git add WORKLOG.md
git commit -m "docs: update WORKLOG for save system implementation"
```

---

## 总结

实施完成后，游戏将具备完整的存档系统：

1. **自动保存**: 玩家退出游戏或返回首页时自动保存
2. **双槽位**: 自动维护最新和次新两个存档
3. **无缝恢复**: 加载存档后可无缝继续游戏
4. **容错处理**: 网络失败时备份到本地存储

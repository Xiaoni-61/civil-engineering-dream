# Store - 状态管理

## 目录用途

管理游戏全局状态，包括 5 个核心数值、回合状态、事件队列等。

## 核心状态结构

### GameState（游戏状态）

```typescript
interface GameState {
  // 游戏标识
  runId: string | null;
  serverSeed: string | null;

  // 5 个核心数值
  stats: {
    cash: number;      // 现金流（初始值待定）
    health: number;    // 身心健康（初始值 100）
    rep: number;       // 声望（初始值 50）
    progress: number;  // 工期进度（0-100%）
    quality: number;   // 质量（初始值 70）
  };

  // 回合信息
  currentRound: number;
  maxRounds: number;

  // 事件队列
  eventQueue: EventCard[];
  currentEvent: EventCard | null;

  // 游戏状态
  status: 'idle' | 'playing' | 'failed' | 'completed';
  failReason?: 'bankrupt' | 'burnout' | 'overdue';

  // 历史记录（用于结算）
  history: RoundRecord[];
}
```

### ResultState（结算状态）

```typescript
interface ResultState {
  // 最终成绩
  finalScore: number;
  title: string;           // 职级称号
  netAssets: number;       // 净资产
  completedRounds: number; // 完成回合数

  // 项目履历
  projectHistory: ProjectRecord[];

  // 排名信息
  globalRank: number | null;
  percentile: number | null;
}
```

## Store 模块划分

| 模块 | 职责 |
|------|------|
| `gameStore.ts` | 游戏核心状态（数值、回合、事件） |
| `resultStore.ts` | 结算状态（成绩、排名） |
| `uiStore.ts` | UI 状态（弹窗、加载状态等） |

## 核心 Actions

### gameStore

- `startGame()` - 开始新游戏
- `selectOption(optionId)` - 选择选项
- `applyEffects(effects)` - 应用数值变化
- `nextRound()` - 进入下一回合
- `checkFailCondition()` - 检测失败条件
- `endGame(reason)` - 结束游戏

### resultStore

- `calculateResult()` - 计算最终成绩
- `submitResult()` - 提交成绩到后端
- `fetchRank()` - 获取排名信息

## 失败条件判定

在每次 `applyEffects` 后检测：

1. **破产**: `cash < 0`
2. **过劳**: `health <= 0`
3. **超期**: `progress` 相关条件（具体规则见 PRD）

## 数值变化规则

每个选项会影响多个数值，效果定义在事件卡数据中：

```typescript
interface OptionEffect {
  cash?: number;     // 正数增加，负数减少
  health?: number;
  rep?: number;
  progress?: number;
  quality?: number;
}
```

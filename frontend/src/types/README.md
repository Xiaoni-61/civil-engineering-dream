# Types - TypeScript 类型定义

## 目录用途

存放全局 TypeScript 类型定义，确保类型安全和代码提示。

## 应包含的类型文件

### 1. game.ts - 游戏核心类型

```typescript
// 游戏状态
interface GameState { ... }

// 数值类型
interface Stats {
  cash: number;
  health: number;
  rep: number;
  progress: number;
  quality: number;
}

// 回合记录
interface RoundRecord {
  round: number;
  eventId: string;
  selectedOption: string;
  statsBefore: Stats;
  statsAfter: Stats;
}

// 游戏状态枚举
type GameStatus = 'idle' | 'playing' | 'failed' | 'completed';
type FailReason = 'bankrupt' | 'burnout' | 'overdue';
```

---

### 2. event.ts - 事件卡类型

```typescript
// 事件卡
interface EventCard {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  options: Option[];
}

// 选项
interface Option {
  id: string;
  label: string;
  type: OptionType;
  effects: OptionEffect;
  feedback: string;
}

// 数值影响
interface OptionEffect {
  cash?: number;
  health?: number;
  rep?: number;
  progress?: number;
  quality?: number;
}

// 事件分类
type EventCategory = 'client' | 'weather' | 'finance' | 'team' | 'quality' | 'safety';

// 选项类型
type OptionType = 'rush' | 'cost' | 'quality';
```

---

### 3. result.ts - 结算类型

```typescript
// 结算数据
interface ResultData {
  finalScore: number;
  title: string;
  netAssets: number;
  completedRounds: number;
  projectHistory: ProjectRecord[];
}

// 项目履历
interface ProjectRecord {
  eventTitle: string;
  decision: string;
  outcome: string;
}

// 排名数据
interface RankData {
  globalRank: number;
  totalPlayers: number;
  percentile: number;
}
```

---

### 4. api.ts - API 响应类型

```typescript
// 开始游戏响应
interface StartRunResponse {
  runId: string;
  serverSeed: string;
}

// 结束游戏响应
interface FinishRunResponse {
  success: boolean;
  rank: number;
  totalPlayers: number;
}

// 排行榜响应
interface LeaderboardResponse {
  type: LeaderboardType;
  entries: LeaderboardEntry[];
  myRank?: number;
}

interface LeaderboardEntry {
  rank: number;
  playerId: string;
  nickname?: string;
  score: number;
  createdAt: string;
}

type LeaderboardType = 'overall' | 'profit' | 'duration';
```

---

### 5. index.ts - 导出汇总

```typescript
export * from './game';
export * from './event';
export * from './result';
export * from './api';
```

## 类型设计原则

- 使用 `interface` 定义对象结构
- 使用 `type` 定义联合类型和工具类型
- 可选字段使用 `?` 标记
- 避免使用 `any`，使用 `unknown` 替代
- 导出所有需要跨模块使用的类型

# Shared - 前后端共享代码

## 目录用途

存放前端和后端共享的代码，包括类型定义、常量、工具函数等，确保前后端数据结构一致。

## 应包含的模块

### 1. types/ - 共享类型定义

```typescript
// types/game.ts
export interface Stats {
  cash: number;
  health: number;
  rep: number;
  progress: number;
  quality: number;
}

export type GameStatus = 'idle' | 'playing' | 'failed' | 'completed';
export type FailReason = 'bankrupt' | 'burnout' | 'overdue';

// types/api.ts
export interface StartRunRequest {
  deviceId: string;
}

export interface StartRunResponse {
  runId: string;
  serverSeed: string;
}

export interface FinishRunRequest {
  runId: string;
  deviceId: string;
  signature: string;
  result: GameResult;
}

// types/leaderboard.ts
export type LeaderboardType = 'overall' | 'profit' | 'duration';

export interface LeaderboardEntry {
  rank: number;
  deviceId: string;
  nickname?: string;
  score: number;
  createdAt: string;
}
```

### 2. constants/ - 共享常量

```typescript
// constants/game.ts
export const INITIAL_STATS: Stats = {
  cash: 100,
  health: 100,
  rep: 50,
  progress: 0,
  quality: 70,
};

export const MAX_ROUNDS = 20;

export const FAIL_THRESHOLDS = {
  cash: 0,
  health: 0,
};

// constants/titles.ts
export const TITLES = [
  { minScore: 90, title: '土木之神' },
  { minScore: 70, title: '项目经理' },
  { minScore: 50, title: '工程师' },
  { minScore: 30, title: '实习生' },
  { minScore: 0, title: '被优化' },
];
```

### 3. utils/ - 共享工具函数

```typescript
// utils/validation.ts
export function isValidDeviceId(id: string): boolean {
  return /^[a-zA-Z0-9-_]{16,64}$/.test(id);
}

// utils/score.ts
export function determineTitle(score: number): string {
  const title = TITLES.find(t => score >= t.minScore);
  return title?.title || '被优化';
}
```

## 目录结构

```
shared/
├── types/
│   ├── game.ts
│   ├── api.ts
│   ├── leaderboard.ts
│   └── index.ts
├── constants/
│   ├── game.ts
│   ├── titles.ts
│   └── index.ts
├── utils/
│   ├── validation.ts
│   ├── score.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## 使用方式

### 方案 A: NPM Workspace（推荐）

```json
// 根目录 package.json
{
  "workspaces": ["frontend", "backend", "shared"]
}

// frontend/package.json
{
  "dependencies": {
    "shared": "workspace:*"
  }
}
```

### 方案 B: 路径别名

```typescript
// frontend/vite.config.ts
resolve: {
  alias: {
    '@shared': '../shared'
  }
}

// backend/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["../shared/*"]
    }
  }
}
```

### 方案 C: 符号链接

```bash
# 在 frontend 和 backend 中创建符号链接
ln -s ../shared shared
```

## 维护原则

1. **类型同步**: 前后端使用相同的类型定义
2. **常量统一**: 游戏规则相关常量集中管理
3. **向后兼容**: 修改共享代码时注意兼容性
4. **最小化依赖**: shared 不应依赖 frontend 或 backend 特有的库

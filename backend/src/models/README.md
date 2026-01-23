# Models - 数据模型

## 目录用途

定义数据库表结构和 ORM 模型，提供数据访问接口。

## 应包含的模型

### 1. Run.ts - 游戏运行记录

**表名**: `runs`

```typescript
interface Run {
  id: string;              // UUID 主键
  deviceId: string;        // 设备标识
  serverSeed: string;      // 服务端种子（用于验证）
  status: RunStatus;       // 'active' | 'completed' | 'abandoned'

  // 结果数据（完成后填充）
  finalScore?: number;
  netAssets?: number;
  completedRounds?: number;
  failReason?: string;

  // 时间戳
  createdAt: Date;
  completedAt?: Date;
}

type RunStatus = 'active' | 'completed' | 'abandoned';
```

**索引**:
- `deviceId` - 查询玩家历史记录
- `createdAt` - 按时间排序
- `status` - 过滤活跃/完成的游戏

---

### 2. LeaderboardEntry.ts - 排行榜条目

**表名**: `leaderboard_overall` / `leaderboard_profit` / `leaderboard_duration`

```typescript
interface LeaderboardEntry {
  id: string;              // UUID 主键
  runId: string;           // 关联的游戏记录
  deviceId: string;        // 设备标识
  nickname?: string;       // 昵称（可选）
  score: number;           // 该榜单的分数
  rank: number;            // 排名（定期更新）
  createdAt: Date;         // 记录创建时间
}
```

**设计说明**:
- 三个排行榜使用独立的表，便于查询优化
- `rank` 字段定期重算（或实时计算）
- 每个设备只保留最佳成绩

---

### 3. DeviceStats.ts - 设备统计（可选）

**表名**: `device_stats`

```typescript
interface DeviceStats {
  deviceId: string;        // 主键
  totalRuns: number;       // 总游戏次数
  bestOverallScore: number;
  bestNetAssets: number;
  fastestCompletion: number;
  lastPlayedAt: Date;
  createdAt: Date;
}
```

## 数据库 Schema (SQL)

```sql
-- runs 表
CREATE TABLE runs (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  server_seed TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  final_score INTEGER,
  net_assets INTEGER,
  completed_rounds INTEGER,
  fail_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- 排行榜表（以 overall 为例）
CREATE TABLE leaderboard_overall (
  id TEXT PRIMARY KEY,
  run_id TEXT REFERENCES runs(id),
  device_id TEXT NOT NULL,
  nickname TEXT,
  score INTEGER NOT NULL,
  rank INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(device_id)  -- 每设备只保留最佳
);

CREATE INDEX idx_leaderboard_overall_score ON leaderboard_overall(score DESC);
```

## ORM 使用建议

可选 ORM 方案：
- **Prisma** - 类型安全，迁移管理好
- **Drizzle** - 轻量，TypeScript 原生
- **Knex** - 查询构建器，灵活性高
- **原生 SQL** - MVP 阶段最简单

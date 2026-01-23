# Database - 数据库

## 目录用途

数据库配置、Schema 定义、迁移脚本和种子数据。

## 应包含的文件

| 文件 | 用途 |
|------|------|
| `schema.sql` | 完整的数据库 Schema 定义 |
| `migrations/` | 数据库迁移脚本目录 |
| `seeds/` | 种子数据（测试用） |
| `connection.ts` | 数据库连接配置 |

## 数据库 Schema

### 完整 Schema (schema.sql)

```sql
-- =====================
-- 游戏运行记录表
-- =====================
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  server_seed TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed', 'abandoned')),

  -- 游戏结果
  final_score INTEGER,
  net_assets INTEGER,
  completed_rounds INTEGER,
  fail_reason TEXT CHECK(fail_reason IN ('bankrupt', 'burnout', 'overdue', NULL)),

  -- 时间戳
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

CREATE INDEX idx_runs_device_id ON runs(device_id);
CREATE INDEX idx_runs_status ON runs(status);
CREATE INDEX idx_runs_created_at ON runs(created_at DESC);

-- =====================
-- 综合排行榜
-- =====================
CREATE TABLE IF NOT EXISTS leaderboard_overall (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs(id),
  device_id TEXT NOT NULL UNIQUE,
  nickname TEXT,
  score INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lb_overall_score ON leaderboard_overall(score DESC);

-- =====================
-- 利润排行榜
-- =====================
CREATE TABLE IF NOT EXISTS leaderboard_profit (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs(id),
  device_id TEXT NOT NULL UNIQUE,
  nickname TEXT,
  score INTEGER NOT NULL,  -- 净资产
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lb_profit_score ON leaderboard_profit(score DESC);

-- =====================
-- 工期排行榜
-- =====================
CREATE TABLE IF NOT EXISTS leaderboard_duration (
  id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs(id),
  device_id TEXT NOT NULL UNIQUE,
  nickname TEXT,
  score INTEGER NOT NULL,  -- 完成回合数（越小越好）
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lb_duration_score ON leaderboard_duration(score ASC);
```

## 迁移管理

### 目录结构

```
migrations/
├── 001_initial_schema.sql
├── 002_add_nickname.sql
└── ...
```

### 迁移脚本示例

```sql
-- migrations/001_initial_schema.sql
-- 初始化所有表

-- migrations/002_add_nickname.sql
ALTER TABLE leaderboard_overall ADD COLUMN nickname TEXT;
ALTER TABLE leaderboard_profit ADD COLUMN nickname TEXT;
ALTER TABLE leaderboard_duration ADD COLUMN nickname TEXT;
```

## 数据库连接配置

```typescript
// connection.ts
import Database from 'better-sqlite3';  // SQLite
// 或 import { Pool } from 'pg';       // PostgreSQL

const db = new Database(process.env.DATABASE_PATH || './data.db');

// 初始化 Schema
const schema = fs.readFileSync('./database/schema.sql', 'utf-8');
db.exec(schema);

export default db;
```

## 数据库选型建议

| 阶段 | 推荐方案 | 理由 |
|------|---------|------|
| MVP/开发 | SQLite | 零配置，文件存储，开发方便 |
| 生产 | PostgreSQL | 性能好，支持并发，云服务丰富 |
| Serverless | PlanetScale / Turso | 边缘部署，低延迟 |

## 备份策略

- SQLite: 定期复制 .db 文件
- PostgreSQL: 使用 pg_dump 或云服务自动备份

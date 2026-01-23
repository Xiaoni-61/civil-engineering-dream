# Services - 业务逻辑

## 目录用途

封装核心业务逻辑，与 HTTP 层解耦，便于测试和复用。

## 应包含的服务模块

### 1. runService.ts - 游戏运行服务

**职责**: 管理游戏会话的创建和结算

```typescript
class RunService {
  // 创建新游戏
  async createRun(deviceId: string): Promise<Run>

  // 完成游戏并提交结果
  async finishRun(runId: string, result: GameResult): Promise<FinishResult>

  // 验证游戏数据签名
  validateSignature(data: any, signature: string): boolean

  // 检测异常值
  detectAnomalies(result: GameResult): AnomalyReport
}
```

---

### 2. leaderboardService.ts - 排行榜服务

**职责**: 排行榜的查询、更新和缓存管理

```typescript
class LeaderboardService {
  // 获取排行榜
  async getLeaderboard(type: LeaderboardType, options: PaginationOptions): Promise<LeaderboardResult>

  // 更新排行榜（游戏结束时调用）
  async updateLeaderboard(run: Run, result: GameResult): Promise<void>

  // 获取玩家排名
  async getPlayerRank(deviceId: string): Promise<PlayerRanks>

  // 刷新缓存
  async refreshCache(type: LeaderboardType): Promise<void>
}
```

**排行榜类型**:
- `overall`: 综合榜（综合评分）
- `profit`: 利润榜（净资产）
- `duration`: 工期榜（完工回合数，越少越好）

---

### 3. scoreService.ts - 计分服务

**职责**: 计算最终分数和排名

```typescript
class ScoreService {
  // 计算综合评分
  calculateOverallScore(result: GameResult): number

  // 计算利润分数
  calculateProfitScore(result: GameResult): number

  // 计算工期分数（越快完工分数越高）
  calculateDurationScore(result: GameResult): number

  // 确定职级称号
  determineTitle(score: number): string
}
```

---

### 4. antiCheatService.ts - 反作弊服务

**职责**: 检测和拦截作弊行为

```typescript
class AntiCheatService {
  // 验证签名
  verifySignature(runId: string, data: any, signature: string): boolean

  // 生成签名（用于客户端）
  generateSignature(runId: string, serverSeed: string, data: any): string

  // 异常值检测
  detectAnomalies(result: GameResult): {
    isValid: boolean;
    reasons: string[];
  }

  // 限流检查
  checkRateLimit(deviceId: string): boolean
}
```

**异常检测规则**:
- 分数超出合理范围
- 回合数异常
- 数值变化不符合游戏规则
- 提交频率过高

## 服务间依赖

```
runService
  └── 依赖 → leaderboardService, scoreService, antiCheatService

leaderboardService
  └── 依赖 → scoreService, models

antiCheatService
  └── 独立（无依赖其他 service）
```

## 设计原则

- Service 不处理 HTTP 请求/响应
- 业务逻辑集中在 Service 层
- Service 方法返回业务对象，不返回 HTTP 状态码
- 使用依赖注入便于测试

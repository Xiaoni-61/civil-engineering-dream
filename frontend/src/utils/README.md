# Utils - 工具函数

## 目录用途

存放通用工具函数，包括计算逻辑、Canvas 海报生成、API 调用封装等。

## 应包含的模块

### 1. calculator.ts - 结算计算器

**职责**: 计算最终分数、职级称号、排名相关数据

```typescript
// 主要函数
calculateFinalScore(stats, history): number
determineTitle(score): string
calculateNetAssets(stats): number
calculateDuration(rounds): number
```

**职级称号参考**（来自 PRD）:
- 土木之神 (≥90分)
- 项目经理 (70-89分)
- 工程师 (50-69分)
- 实习生 (30-49分)
- 被优化 (<30分)

---

### 2. posterGenerator.ts - 海报生成器

**职责**: 使用 Canvas 生成可分享的战绩单图片

```typescript
// 主要函数
generatePoster(resultData): Promise<Blob>
downloadPoster(blob, filename): void
sharePoster(blob): Promise<void>  // 调用系统分享
```

**海报内容要素**:
- 职级称号（大标题）
- 净资产
- 完成回合数
- 全球排名
- 项目履历摘要
- 游戏二维码/链接

---

### 3. api.ts - API 调用封装

**职责**: 封装后端 API 调用，处理错误和重试

```typescript
// API 函数
api.startRun(): Promise<{ runId, serverSeed }>
api.finishRun(runId, data): Promise<ResultResponse>
api.getLeaderboard(type): Promise<LeaderboardData>
api.getMyRank(): Promise<RankData>
```

---

### 4. eventManager.ts - 事件管理器

**职责**: 管理事件卡池的抽取、洗牌逻辑

```typescript
// 主要函数
shuffleEvents(events, seed): EventCard[]
drawEvent(pool): EventCard
```

---

### 5. storage.ts - 本地存储

**职责**: 管理设备 ID、游戏进度的本地持久化

```typescript
// 主要函数
getDeviceId(): string
saveGameProgress(state): void
loadGameProgress(): GameState | null
clearGameProgress(): void
```

---

### 6. share.ts - 分享工具

**职责**: 处理各平台分享逻辑

```typescript
// 主要函数
canNativeShare(): boolean
nativeShare(data): Promise<void>
copyToClipboard(text): Promise<void>
```

## 依赖关系

```
api.ts → types/
calculator.ts → types/, data/
posterGenerator.ts → types/
eventManager.ts → data/, types/
storage.ts → types/
```

## 设计原则

- 所有工具函数应为纯函数（除 API 调用和 storage 外）
- 提供完整的 TypeScript 类型定义
- 包含单元测试

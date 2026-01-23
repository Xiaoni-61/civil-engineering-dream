# Services 服务层

本目录包含前端的服务层代码，负责与外部 API 交互和业务逻辑封装。

## 文件说明

### llmService.ts
**LLM API 调用服务**

负责与 LLM API 交互，提供三种增强功能：
1. 动态事件描述生成
2. 随机特殊事件生成
3. 动态奖励调整

**核心接口**：
```typescript
interface LLMService {
  call(request: LLMRequest): Promise<LLMResponse>;
  enhanceDescription(baseEvent, stats, round): Promise<string>;
  generateSpecialEvent(stats, round): Promise<EventCard>;
  adjustReward(option, stats): Promise<AdjustedReward>;
}
```

**功能特性**：
- 多 LLM 提供商支持（OpenAI、DeepSeek、Claude 等）
- 自动降级处理（API 失败时使用预设内容）
- 响应缓存（节省成本）
- 调用统计和监控

### llmCache.ts
**LLM 响应缓存**

缓存 LLM API 的响应结果，减少重复调用：
- LRU 缓存策略
- 根据游戏状态生成缓存 Key
- 命中率统计

**使用示例**：
```typescript
const cacheKey = llmCache.generateKey(request);
const cached = llmCache.get(cacheKey);
if (cached && Math.random() < 0.7) {
  return cached; // 70% 概率使用缓存
}
```

### apiClient.ts
**通用 API 客户端**

封装与后端 API 的通信：
- 请求/响应拦截
- 错误处理
- Token 管理
- 重试机制

## 使用方式

### 调用 LLM 增强事件描述
```typescript
import { llmService } from '@/services/llmService';

// 增强事件描述
const enhanced = await llmService.enhanceDescription(
  baseEvent,
  currentStats,
  currentRound
);

if (enhanced.success) {
  baseEvent.description = enhanced.data.description;
  baseEvent.llmEnhanced = true;
}
```

### 生成特殊事件
```typescript
// 判断是否触发特殊事件
if (shouldTriggerSpecialEvent(round, stats, count)) {
  const specialEvent = await llmService.generateSpecialEvent(
    currentStats,
    currentRound
  );

  if (specialEvent.success) {
    // 插入事件队列
    eventQueue.unshift(specialEvent.data);
  }
}
```

### 调整动态奖励
```typescript
// 玩家选择选项后
if (shouldAdjustReward(stats, option)) {
  const adjusted = await llmService.adjustReward(
    selectedOption,
    currentStats
  );

  if (adjusted.success) {
    option.effects = adjusted.data.adjustedEffects;
    option.feedback = adjusted.data.explanation;
  }
}
```

## 配置

在 `.env` 文件中配置 LLM 提供商：

```bash
# LLM 提供商选择（openai / deepseek / anthropic）
VITE_LLM_PROVIDER=deepseek

# API Key（如果前端直接调用）
VITE_LLM_API_KEY=your_api_key_here

# API Endpoint（可选，使用默认值）
VITE_LLM_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions

# 后端代理模式（推荐）
VITE_LLM_PROXY_ENDPOINT=/api/llm
```

## 成本控制

- 使用缓存降低 40-50% 成本
- 选择 DeepSeek 可降低 99% 成本（相比 GPT-4o-mini）
- 设置合理的触发概率（15% 推荐）
- 实时监控每日成本

## 降级策略

LLM 服务失败不会影响游戏体验：

1. **Level 1**: 尝试 LLM API
2. **Level 2**: 使用缓存数据
3. **Level 3**: 使用预设模板（`data/fallbackEvents.ts`）
4. **Level 4**: 使用原始事件数据

## 监控

通过 `useLLMStore` 查看调用统计：

```typescript
const stats = useLLMStore.getState().getStats();
console.log({
  totalCalls: stats.totalCalls,
  successRate: stats.successRate,
  avgLatency: stats.avgLatency,
  cacheHitRate: stats.cacheHitRate,
  totalCost: stats.totalCost
});
```

## 相关文档

- LLM 增强系统完整设计：`docs/plans/2026-01-23-llm-enhancement-design.md`
- Prompt 模板定义：`utils/promptTemplates.ts`
- 降级事件数据：`data/fallbackEvents.ts`

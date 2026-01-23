# LLM 增强系统架构总结

## 正确的前后端职责划分

### ❌ 错误做法（不要这样做）
- 前端直接调用 LLM API
- API Key 存储在前端环境变量
- Prompt 模板在前端
- 缓存分散在前后端

### ✅ 正确做法（必须这样做）

**前端职责（frontend/）**：
```
frontend/src/
├── api/
│   └── llmApi.ts          # 封装对后端 /api/llm/* 的调用
├── store/
│   └── gameStore.ts       # 判断触发时机，调用 llmApi
└── components/
    └── EventCard.tsx      # 展示增强后的内容
```

**后端职责（backend/）**：
```
backend/src/
├── api/
│   └── llm.ts             # LLM 路由（/api/llm/*）
├── services/
│   ├── llmService.ts      # LLM 核心服务（调用 LLM API）
│   ├── llmProvider.ts     # LLM 提供商封装
│   └── llmCache.ts        # LLM 响应缓存
└── utils/
    └── promptTemplates.ts # Prompt 模板（在后端！）
```

## 数据流向

```
【前端】判断触发（15%）
    ↓
【前端】调用 llmApi.enhanceDescription()
    ↓
【网络】POST /api/llm/enhance
    ↓
【后端】llm.ts 路由接收请求
    ↓
【后端】llmService.enhanceDescription()
    ↓
【后端】检查缓存（llmCache）
    ↓
【后端】构建 Prompt（promptTemplates）
    ↓
【后端】调用 LLM API（llmProvider → OpenAI/DeepSeek）
    ↓
【后端】缓存结果
    ↓
【后端】返回 JSON { success, data/fallback }
    ↓
【网络】响应返回前端
    ↓
【前端】处理响应，更新事件描述
    ↓
【前端】渲染 UI
```

## 环境变量配置

**前端 (.env)**：
```bash
# 前端不需要 LLM API Key！
VITE_API_BASE_URL=http://localhost:3001  # 后端地址
```

**后端 (.env)**：
```bash
# 后端配置 LLM
LLM_PROVIDER=deepseek
LLM_API_KEY=sk-xxxxxxxxxxxxxxxx  # API Key 只在后端
LLM_MODEL=deepseek-chat
LLM_API_ENDPOINT=https://api.deepseek.com/v1/chat/completions

# 缓存配置
REDIS_URL=redis://localhost:6379  # 或使用内存缓存
LLM_CACHE_TTL=3600

# 成本控制
LLM_DAILY_COST_LIMIT=10.0
LLM_TIMEOUT=5000
```

## 安全性保证

1. **API Key 安全**：API Key 只存在后端，前端永远看不到
2. **成本控制**：后端统一限流、缓存，防止前端恶意调用
3. **数据验证**：后端验证所有请求参数，防止注入攻击
4. **降级策略**：后端处理失败，返回降级数据，前端无需关心

## 核心原则

**前端只管 UI 和触发逻辑，后端才是实际调用 LLM 的地方！**

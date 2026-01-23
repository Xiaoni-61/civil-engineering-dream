# LLM 增强游戏系统设计方案

> **创建日期**: 2026-01-23
> **设计目标**: 通过接入外部 LLM API 增加游戏的随机性、可玩性和重复体验的新鲜感
> **成本预估**: ¥500-1000/月（基于 1000 DAU）

---

## 一、核心定位

### 设计原则
- **角色定位**: 随机惊喜点缀（小概率触发，10-20%）
- **内容类型**: 动态事件描述 + 随机特殊事件（彩蛋）+ 动态奖励调整
- **触发机制**: 混合机制（常规回合 15% 随机 + 每局 1-2 次必出彩蛋）

### 价值主张
- 在保证游戏平衡性和成本可控的前提下，显著提升游戏可玩性
- 每次游戏都有新鲜感，增加重复游玩动力
- 通过 AI 生成的个性化内容增强沉浸感

---

## 二、技术架构

### 前后端职责分离（重要！）

**前端职责**：
- 判断是否触发 LLM 增强（15% 概率）
- 调用后端 `/api/llm/*` 接口
- 展示 Loading 状态
- 处理后端返回的增强内容或降级数据
- UI 渲染

**后端职责**：
- 实际调用 LLM API（OpenAI/DeepSeek/Claude）
- 保护 API Key 安全
- Prompt 工程（构建提示词）
- 响应缓存（Redis/内存）
- 成本控制和限流
- 降级策略处理
- 返回增强内容或降级数据

### 整体流程

```
【前端】游戏流程
    ↓
【前端】事件抽取
    ↓
【前端】随机判断（15% 概率）
    ↓
    ├─ YES → 【前端】调用后端 POST /api/llm/enhance
    │         ↓
    │    【后端】实际调用 LLM API
    │         ↓
    │    【后端】返回增强描述或降级数据
    │         ↓
    │    【前端】渲染增强后的事件卡
    │
    └─ NO  → 【前端】使用预设事件卡
             ↓
        正常游戏流程

【前端】特殊检测点（第 5/10/15 回合 或 危机时刻）
    ↓
【前端】调用后端 POST /api/llm/special-event
    ↓
【后端】实际调用 LLM API 生成彩蛋事件
    ↓
【后端】返回特殊事件或降级预设事件
    ↓
【前端】插入事件队列并渲染
```

---

## 三、核心功能模块

### 功能 1：动态事件描述生成器

**触发时机**: 每回合 15% 概率，在抽到预设事件卡后触发

**前端工作流程**:
```typescript
// frontend/src/store/gameStore.ts

// 1. 抽到预设事件卡
const baseEvent = EVENT_CARDS[randomIndex];

// 2. 15% 概率调用后端 LLM 接口
if (Math.random() < 0.15) {
  try {
    // 3. 调用后端接口
    const response = await fetch('/api/llm/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        baseEvent: {
          id: baseEvent.id,
          title: baseEvent.title,
          description: baseEvent.description,
          category: baseEvent.category
        },
        stats: currentStats,
        currentRound: currentRound
      })
    });

    const result = await response.json();

    // 4. 使用后端返回的增强描述
    if (result.success) {
      baseEvent.description = result.data.description;
      baseEvent.llmEnhanced = true;
    } else {
      // 后端降级，使用 fallback
      baseEvent.description = result.fallback;
    }
  } catch (error) {
    // 网络错误，使用原始描述
    console.warn('LLM enhance failed:', error);
  }
}

return baseEvent;
```

**后端工作流程**:
```typescript
// backend/src/api/llm.ts

router.post('/enhance', async (req, res) => {
  const { baseEvent, stats, currentRound } = req.body;

  try {
    // 1. 检查缓存
    const cacheKey = generateCacheKey('enhance', baseEvent.id, stats);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, fromCache: true });
    }

    // 2. 构建 Prompt（Prompt 在后端！）
    const prompt = buildEnhancePrompt(baseEvent, stats, currentRound);

    // 3. 调用 LLM API（后端调用！）
    const llmResponse = await callLLMProvider({
      model: process.env.LLM_MODEL,
      messages: [
        { role: 'system', content: '你是土木工程游戏内容生成器' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 300
    });

    const result = JSON.parse(llmResponse.content);

    // 4. 缓存结果
    await cache.set(cacheKey, result, 3600);

    // 5. 返回增强描述
    res.json({ success: true, data: result });

  } catch (error) {
    // 降级处理
    const fallback = getFallbackDescription(baseEvent.id);
    res.json({ success: false, fallback });
  }
});
```

**示例效果**:
- **原始**: "甲方凌晨发来消息：'这个方案再改改，明天开会要用。'"
- **LLM 生成**: "凌晨 3 点，你的手机突然亮了。甲方王总发来语音：'小张啊，这个钢结构方案董事长不满意，明早 8 点开会要用，你看着办吧...'"

---

### 功能 2：随机特殊事件生成器（彩蛋系统）

**触发时机**:
- 固定节点：第 5、10、15 回合（三选一触发，80% 概率）
- 危机时刻：现金流 < 20 或 健康 < 15 时（30% 概率）
- 保证每局至少 1 次，最多 2 次

**前端工作流程**:
```typescript
// frontend/src/store/gameStore.ts

function shouldTriggerSpecialEvent(currentRound, stats, alreadyTriggeredCount) {
  if (alreadyTriggeredCount >= 2) return false;

  // 固定节点触发
  if ([5, 10, 15].includes(currentRound) && alreadyTriggeredCount === 0) {
    return Math.random() < 0.8;
  }

  // 危机触发
  if (stats.cash < 20 || stats.health < 15) {
    return Math.random() < 0.3;
  }

  return false;
}

// 触发特殊事件
if (shouldTriggerSpecialEvent(currentRound, stats, specialEventCount)) {
  try {
    // 调用后端生成特殊事件
    const response = await fetch('/api/llm/special-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stats: currentStats,
        currentRound: currentRound
      })
    });

    const result = await response.json();

    if (result.success) {
      // 插入 LLM 生成的特殊事件
      eventQueue.unshift(result.data);
      specialEventCount++;
    } else {
      // 使用后端返回的降级预设事件
      eventQueue.unshift(result.fallback);
    }
  } catch (error) {
    console.warn('Special event generation failed:', error);
  }
}
```

**后端工作流程**:
```typescript
// backend/src/api/llm.ts

router.post('/special-event', async (req, res) => {
  const { stats, currentRound } = req.body;

  try {
    // 1. 构建 Prompt（根据玩家状态选择事件类型）
    const prompt = buildSpecialEventPrompt(stats, currentRound);

    // 2. 调用 LLM API
    const llmResponse = await callLLMProvider({
      model: process.env.LLM_MODEL,
      messages: [
        { role: 'system', content: '你是土木工程游戏事件设计师' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.9, // 更高的创造性
      max_tokens: 800
    });

    const specialEvent = JSON.parse(llmResponse.content);

    // 3. 验证和修正数值范围
    specialEvent.options = specialEvent.options.map(opt => {
      Object.keys(opt.effects).forEach(key => {
        opt.effects[key] = Math.max(-30, Math.min(30, opt.effects[key]));
      });
      return opt;
    });

    // 4. 添加标记
    specialEvent.isLLMGenerated = true;
    specialEvent.id = `llm_special_${Date.now()}`;

    res.json({ success: true, data: specialEvent });

  } catch (error) {
    // 降级：返回预设的特殊事件
    const fallback = getPresetSpecialEvent();
    res.json({ success: false, fallback });
  }
});
```

**生成要求**:
1. 事件类型：意外好运、突发危机、奇葩甲方、黑天鹅
2. 必须提供 3 个选项（rush/cost/quality）
3. 数值变化范围：-30 到 +30
4. 事件描述要有戏剧性（50-80 字）

**示例**:
```json
{
  "title": "老板中标了超级大单！",
  "description": "公司拿下了一个 5 亿的地铁项目，老板喜气洋洋地拍着你肩膀：'这个项目就交给你了！资源随便调，干好了升副总！'",
  "category": "special",
  "options": [
    {
      "label": "接下重任",
      "type": "rush",
      "effects": { "cash": 30, "progress": -10, "health": -15, "rep": 20 },
      "feedback": "压力山大，但这是证明自己的机会！"
    },
    // ... 另外两个选项
  ]
}
```

---

### 功能 3：动态奖励调整与解释

**触发时机**: 与功能 1 同时触发（15% 概率），或极端状态下强制触发

**工作流程**:
```typescript
function shouldAdjustReward(stats, option) {
  // 健康或现金极低时强制调整
  if (stats.health < 20 || stats.cash < 30) {
    return true;
  }
  // 15% 随机触发
  return Math.random() < 0.15;
}

// 调整奖励
const adjusted = await llmService.call({
  type: 'adjust_reward',
  context: {
    selectedOption,
    stats,
    baseEffects: selectedOption.effects
  }
});

if (adjusted.success) {
  selectedOption.effects = adjusted.data.adjustedEffects;
  selectedOption.feedback = adjusted.data.explanation;
  selectedOption.dynamicAdjusted = true;
}
```

**调整规则**:
1. 健康 < 20 时，health 负面效果 ×1.5-2.0
2. 现金 < 30 时，cash 负面效果 ×1.3-1.8
3. 声望 > 80 时，rep 正面效果 ×1.2-1.5
4. 调整后数值范围：-40 到 +40

**示例**:
- **场景**: 健康值 15 时选择"熬夜赶工"
- **原始**: health -15
- **调整**: health -28
- **解释**: "你已经连续失眠三天，这次通宵让你差点晕倒在工地。现场工人都劝你歇歇。"

---

## 四、后端 LLM 服务设计

### 1. 后端 LLM Service（核心实现）

```typescript
// backend/src/services/llmService.ts

import { LLMProvider } from './llmProvider';
import { LLMCache } from './llmCache';
import { buildEnhancePrompt, buildSpecialEventPrompt, buildAdjustRewardPrompt } from '../utils/promptTemplates';

class LLMService {
  private provider: LLMProvider;
  private cache: LLMCache;

  constructor() {
    this.provider = new LLMProvider({
      provider: process.env.LLM_PROVIDER || 'deepseek',
      apiKey: process.env.LLM_API_KEY!,
      model: process.env.LLM_MODEL || 'deepseek-chat'
    });
    this.cache = new LLMCache();
  }

  /**
   * 增强事件描述
   */
  async enhanceDescription(baseEvent: any, stats: any, currentRound: number) {
    try {
      // 1. 检查缓存
      const cacheKey = this.cache.generateKey('enhance', baseEvent.id, stats);
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return { success: true, data: cached, fromCache: true };
      }

      // 2. 构建 Prompt
      const prompt = buildEnhancePrompt(baseEvent, stats, currentRound);

      // 3. 调用 LLM API
      const response = await this.provider.call({
        messages: [
          { role: 'system', content: '你是土木工程游戏内容生成器' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 300,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.content);

      // 4. 缓存结果
      await this.cache.set(cacheKey, result, 3600);

      return { success: true, data: result };

    } catch (error) {
      console.error('LLM enhance failed:', error);
      // 降级：返回原始描述
      return { success: false, fallback: baseEvent.description };
    }
  }

  /**
   * 生成特殊事件
   */
  async generateSpecialEvent(stats: any, currentRound: number) {
    try {
      const prompt = buildSpecialEventPrompt(stats, currentRound);

      const response = await this.provider.call({
        messages: [
          { role: 'system', content: '你是土木工程游戏事件设计师' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      });

      const specialEvent = JSON.parse(response.content);

      // 验证和修正数值范围
      specialEvent.options = specialEvent.options.map((opt: any) => {
        Object.keys(opt.effects).forEach(key => {
          opt.effects[key] = Math.max(-30, Math.min(30, opt.effects[key]));
        });
        return opt;
      });

      specialEvent.isLLMGenerated = true;
      specialEvent.id = `llm_special_${Date.now()}`;

      return { success: true, data: specialEvent };

    } catch (error) {
      console.error('LLM special event failed:', error);
      // 降级：返回预设事件
      return { success: false, fallback: this.getPresetSpecialEvent() };
    }
  }

  /**
   * 调整动态奖励
   */
  async adjustReward(selectedOption: any, stats: any) {
    try {
      const cacheKey = this.cache.generateKey('adjust', selectedOption.id, stats);
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return { success: true, data: cached, fromCache: true };
      }

      const prompt = buildAdjustRewardPrompt(selectedOption, stats);

      const response = await this.provider.call({
        messages: [
          { role: 'system', content: '你是游戏数值设计师' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 400,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.content);

      await this.cache.set(cacheKey, result, 1800);

      return { success: true, data: result };

    } catch (error) {
      console.error('LLM adjust reward failed:', error);
      // 降级：返回原始效果
      return {
        success: false,
        fallback: {
          adjustedEffects: selectedOption.effects,
          explanation: selectedOption.feedback
        }
      };
    }
  }

  private getPresetSpecialEvent() {
    // 预设的特殊事件
    const presets = [
      {
        id: 'preset_special_001',
        title: '政府检查突袭',
        description: '市安监局临时通知要来检查，现场还有不少隐患...',
        category: 'special',
        options: [/* ... */]
      }
    ];
    return presets[Math.floor(Math.random() * presets.length)];
  }
}

export const llmService = new LLMService();
```

---

### 2. LLM Provider 封装（多提供商支持）

```typescript
// backend/src/services/llmProvider.ts

interface ProviderConfig {
  provider: 'openai' | 'deepseek' | 'anthropic';
  apiKey: string;
  model: string;
}

interface CallOptions {
  messages: Array<{ role: string; content: string }>;
  temperature: number;
  max_tokens: number;
  response_format?: { type: string };
}

export class LLMProvider {
  private config: ProviderConfig;
  private providerConfigs = {
    openai: {
      endpoint: 'https://api.openai.com/v1/chat/completions',
      headers: (apiKey: string) => ({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      })
    },
    deepseek: {
      endpoint: 'https://api.deepseek.com/v1/chat/completions',
      headers: (apiKey: string) => ({
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      })
    },
    anthropic: {
      endpoint: 'https://api.anthropic.com/v1/messages',
      headers: (apiKey: string) => ({
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      })
    }
  };

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  async call(options: CallOptions) {
    const providerConfig = this.providerConfigs[this.config.provider];

    const response = await fetch(providerConfig.endpoint, {
      method: 'POST',
      headers: providerConfig.headers(this.config.apiKey),
      body: JSON.stringify({
        model: this.config.model,
        ...options
      })
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.statusText}`);
    }

    const data = await response.json();

    // 统一响应格式
    if (this.config.provider === 'anthropic') {
      return { content: data.content[0].text };
    } else {
      return { content: data.choices[0].message.content };
    }
  }
}
```

---

### 3. 前端 API 客户端（简单封装）

```typescript
// frontend/src/api/llmApi.ts

/**
 * 前端只负责调用后端接口，不直接接触 LLM API
 */
export const llmApi = {
  /**
   * 增强事件描述
   */
  async enhanceDescription(baseEvent: any, stats: any, currentRound: number) {
    const response = await fetch('/api/llm/enhance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ baseEvent, stats, currentRound })
    });
    return await response.json();
  },

  /**
   * 生成特殊事件
   */
  async generateSpecialEvent(stats: any, currentRound: number) {
    const response = await fetch('/api/llm/special-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stats, currentRound })
    });
    return await response.json();
  },

  /**
   * 调整动态奖励
   */
  async adjustReward(selectedOption: any, stats: any) {
    const response = await fetch('/api/llm/adjust-reward', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedOption, stats })
    });
    return await response.json();
  }
};
```

---

## 五、Prompt 模板设计

### 模板 1：动态事件描述

```
你是土木工程项目管理游戏的文案大师。

【事件信息】
- 事件标题：{{title}}
- 事件分类：{{category}}
- 原始描述：{{description}}

【玩家状态】
- 当前回合：{{currentRound}}/20
- 现金流：{{cash}}（破产线 0）
- 健康值：{{health}}（过劳线 0）
- 声望：{{rep}}（范围 0-100）

【任务要求】
1. 改写事件描述，增加沉浸感和戏剧性
2. 可加入 NPC 对话（甲方/老板/监理/工人）
3. 根据玩家状态调整语气：
   - 现金/健康低时：紧张、压迫感
   - 声望高时：NPC 态度友好
   - 声望低时：NPC 态度冷淡或质疑
4. 长度：40-60 字
5. 必须真实反映土木工程行业场景

【输出格式（纯 JSON）】
{
  "description": "你的新描述"
}
```

---

### 模板 2：随机特殊事件

```
你是土木工程游戏的事件设计师，负责创造"黑天鹅事件"。

【玩家状态】
- 回合：{{currentRound}}/20
- 现金流：{{cash}}
- 健康：{{health}}
- 声望：{{rep}}
- 工期进度：{{progress}}/100
- 质量：{{quality}}

【事件类型建议】
根据玩家状态选择合适的事件类型：
- 现金 < 30：可以是"意外收入"或"资金危机"
- 健康 < 20：可以是"强制休假"或"体检异常"
- 声望 > 70：可以是"猎头挖角"或"升职机会"
- 进度 < 40 且回合 > 10：可以是"加速机会"或"工期危机"

【创作要求】
1. 事件要有 surprise，不能是常规事件
2. 标题：6-10 字，吸引眼球
3. 描述：50-80 字，有画面感
4. 必须提供 3 个选项，类型分别是 rush/cost/quality
5. 每个选项的数值变化范围：-30 到 +30
6. 确保数值平衡：不能全是正面或全是负面

【输出格式（纯 JSON）】
{
  "title": "事件标题",
  "description": "事件描述",
  "category": "special",
  "options": [
    {
      "id": "opt1",
      "label": "选项名称",
      "type": "rush",
      "effects": {
        "cash": 10,
        "health": -15,
        "rep": 5,
        "progress": 10,
        "quality": -5
      },
      "feedback": "反馈文案（20字内）"
    }
    // 另外 2 个选项
  ]
}
```

---

### 模板 3：动态奖励调整

```
你是游戏数值设计师，负责动态调整选项的奖惩幅度。

【选项信息】
- 选项名称：{{label}}
- 基础数值变化：{{baseEffects}}

【玩家状态】
- 现金流：{{cash}}
- 健康：{{health}}
- 声望：{{rep}}
- 工期进度：{{progress}}
- 质量：{{quality}}

【调整规则】
1. 健康 < 20 时，health 负面效果 ×1.5-2.0
2. 现金 < 30 时，cash 负面效果 ×1.3-1.8
3. 声望 > 80 时，rep 正面效果 ×1.2-1.5
4. 质量 < 40 时，quality 负面效果 ×1.5
5. 调整后数值范围：-40 到 +40

【输出要求】
1. 给出调整后的数值
2. 用 20-30 字解释为什么这次影响更大/更小
3. 解释要符合土木工程场景

【输出格式（纯 JSON）】
{
  "adjustedEffects": {
    "cash": -25,
    "health": -30,
    "rep": 10,
    "progress": 5,
    "quality": -10
  },
  "explanation": "你的解释文案"
}
```

---

## 六、成本控制策略

### 1. 成本估算

**使用 GPT-4o-mini**:
- 输入：$0.150 / 1M tokens
- 输出：$0.600 / 1M tokens

**单次调用成本**:
- 动态描述：~300 tokens → $0.0002（约 ¥0.0014）
- 特殊事件：~500 tokens → $0.0003（约 ¥0.0022）
- 奖励调整：~400 tokens → $0.00025（约 ¥0.0018）

**每局游戏成本**（20 回合）:
- 动态描述：20 × 15% × $0.0002 = $0.0006
- 特殊事件：2 × $0.0003 = $0.0006
- 奖励调整：20 × 15% × $0.00025 = $0.00075
- **总计：~$0.002/局（约 ¥0.014/局）**

**1000 DAU**:
- 假设人均 2 局 → 2000 局/天
- 成本：$4/天（约 ¥28/天）
- **月成本：~¥840/月**

---

### 2. 优化方案

**方案 A：响应缓存（节省 40-50%）**
```typescript
class LLMCache {
  private cache = new Map<string, any>();
  private maxSize = 200;

  generateKey(request: LLMRequest): string {
    const { stats, currentRound, baseEvent } = request.context;
    // 对相似状态生成相同的 key
    return `${request.type}_${baseEvent?.id}_${Math.floor(stats.cash/20)}_${Math.floor(stats.health/20)}_${currentRound}`;
  }
}
```

**方案 B：国产替代（成本降至 1%）**
```typescript
// 使用 DeepSeek
const provider = {
  endpoint: 'https://api.deepseek.com/v1/chat/completions',
  model: 'deepseek-chat',
  cost: 0.0014 / 1M // 输入仅 $0.0014/M
};

// 月成本从 ¥840 降至 ¥8
```

**方案 C：预设降级模板**
```typescript
// 为每个事件准备 3-5 个变体
const FALLBACK_DESCRIPTIONS = {
  'client_001': [
    '甲方凌晨发来消息："这个方案再改改，明天开会要用。"',
    '你的手机在凌晨3点响了，是甲方王总的紧急语音...',
    '周五晚上9点，甲方突然来电："小李啊，这个设计能不能..."'
  ]
};
```

---

## 七、数据结构设计

### 1. LLM 增强标记

```typescript
export interface EventCard {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  options: [EventOption, EventOption, EventOption];

  // LLM 相关字段
  isLLMGenerated?: boolean;      // 是否由 LLM 生成
  llmEnhanced?: boolean;          // 描述是否被增强
  llmProvider?: string;           // 使用的提供商
  originalDescription?: string;   // 原始描述
}

export interface EventOption {
  id: string;
  label: string;
  type: OptionType;
  effects: OptionEffect;
  feedback: string;

  // 动态调整标记
  baseEffects?: OptionEffect;
  dynamicAdjusted?: boolean;
  adjustmentReason?: string;
}
```

---

### 2. LLM 调用统计

```typescript
export interface LLMCallLog {
  id: string;
  timestamp: number;
  type: 'enhance' | 'special' | 'adjust';
  gameRound: number;
  playerStats: Stats;
  tokenUsage: number;
  latency: number;
  success: boolean;
  fromCache: boolean;
}

// Store 中记录
const useLLMStore = create((set, get) => ({
  callLogs: [] as LLMCallLog[],
  totalCost: 0,

  getStats: () => ({
    totalCalls: logs.length,
    successRate: logs.filter(l => l.success).length / logs.length,
    avgLatency: logs.reduce((sum, l) => sum + l.latency, 0) / logs.length,
    cacheHitRate: logs.filter(l => l.fromCache).length / logs.length,
    totalCost: get().totalCost
  })
}));
```

---

## 八、降级策略

### 多级降级方案

```typescript
async function callLLMWithFallback(request: LLMRequest): Promise<LLMResponse> {
  // Level 1: 尝试 LLM API
  try {
    const response = await llmService.call(request);
    if (response.success) return response;
  } catch (error) {
    console.warn('LLM API 调用失败');
  }

  // Level 2: 使用缓存
  const cached = llmCache.get(request);
  if (cached) return { success: true, data: cached, fromCache: true };

  // Level 3: 使用预设模板
  const template = getFallbackTemplate(request);
  if (template) return { success: true, data: template, fromTemplate: true };

  // Level 4: 使用原始数据
  return {
    success: false,
    data: request.context.baseEvent,
    fallback: true
  };
}
```

---

## 九、实现路线图

### Phase 1：基础框架（2-3 天）
- [ ] LLM Service 封装
- [ ] Prompt 模板定义
- [ ] 降级策略实现
- [ ] 缓存机制搭建

### Phase 2：核心功能（3-4 天）
- [ ] 功能 1：动态事件描述
- [ ] 功能 2：随机特殊事件
- [ ] 功能 3：动态奖励调整
- [ ] 前端 UI 适配（Loading、标记）

### Phase 3：优化与测试（2-3 天）
- [ ] 成本优化（缓存、批量）
- [ ] 单元测试 + 集成测试
- [ ] 性能优化（并发控制）

### Phase 4：上线与监控（1-2 天）
- [ ] 灰度发布（10% 用户）
- [ ] 监控 Dashboard 搭建
- [ ] 成本告警配置
- [ ] 全量发布

**预计总工期：8-12 天**

---

## 十、监控指标

### 关键指标

```typescript
interface LLMMetrics {
  // 性能指标
  avgLatency: number;        // 平均响应时间
  p95Latency: number;        // 95 分位响应时间
  successRate: number;       // 成功率

  // 成本指标
  dailyCost: number;         // 日均成本
  costPerUser: number;       // 单用户成本

  // 质量指标
  playerEngagement: number;  // LLM 事件的参与度
  fallbackRate: number;      // 降级率

  // 游戏影响
  avgPlaytime: number;       // 平均游戏时长
  retentionRate: number;     // 留存率
}
```

---

## 十一、未来扩展方向

### 1. 个性化 LLM 角色
- 让玩家选择"老板性格"（严厉型、和善型、善变型）
- 在 prompt 中注入性格特征

### 2. LLM 驱动的剧情线
- 多周目记忆系统
- 根据玩家历史生成个性化事件

### 3. 社区投票内容
- 玩家可以给 LLM 内容打分
- 高分内容加入固定事件池

---

## 附录：上线 Checklist

### 功能完整性
- [ ] 动态事件描述功能正常
- [ ] 随机特殊事件生成正确
- [ ] 动态奖励调整合理
- [ ] 降级策略生效
- [ ] 缓存机制工作

### 安全性
- [ ] API Key 在服务端保存
- [ ] Prompt 注入防护启用
- [ ] 限流机制配置
- [ ] 错误信息不泄漏

### 性能
- [ ] 响应时间 < 3 秒（P95）
- [ ] 缓存命中率 > 40%
- [ ] 降级率 < 5%

### 成本
- [ ] 日均成本监控配置
- [ ] 成本告警阈值设置
- [ ] 预算上限设置

### 监控
- [ ] LLM 调用日志记录
- [ ] 错误告警配置
- [ ] Dashboard 展示

### 用户体验
- [ ] Loading 状态显示
- [ ] 降级对用户无感知
- [ ] LLM 内容质量抽检

---

**文档版本**: v1.0
**最后更新**: 2026-01-23
**维护者**: Development Team

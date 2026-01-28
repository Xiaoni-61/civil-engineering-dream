# LLM Prompt 模板

本目录包含《还我一个土木梦》游戏使用的所有 LLM Prompt 模板。

## 目录结构

```
backend/prompts/
├── README.md                          # 本文件
├── event-generation/                  # 事件生成相关模板
│   ├── news-based-event.md           # 基于新闻的事件生成
│   ├── creative-event.md             # 创意事件生成
│   └── examples/                     # 事件示例
│       ├── news-event-example.json   # 新闻事件示例
│       └── creative-event-example.json # 创意事件示例
└── narrative/                        # 叙事生成相关模板
    ├── career-biography.md           # 职业传记生成
    └── biography-example.md          # 传记示例
```

## 使用方法

### 变量替换规则

所有 Prompt 模板使用 `{{variable_name}}` 作为变量占位符，在调用 LLM 前需要替换为实际值。

**示例**：
```typescript
const prompt = fs.readFileSync('prompts/event-generation/news-based-event.md', 'utf-8');
const filledPrompt = prompt
  .replace(/\{\{news_title\}\}/g, newsTitle)
  .replace(/\{\{news_content\}\}/g, newsContent)
  .replace(/\{\{target_rank\}\}/g, targetRank);
```

### 输出格式要求

所有 Prompt 模板要求的输出格式都是 **JSON**，确保可以安全解析。

**验证要求**：
- LLM 返回结果必须是合法的 JSON
- 必须包含所有必需字段
- 数值必须在指定范围内
- 数组字段不能为空（如 `options`）

**错误处理**：
如果 LLM 返回的结果无法解析为 JSON，应该：
1. 记录错误日志（包含原始响应）
2. 返回 null 或默认事件
3. 标记该次生成失败

### 事件生成模板

#### news-based-event.md

**用途**：基于真实新闻生成游戏事件

**变量**：
- `{{news_title}}` - 新闻标题
- `{{news_content}}` - 新闻内容摘要
- `{{target_rank}}` - 目标职级（如：实习生、工程师、项目经理）

**输出**：事件对象（JSON）

**关键约束**：
- 数值影响控制在 ±10% 以内
- 标题 10 字以内
- 描述 50 字以内
- 2-3 个选项，每个选项有明确后果

#### creative-event.md

**用途**：LLM 创作原创游戏事件

**变量**：
- `{{target_rank}}` - 目标职级
- `{{event_type}}` - 事件类型（daily/emergency/opportunity/challenge）

**输出**：事件对象（JSON）

**关键约束**：
- 贴近真实工程场景
- 数值影响控制在 ±15% 以内
- 3 个选项，包含冒险选项
- 添加角色互动元素

### 叙事生成模板

#### career-biography.md

**用途**：为玩家生成个性化的职业传记

**变量**：
- `{{player_name}}` - 玩家名称
- `{{final_rank}}` - 最终职级
- `{{end_reason}}` - 游戏结束原因
- `{{quarters}}` - 季度数
- `{{final_stats}}` - 最终属性（JSON 字符串）
- `{{key_decisions}}` - 关键决策列表

**输出**：Markdown 格式的传记

**关键约束**：
- 三章结构：初入职场、成长之路、结局
- 根据结局类型个性化标题
- 包含关键数据总结

## 质量控制

### 事件生成质量检查

生成事件后应进行以下检查：

```typescript
interface EventQualityCheck {
  hasRequiredFields: boolean;      // 包含所有必需字段
  validTitleLength: boolean;        // 标题长度 ≤ 10
  validDescriptionLength: boolean;  // 描述长度 ≤ 50
  hasMultipleOptions: boolean;      // 选项数量 ≥ 2
  reasonableEffects: boolean;       // 数值影响在范围内
  validRank: boolean;              // 职级字段合法
}

function validateEvent(event: any): EventQualityCheck {
  // 实现验证逻辑
}
```

### 传记生成质量检查

```typescript
interface BiographyQualityCheck {
  hasThreeChapters: boolean;        // 包含三章
  validMarkdown: boolean;           // Markdown 格式正确
  includesStats: boolean;           // 包含统计数据
  personalized: boolean;            // 包含个性化内容
}
```

## 测试

### 使用示例文件测试

每个 Prompt 模板都有对应的示例文件，可用于测试：

```typescript
import newsEventExample from './prompts/event-generation/examples/news-event-example.json';
import creativeEventExample from './prompts/event-generation/examples/creative-event-example.json';

// 使用示例数据测试 Prompt 模板
```

### 本地测试

```bash
# 测试新闻事件生成
curl -X POST http://localhost:3001/api/events/test/news \
  -H "Content-Type: application/json" \
  -d '{"newsTitle": "某地大桥竣工通车", "newsContent": "...", "targetRank": "工程师"}'

# 测试创意事件生成
curl -X POST http://localhost:3001/api/events/test/creative \
  -H "Content-Type: application/json" \
  -d '{"targetRank": "项目经理", "eventType": "emergency"}'
```

## 维护指南

### Prompt 优化

当发现生成质量不佳时，可以调整 Prompt 模板：

1. **添加更多示例**：在 Prompt 中添加 few-shot 示例
2. **明确约束**：加强数值范围、长度等约束
3. **调整语气**：修改角色设定，影响输出风格
4. **添加后处理**：在代码中添加额外的验证和修正

### 版本控制

每次修改 Prompt 模板后：
1. 记录修改日期和原因
2. 对比新旧版本的生成效果
3. 保留旧版本作为备份

## 相关文件

- `backend/src/services/llmService.ts` - LLM 调用封装
- `backend/src/utils/promptTemplates.ts` - Prompt 模板加载和变量替换工具
- `backend/src/config/llm.ts` - LLM 配置

## 联系与反馈

如果遇到问题或有改进建议，请联系开发团队。

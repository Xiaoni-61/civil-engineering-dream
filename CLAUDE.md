# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**还我一个土木梦（Civil Engineering Dream）** - H5 手机网页游戏，模拟土木工程项目经理的职业生涯。玩家从实习生起步，通过事件决策、材料交易、关系维护，最终晋升为合伙人。

## 开发命令

```bash
# 前后端同时启动（需要两个终端）
cd frontend && npm run dev     # http://localhost:3000
cd backend && npm run dev      # http://localhost:3001

# 构建
cd frontend && npm run build   # 前端：tsc + vite build
cd backend && npm run build    # 后端：tsc

# 代码检查
cd frontend && npm run lint    # max-warnings 0
cd backend && npm run lint
```

## 技术栈

| 层级 | 技术 |
|-----|-----|
| 前端框架 | React 18.2 + TypeScript 5.2 |
| 构建工具 | Vite 5.0 |
| 状态管理 | Zustand 4.4 |
| 路由 | React Router 6.21 |
| 样式 | TailwindCSS 3.4 |
| 后端 | Express + TypeScript |
| 数据库 | SQLite |
| LLM | 豆包/DeepSeek/OpenAI/Anthropic（可选） |

## 核心架构

### 游戏流程

```
首页 → 人物创建 → 行动阶段（事件/行动/市场/关系/团队）→ 季度结算 → 循环/结束
```

### 页面路由

| 路由 | 页面 | 说明 |
|-----|-----|-----|
| `/` | Home | 游戏首页 |
| `/character-creation` | CharacterCreationPage | 人物创建（姓名、性别） |
| `/game-new/actions` | ActionsPage | 行动页面（主要游戏界面） |
| `/game-new/events` | EventsPage | 事件处理 |
| `/game-new/market` | MarketPage | 材料市场交易 |
| `/game-new/relations` | RelationsPage | 关系维护 |
| `/game-new/team` | TeamPage | 团队管理 |
| `/game-new/settlement` | QuarterlySettlementPage | 季度结算 |
| `/game-new/result` | Result | 游戏结束结算 |
| `/leaderboard` | Leaderboard | 排行榜 |

### 游戏系统

**核心数值**：Cash（现金）、Health（健康）、Rep（声誉）

**职级系统**（6 级）：实习生 → 工程师 → 高级工程师 → 项目经理 → 项目总监 → 合伙人
- 注意：从 2026-02-03 起移除了"助理工程师"职级，简化为 6 级系统
- 所有配置在 `shared/types/game.ts` 的 `RANK_CONFIGS` 中

**材料市场**：水泥、钢筋、砂石、混凝土 - 价格波动，可低买高卖

**关系系统**：甲方、监理、设计院、劳务队、政府部门 - 需要定期维护

**失败条件**：Cash < 0（破产）、Health ≤ 0（过劳）、Rep ≤ 0（封杀）

**存档系统**（双槽位）：
- 基于后端 SQLite 持久化存储
- Slot1: 当前游戏存档（自动更新）
- Slot2: 备份存档（新游戏时自动保存旧的 Slot1）
- 季度结算后自动保存，支持继续游戏和读取存档

### 状态管理架构

**核心状态管理**：使用 Zustand 实现全局状态管理。

- **`gameStoreNew.ts`**：主 store，包含完整的行动点、团队、事件系统

**状态更新模式**：
```typescript
// Zustand 状态更新的两种形式
set({ field: newValue })                    // 简单更新
set((prev) => ({ field: prev.field + 1 }))  // 基于前一状态（推荐用于依赖旧值的更新）
```

**关键设计模式**：

1. **预生成 + 缓存模式**（价格预测系统）：
   - 提前生成下季度真实价格存储在 `nextQuarterRealPrices`
   - 价格预测基于真实价格 + 准确率偏差
   - 预测结果缓存在 `pricePredictions`，确保同季度内一致性

2. **事件预告系统**（季度结算）：
   - `finishQuarter()` 预生成下季度开始事件但不应用
   - 存储在 `settlement.nextQuarterStartEvents`
   - 在结算页面展示给玩家
   - `nextQuarter()` 读取并应用预生成的事件

3. **价格历史更新**：
   - `nextQuarter()` 必须同步更新 `materialPriceHistory`
   - 历史用于计算最高/最低价格统计
   - 最多保留 50 个季度数据

### 关键文件

| 文件 | 职责 |
|-----|-----|
| `frontend/src/store/gameStoreNew.ts` | Zustand store，包含完整游戏逻辑 |
| `frontend/src/data/events/` | 事件系统：`commonEvents.ts`, `bonusEvents.ts`, `quarterStartEvents.ts` 等 |
| `frontend/src/data/constants.ts` | 游戏配置常量：行动、材料、关系、职级等 |
| `shared/types/game.ts` | 游戏状态类型定义，包含 `RANK_CONFIGS` |
| `shared/types/player.ts` | 玩家属性、效果类型定义 |
| `shared/types/event.ts` | 事件卡类型定义 |
| `shared/types/save.ts` | 存档系统类型定义 |
| `backend/src/api/saves.ts` | 存档系统 API（保存/加载/列表） |
| `backend/src/services/scheduler.ts` | 定时任务调度器（新闻生成、事件补充） |
| `backend/src/services/eventGenerator.ts` | LLM 事件生成器（news/creative） |
| `backend/src/services/rssFetcher.ts` | RSS 新闻抓取器 |
| `backend/src/config/rss-sources.ts` | RSS 源配置（7个可用源） |
| `backend/src/services/llmService.ts` | LLM 调用封装 |
| `backend/prompts/` | LLM Prompt 模板目录 |

### 路径别名

- `@/` → `frontend/src/`
- `@shared/` → `shared/`

## 后端系统架构

### LLM 配置（可选）

在 `backend/.env` 配置：

```env
LLM_PROVIDER=doubao|deepseek|openai|anthropic
LLM_API_KEY=your_key
LLM_BASE_URL=https://ark.cn-beijing.volces.com/api/v3  # 豆包需要
LLM_MODEL=doubao-seed-1-6-lite-251015
```

**架构原则**：
- 前端只调用 `/api/llm/*`，不直接调用 LLM API
- Prompt 模板在后端 `backend/prompts/` 目录管理
- LLM 失败时自动降级到预设内容

### 动态事件生成系统

**两种事件生成方式**：

1. **News 类型**（基于真实新闻）：
   - RSS 抓取器从 7 个新闻源获取实时新闻
   - LLM 将新闻转换为游戏事件
   - 每日凌晨 3:00 自动运行
   - 配置文件：`backend/src/config/rss-sources.ts`

2. **Creative 类型**（LLM 创意生成）：
   - LLM 直接创意生成游戏事件
   - 当事件池数量 < 20 时自动补充
   - 每 2 小时检查一次

**定时任务调度器**（`backend/src/services/scheduler.ts`）：
```
- 每日凌晨 3:00：抓取新闻 + 生成事件
- 每日凌晨 4:00：清理过期事件（7天）
- 每 2 小时：检查事件数量并补充
```

**数据库表**：
- `dynamic_events`：存储生成的事件
- `event_usage_log`：记录事件使用情况
- `career_biographies`：职业传记缓存

### 存档系统架构

**双槽位机制**：
- `game_saves` 表：`device_id` + `slot_id` (1 or 2)
- 同一 `run_id`：更新 Slot1
- 不同 `run_id`：Slot1 → Slot2，新游戏 → Slot1
- 使用 `INSERT OR REPLACE` 保证原子性

**API 接口**：
- `POST /api/saves/save`：保存存档
- `GET /api/saves/list?deviceId=xxx`：获取存档列表
- `POST /api/saves/load`：加载存档

**前端集成**：
- `gameStoreNew.saveGame()`：保存完整游戏状态
- `gameStoreNew.loadGame(slotId)`：恢复游戏状态
- 失败时自动降级到 localStorage 备份

## 设计规范

- **色板**：`brand-*`（飞书蓝）、`engineering-*`（工程色）、`status-*`（状态色）
- **动画**：`animate-slide-up`、`animate-fade-in`、`animate-scale-in`
- **适配**：Mobile First（375px iPhone 优先）

## 开发流程

### 工作日志

每次完成任务后更新 `WORKLOG.md`，记录：
- 时间（日期）
- 改动点（问题描述、解决方案）
- 涉及文件
- Review 状态
- 特殊改动点

### 测试脚本

项目包含多个测试脚本用于验证功能：

**后端测试**：
```bash
cd backend

# RSS 源测试
npx tsx test-rss-sources.ts        # 测试第一批 RSS 源
npx tsx test-rss-sources-2.ts      # 测试第二批 RSS 源
npx tsx test-new-rss-config.ts     # 测试当前配置

# 事件生成测试
npx tsx test-news-generation.ts          # 测试新闻事件生成
npx tsx test-full-news-generation.ts     # 完整流程测试

# 存档系统测试
bash test-save-system.sh            # 20个端到端测试用例
```

## 常见问题与调试指南

### 状态更新问题

**症状**：状态更新后 UI 没有反映最新值（如季度结算后现金不对）

**根因**：使用 `get()` 获取状态快照，但快照可能不包含刚刚的更新（Zustand 批处理）

**解决**：使用 `set((prev) => { ... })` 形式，`prev` 总是最新状态
```typescript
// ❌ 错误：可能读到旧值
const state = get();
const newValue = state.value + 1;
set({ value: newValue });

// ✅ 正确：总是读到最新值
set((prev) => ({ value: prev.value + 1 }));
```

### 价格预测不一致

**症状**：同一季度多次点击材料，预测结果不同

**根因**：预测系统没有缓存，每次生成随机预测

**解决**：
1. 确保 `nextQuarterRealPrices` 在游戏开始和每次 `nextQuarter()` 时预生成
2. 确保 `generatePricePrediction()` 先检查 `pricePredictions` 缓存
3. 确保 `nextQuarter()` 时清空缓存：`pricePredictions: null`

### 价格历史数据缺失

**症状**：最高/最低价格与当前价不匹配，涨跌幅异常（如1000%+）

**根因**：`nextQuarter()` 更新 `materialPrices` 时忘记更新 `materialPriceHistory`

**解决**：在 `nextQuarter()` 中添加：
```typescript
const newHistory: Record<MaterialType, number[]> = {} as any;
Object.values(MaterialType).forEach(type => {
  const history = [...prev.materialPriceHistory[type]];
  history.push(newPrices[type].currentPrice);
  if (history.length > 50) history.shift();
  newHistory[type] = history;
});
// 在 return 中添加：materialPriceHistory: newHistory
```

### RSS 源失效

**症状**：动态事件生成系统只产生 creative 类型，没有 news 类型事件

**根因**：RSS 新闻源 URL 失效（404、格式错误等）

**解决**：
1. 使用测试脚本验证 RSS 源：`npx tsx backend/test-rss-sources.ts`
2. 更新 `backend/src/config/rss-sources.ts` 配置为可用源
3. 重启后端服务使配置生效

**当前可用源**（2026-01-30 验证）：
- 人民网：时政、财经、社会、科技（100条/次）
- 中国新闻网：国内、财经、社会（30条/次）

## 代码规范

### TypeScript 类型

- 严格模式：`max-warnings 0`
- 显式类型标注联合类型：`const trend: 'up' | 'down' | 'stable' = ...`
- 避免 `any`，使用 `as any` 时添加注释说明原因

### 状态管理原则

1. **数据一致性**：相关数据同步更新（如价格和历史）
2. **预生成模式**：需要确定性的随机数据应提前生成并缓存
3. **原子更新**：使用 `set((prev) => {...})` 确保基于最新状态更新

## 游戏策划文档维护

**重要规则**：每当游戏的机制和玩法发生变化时，必须同步更新 `docs/GAME_DESIGN_DOCUMENT.md`。

### 需要更新策划文档的变更类型：

1. **数值调整**：任何游戏数值的修改（属性范围、阈值、概率、奖励等）
   - 例如：调整职级晋升要求、修改行动效果、变更事件概率

2. **机制新增**：添加新的游戏机制或系统
   - 例如：新增隐藏选项类型、添加新的资源系统

3. **玩法变更**：改变现有玩法的运作方式
   - 例如：修改事件触发逻辑、调整结算流程

4. **系统重构**：对现有系统进行结构性修改
   - 例如：重新设计职级系统、重写关系维护机制

### 更新流程：

```
1. 修改代码实现
   ↓
2. 更新 docs/GAME_DESIGN_DOCUMENT.md
   ↓
3. 在 WORKLOG.md 中记录文档更新
   ↓
4. 提交代码时包含文档更新
```

### 文档更新检查清单：

- [ ] 更新相关章节的数值表格
- [ ] 添加新增机制的说明章节
- [ ] 更新公式速查表（如有公式变化）
- [ ] 更新附录（如隐藏选项列表）
- [ ] 更新文档版本号和更新日期

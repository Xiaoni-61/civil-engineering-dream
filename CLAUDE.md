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
首页 → 事件阶段（处理事件卡）→ 策略阶段（交易/关系维护）→ 季度结算 → 循环/结束
```

### 页面路由

| 路由 | 页面 | 说明 |
|-----|-----|-----|
| `/` | Home | 游戏首页 |
| `/game` | Game | 事件阶段（处理事件卡） |
| `/strategy` | StrategyPhase | 策略阶段（材料交易、关系维护） |
| `/settlement` | QuarterlySettlement | 季度结算（工资、仓储费、晋升检查） |
| `/result` | Result | 游戏结束结算 |
| `/leaderboard` | Leaderboard | 排行榜 |

### 游戏系统

**核心数值**：Cash（现金）、Health（健康）、Rep（声誉）

**职级系统**（6 级）：实习生 → 工程师 → 高级工程师 → 项目经理 → 项目总监 → 合伙人

**材料市场**：水泥、钢筋、砂石、混凝土 - 价格波动，可低买高卖

**关系系统**：甲方、监理、设计院、劳务队、政府部门 - 需要定期维护

**失败条件**：Cash < 0（破产）、Health ≤ 0（过劳）、Rep ≤ 0（封杀）

### 状态管理架构

**核心状态管理**：使用 Zustand 实现全局状态管理，主要有两个 store：

- **`gameStore.ts`**：旧版 store（仍在使用，部分页面依赖）
- **`gameStoreNew.ts`**：新版 store（推荐使用，包含完整的行动点、团队、事件系统）

**重要**：新功能应使用 `gameStoreNew.ts`。两个 store 目前共存，逐步迁移中。

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
| `frontend/src/store/gameStoreNew.ts` | **主要** Zustand store，包含完整游戏逻辑 |
| `frontend/src/store/gameStore.ts` | 旧版 store（逐步废弃中） |
| `frontend/src/data/events/` | 事件系统：`commonEvents.ts`, `bonusEvents.ts`, `quarterStartEvents.ts` 等 |
| `frontend/src/data/constants.ts` | 游戏配置常量：行动、材料、关系、职级等 |
| `shared/types/game.ts` | 游戏状态类型定义 |
| `shared/types/player.ts` | 玩家属性、效果类型定义 |
| `shared/types/event.ts` | 事件卡类型定义 |
| `backend/src/services/llmService.ts` | LLM 调用封装 |
| `backend/src/utils/promptTemplates.ts` | LLM Prompt 模板 |

### 路径别名

- `@/` → `frontend/src/`
- `@shared/` → `shared/`

## LLM 配置（可选）

在 `backend/.env` 配置：

```env
LLM_PROVIDER=doubao|deepseek|openai|anthropic
LLM_API_KEY=your_key
LLM_BASE_URL=https://ark.cn-beijing.volces.com/api/v3  # 豆包需要
LLM_MODEL=doubao-seed-1-6-lite-251015
```

**架构原则**：
- 前端只调用 `/api/llm/*`，不直接调用 LLM API
- Prompt 模板在后端管理
- LLM 失败时自动降级到预设内容

## 设计规范

- **色板**：`brand-*`（飞书蓝）、`engineering-*`（工程色）、`status-*`（状态色）
- **动画**：`animate-slide-up`、`animate-fade-in`、`animate-scale-in`
- **适配**：Mobile First（375px iPhone 优先）

## 工作日志

每次完成任务后更新 `WORKLOG.md`，记录时间、改动点、涉及文件和 review 状态。

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

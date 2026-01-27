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

**职级系统**（7 级）：实习生 → 助理工程师 → 工程师 → 高级工程师 → 项目经理 → 项目总监 → 合伙人

**材料市场**：水泥、钢筋、砂石、混凝土 - 价格波动，可低买高卖

**关系系统**：甲方、监理、设计院、劳务队、政府部门 - 需要定期维护

**失败条件**：Cash < 0（破产）、Health ≤ 0（过劳）、Rep ≤ 0（封杀）

### 关键文件

| 文件 | 职责 |
|-----|-----|
| `frontend/src/store/gameStore.ts` | Zustand store，管理所有游戏状态 |
| `frontend/src/data/events.ts` | 60+ 事件卡定义 |
| `frontend/src/data/constants.ts` | 材料/关系/职级的显示配置 |
| `shared/types/game.ts` | 核心类型定义（职级、材料、关系、配置表） |
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

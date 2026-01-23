# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述 (Project Overview)

**还我一个土木梦（Civil Engineering Dream）**
- 类型：H5 手机网页小游戏（3-5 分钟一局）
- 核心玩法：土木项目管理模拟 + 事件决策 + 战绩单结算
- 目标用户：土木/建筑/工程管理从业者与泛职场用户
- 完整 PRD：`还我一个土木梦prd.md`

## 技术架构

### 前端 (Frontend)
- **框架**：React/Vue/纯 TypeScript（可选，按开发者习惯选择）
- **构建工具**：Vite（推荐）或 Create React App
- **核心模块**：
  - 事件卡牌渲染器（事件卡 UI 展示）
  - 游戏状态管理（5 个数值：Cash、Health、Rep、Progress、Quality）
  - 结算计算器（分数、职级、战绩数据计算）
  - Canvas 海报生成器（用户成绩单导出为图片）
  - OG meta 标签配置（社交分享预览卡）
  - **LLM 增强系统**（动态内容生成，详见 `docs/plans/2026-01-23-llm-enhancement-design.md`）
- **适配**：Mobile First（375px iPhone 优先），响应式适配
- **依赖举例**：canvas-related 库（用于海报生成）、分享 SDK、LLM API SDK

### 后端 (Backend)
- **必需性**：排行榜系统需要后端支撑
- **框架**：Node.js/Python/Go（可选）
- **核心 API**：
  - `POST /run/start`：创建一局游戏，返回 runId + serverSeed
  - `POST /run/finish`：提交结算数据（含签名校验）
  - `GET /leaderboard`：查询排行榜（总榜、利润榜、工期榜）
  - `GET /me/rank`：查询当前玩家排名
- **数据库表**：runs、leaderboard_overall、leaderboard_profit、leaderboard_duration
- **反作弊**：token 签名校验 + 限流 + 异常值拦截

### 部署
- **前端**：GitHub Pages 或 Cloudflare Pages
- **后端**：Serverless（AWS Lambda / 腾讯云函数 / Vercel）或传统服务器

## 核心游戏规则速览

| 概念 | 说明 |
|------|------|
| **5个数值** | Cash(现金流) / Health(身心健康) / Rep(声望) / Progress(工期) / Quality(质量) |
| **失败条件** | Cash < 0、Health ≤ 0、Progress 超期太久触发 |
| **每回合** | 1 张事件卡 + 3 个选项（赶工/控成本/保质量），选项会影响数值 |
| **结算输出** | 职级称号 + 净资产 + 项目履历 + 全球排名（战绩单四件套） |
| **排行榜** | 综合榜（综合评分）、利润榜（净资产）、工期榜（完工回合数） |

## 开发指南

### 项目结构规划（推荐）
```
civil-engineering-dream/
├── frontend/              # 前端（H5）
│   ├── src/
│   │   ├── components/   # UI 组件（事件卡、按钮、排行榜等）
│   │   ├── pages/       # 页面（首页、游戏页、结算页、排行榜页）
│   │   ├── store/       # 状态管理（游戏状态、数值管理）
│   │   ├── api/         # API 调用层
│   │   │   ├── llmApi.ts            # 调用后端 /api/llm/*（不直接调用LLM）
│   │   │   └── gameApi.ts           # 调用后端游戏相关接口
│   │   ├── utils/       # 工具函数
│   │   │   ├── calculator.ts        # 计算器、海报生成
│   │   │   └── helpers.ts           # 辅助函数
│   │   ├── data/        # 游戏数据
│   │   │   ├── events.ts            # 预设事件卡
│   │   │   ├── fallbackEvents.ts    # 降级事件（预设变体）
│   │   │   └── titles.ts            # 职级配置
│   │   ├── assets/      # 静态资源
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts / webpack.config.js
├── backend/              # 后端 API
│   ├── src/
│   │   ├── api/         # API 端点
│   │   │   ├── run.ts               # /run/start、/run/finish
│   │   │   ├── leaderboard.ts       # /leaderboard
│   │   │   └── llm.ts               # /api/llm/* LLM 路由
│   │   ├── services/    # 业务逻辑
│   │   │   ├── runService.ts        # 游戏会话管理
│   │   │   ├── llmService.ts        # LLM 核心服务（实际调用LLM API）
│   │   │   ├── llmProvider.ts       # LLM 提供商封装
│   │   │   ├── llmCache.ts          # LLM 响应缓存
│   │   │   └── leaderboardService.ts # 排行榜管理
│   │   ├── utils/       # 工具函数
│   │   │   └── promptTemplates.ts   # LLM Prompt 模板（在后端！）
│   │   ├── models/      # 数据模型（Run、Leaderboard 等）
│   │   ├── middleware/  # 中间件（签名校验、限流等）
│   │   └── main.ts / server.js
│   ├── package.json
│   └── .env.example     # API Key 存储在后端！
├── shared/               # 前后端共享代码
│   ├── types/           # TypeScript 类型定义
│   ├── constants/       # 游戏常量
│   └── utils/           # 通用工具函数
├── docs/                # 文档
│   ├── plans/           # 实现计划
│   │   ├── 2026-01-23-civil-engineering-dream-mvp.md
│   │   ├── 2026-01-23-llm-enhancement-design.md      # LLM 设计文档
│   │   └── llm-architecture-summary.md              # LLM 架构总结
│   └── README.md
├── 还我一个土木梦prd.md  # 完整产品需求文档
├── CLAUDE.md            # 本文件
└── WORKLOG.md           # 开发日志（工作完成记录）
```

**⚠️ 重要：LLM 相关架构原则**
- **前端**：只负责调用后端 `/api/llm/*` 接口，不直接接触 LLM API
- **后端**：实际调用 LLM API，API Key 只存在后端
- **Prompt 模板**：必须在后端（`backend/src/utils/promptTemplates.ts`）
- **缓存**：在后端统一管理（`backend/src/services/llmCache.ts`）

### 常用开发命令（待实现）

**前端开发**：
```bash
# 项目初始化
cd frontend && npm install

# 开发模式（热更新）
npm run dev

# 构建生产包
npm run build

# 本地预览生产包
npm run preview

# Lint & Format
npm run lint
npm run format
```

**后端开发**：
```bash
# 项目初始化
cd backend && npm install

# 开发模式
npm run dev

# 运行测试
npm run test

# 构建/部署
npm run build
```

### 关键文件与模块说明

| 文件/目录 | 用途 | 负责人指引 |
|----------|------|---------|
| `frontend/src/store/` | 游戏状态管理 | 管理 5 个数值状态、回合逻辑、失败判定 |
| `frontend/src/utils/calculator.ts` | 结算计算逻辑 | 计算最终分数、职级、排名等 |
| `frontend/src/utils/posterGenerator.ts` | Canvas 海报生成 | 生成玩家成绩单图片（用于分享） |
| `frontend/src/components/EventCard.tsx` | 事件卡组件 | 展示事件卡牌、处理玩家选择 |
| `frontend/src/api/llmApi.ts` | LLM API 客户端 | 调用后端 /api/llm/* 接口（不直接调用LLM） |
| `frontend/src/data/fallbackEvents.ts` | 降级事件 | LLM 失败时的预设内容变体 |
| `backend/src/api/llm.ts` | LLM 路由 | LLM 相关的 HTTP 路由（/api/llm/*） |
| `backend/src/services/llmService.ts` | LLM 核心服务 | 实际调用 LLM API、成本控制、监控 |
| `backend/src/services/llmProvider.ts` | LLM 提供商 | 封装多个 LLM 提供商（OpenAI、DeepSeek、Claude） |
| `backend/src/services/llmCache.ts` | LLM 缓存 | 缓存 LLM 响应，节省成本 |
| `backend/src/utils/promptTemplates.ts` | Prompt 模板 | LLM 提示词模板（在后端！） |
| `backend/src/api/leaderboard.ts` | 排行榜 API | 处理排行榜查询、更新、缓存 |
| `backend/src/middleware/auth.ts` | 反作弊 | token 签名验证、限流、异常值拦截 |
| `backend/src/database/schema.sql` | 数据库结构 | runs、leaderboard 三张表定义 |
| `docs/plans/2026-01-23-llm-enhancement-design.md` | LLM 设计文档 | 完整的 LLM 增强系统设计方案 |

## 关键设计决策

1. **事件卡库**：MVP 需要 ≥60 张卡牌，包含土木梗（甲方改图、暴雨停工、进度款拖欠等）
2. **无强制登录**：支持匿名游戏，设备 ID 作为唯一标识
3. **海报生成优于链接分享**：用户更愿意分享生成的战绩图
4. **轻量反作弊**：token + 限流 + 异常值检测（MVP 阶段无需复杂防护）
5. **性能指标**（目标）：开局转化 ≥70%，完局率 ≥45%，分享率 ≥10%
6. **LLM 增强系统**（可选功能）：
   - 定位：随机惊喜点缀（10-20% 触发概率）
   - 功能：动态事件描述 + 随机特殊事件 + 动态奖励调整
   - 成本：~¥840/月（1000 DAU，使用 GPT-4o-mini）或 ~¥8/月（使用 DeepSeek）
   - 降级：完整的 Fallback 机制，LLM 失败不影响游戏体验
   - 详细设计：见 `docs/plans/2026-01-23-llm-enhancement-design.md`

## 开发里程碑参考（来自 PRD）

- **Day 1-2**：事件池定稿 + 数值模型完成（60 张卡牌）
- **Day 3-4**：前端核心流程跑通（开局→回合→结算）
- **Day 5**：排行榜后端 + 排行榜前端页面
- **Day 6**：海报生成 + OG 分享预览配置
- **Day 7**：上线 (GitHub Pages/Cloudflare Pages) + 埋点验证

## 工作日志

见 `WORKLOG.md`（开发完成时更新本文件记录改动点、文件和 review 状态）

# 开发工作日志 (WORKLOG)

## 2026-01-23

### 项目目录结构初始化

**改动点**:
- 创建前后端分离的项目目录结构
- 为每个子目录编写 README 说明文件

**涉及文件** (共创建 19 个 README.md):

**前端 (10 个)**:
- `frontend/README.md` - 前端项目总览
- `frontend/public/README.md` - 公共静态资源说明
- `frontend/src/README.md` - 源码目录总览
- `frontend/src/components/README.md` - UI 组件说明
- `frontend/src/pages/README.md` - 页面说明（4 个页面）
- `frontend/src/store/README.md` - 状态管理说明
- `frontend/src/utils/README.md` - 工具函数说明
- `frontend/src/assets/README.md` - 静态资源说明
- `frontend/src/data/README.md` - 游戏数据说明
- `frontend/src/types/README.md` - TypeScript 类型定义说明

**后端 (7 个)**:
- `backend/README.md` - 后端项目总览
- `backend/src/README.md` - 源码目录总览
- `backend/src/api/README.md` - API 路由说明
- `backend/src/services/README.md` - 业务逻辑说明
- `backend/src/models/README.md` - 数据模型说明
- `backend/src/middleware/README.md` - 中间件说明
- `backend/src/database/README.md` - 数据库说明

**辅助目录 (2 个)**:
- `docs/README.md` - 项目文档目录说明
- `shared/README.md` - 前后端共享代码说明

**目录结构**:
```
civil-engineering-dream/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── store/
│       ├── utils/
│       ├── assets/
│       ├── data/
│       └── types/
├── backend/
│   └── src/
│       ├── api/
│       ├── services/
│       ├── models/
│       ├── middleware/
│       └── database/
├── docs/
└── shared/
```

**Review 状态**: ✅ 已完成
- 目录结构符合 CLAUDE.md 中的规划
- 所有 README 内容与 PRD 要求一致
- 每个 README 包含：目录用途、文件列表、职责说明、依赖关系

---

### MVP 实现计划编写

**改动点**:
- 编写完整的 MVP 技术实现计划

**涉及文件**:
- `docs/plans/2026-01-23-civil-engineering-dream-mvp.md` - MVP 实现计划

**计划结构** (共 7 个 Phase, 14 个 Task):

| Phase | 内容 | Tasks |
|-------|------|-------|
| Phase 1 | 前端项目初始化 | 1.1 Vite+React+TS 初始化, 1.2 路由配置 |
| Phase 2 | 共享类型与数据 | 2.1 类型定义, 2.2 游戏常量, 2.3 事件卡数据(20张) |
| Phase 3 | 游戏状态管理 | 3.1 Zustand Store |
| Phase 4 | UI 组件 | 4.1 状态条组件, 4.2 事件卡组件 |
| Phase 5 | 页面实现 | 5.1 首页, 5.2 游戏页, 5.3 结算页, 5.4 排行榜页 |
| Phase 6 | 配置优化 | 6.1 路径别名, 6.2 组件索引 |
| Phase 7 | 后端 API | 7.1 Express 初始化 |

**技术选型**:
- 前端: React 18 + TypeScript + Vite + Zustand + TailwindCSS
- 后端: Node.js + Express + SQLite
- 共享: TypeScript 类型定义

**Review 状态**: ⏳ 待用户确认

---

### LLM 增强游戏系统设计

**改动点**:
- 完成 LLM 增强系统的完整设计方案
- 更新项目目录结构，添加 LLM 相关模块
- 更新 CLAUDE.md 技术架构说明

**涉及文件**:
- `docs/plans/2026-01-23-llm-enhancement-design.md` - LLM 增强系统完整设计文档
- `CLAUDE.md` - 更新技术架构、目录结构、关键文件说明
- `frontend/src/services/README.md` - 前端 LLM 服务层说明
- `backend/src/api/README.md` - 后端 LLM API 端点说明

**设计概要**:
1. **核心定位**: 随机惊喜点缀（10-20% 触发概率）
2. **三大功能**:
   - 动态事件描述生成（每回合 15% 概率）
   - 随机特殊事件生成（每局 1-2 次彩蛋）
   - 动态奖励调整（根据玩家状态智能调整数值）
3. **技术架构**:
   - 多 LLM 提供商支持（OpenAI、DeepSeek、Claude）
   - 四级降级策略（API → 缓存 → 模板 → 原始数据）
   - 响应缓存机制（节省 40-50% 成本）
4. **成本预估**:
   - GPT-4o-mini: ~¥840/月（1000 DAU）
   - DeepSeek: ~¥8/月（1000 DAU）
5. **实现路线**:
   - Phase 1: 基础框架（2-3 天）
   - Phase 2: 核心功能（3-4 天）
   - Phase 3: 优化测试（2-3 天）
   - Phase 4: 上线监控（1-2 天）
   - **预计总工期**: 8-12 天

**新增目录结构**:
```
frontend/src/
├── services/           # 新增：服务层
│   ├── llmService.ts       # LLM API 调用封装
│   ├── llmCache.ts         # LLM 响应缓存
│   └── apiClient.ts        # 通用 API 客户端
├── utils/
│   ├── promptTemplates.ts  # 新增：LLM Prompt 模板
│   └── llmHelpers.ts       # 新增：LLM 辅助函数
└── data/
    └── fallbackEvents.ts   # 新增：降级事件变体

backend/src/
├── api/
│   └── llm.ts              # 新增：LLM 代理端点
└── services/
    └── llmService.ts       # 新增：LLM 调用服务
```

**特殊改动**:
- Prompt 工程优化：3 套完整的提示词模板（动态描述、特殊事件、奖励调整）
- 成本控制策略：缓存、批量请求、模型降级、国产替代
- 监控体系设计：调用统计、成本追踪、性能指标

**Review 状态**: ⚠️ 架构错误已修正
- ❌ 原设计错误：前端直接调用 LLM API（暴露 API Key）
- ✅ 修正后：LLM API 调用完全在后端完成
- ✅ 前后端职责明确分离
- ✅ 安全性和成本控制得到保障

---

### LLM 架构重大修正（前后端职责分离）

**修正原因**：
原设计将 LLM API 调用放在前端，存在严重安全隐患和架构问题

**改动点**：
- 重写 LLM 服务架构，明确前后端职责分离
- 将所有 LLM API 调用移至后端
- 前端只负责调用后端接口和 UI 展示

**涉及文件**：
- `docs/plans/2026-01-23-llm-enhancement-design.md` - 修正整体架构和代码示例
- `docs/plans/llm-architecture-summary.md` - 新增架构总结文档

**修正后的正确架构**：

**前端（frontend/）**：
```
├── api/
│   └── llmApi.ts          # 封装对后端 /api/llm/* 的调用（不直接调用LLM）
├── store/
│   └── gameStore.ts       # 判断触发时机，调用 llmApi
```

**后端（backend/）**：
```
├── api/
│   └── llm.ts             # LLM API 路由
├── services/
│   ├── llmService.ts      # LLM 核心服务（实际调用LLM API）
│   ├── llmProvider.ts     # LLM 提供商封装
│   └── llmCache.ts        # 缓存管理
└── utils/
    └── promptTemplates.ts # Prompt 模板（在后端！）
```

**核心原则**：
1. **API Key 安全**：只存在后端，前端永远看不到
2. **成本控制**：后端统一限流、缓存
3. **Prompt 工程**：模板在后端，前端不接触
4. **降级策略**：后端统一处理，返回 fallback

**数据流向**：
```
前端触发 → 调用后端接口 → 后端调用LLM → 后端返回结果 → 前端展示
```

**Review 状态**: ✅ 架构修正完成
- 前后端职责清晰
- API Key 安全得到保障
- 成本控制在后端统一管理
- 完整的安全和降级策略

**下一步**:
- [ ] 根据修正后的架构实现后端 LLM Service
- [ ] 在后端编写 Prompt 模板
- [ ] 实现后端缓存和降级机制
- [ ] 实现前端 llmApi 客户端
- [ ] 前后端联调测试

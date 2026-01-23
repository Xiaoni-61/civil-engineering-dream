# Pages - 页面

## 目录用途

存放页面级组件，每个页面对应一个路由。页面组件负责组合 components 并连接 store。

## 应包含的页面

### 1. HomePage（首页）

**路由**: `/`

**职责**:
- 展示游戏标题和介绍
- "开始游戏"按钮
- 排行榜入口
- 游戏规则简介

**关键交互**:
- 点击开始 → 调用 `/run/start` API → 跳转游戏页

---

### 2. GamePage（游戏页）

**路由**: `/game`

**职责**:
- 展示当前事件卡
- 展示 5 个数值状态
- 展示回合进度
- 处理玩家选择

**关键交互**:
- 选择选项 → 更新数值 → 检测失败条件 → 下一回合/结算

**状态依赖**:
- 游戏状态（当前回合、数值、事件队列）
- 需要监听失败条件（Cash < 0、Health ≤ 0、超期触发）

---

### 3. ResultPage（结算页）

**路由**: `/result`

**职责**:
- 展示职级称号
- 展示最终成绩（净资产、项目履历）
- 展示全球排名
- 生成分享海报
- 再来一局/查看排行榜按钮

**关键交互**:
- 页面加载 → 调用 `/run/finish` 提交成绩
- 点击分享 → 生成 Canvas 海报 → 保存/分享

---

### 4. LeaderboardPage（排行榜页）

**路由**: `/leaderboard`

**职责**:
- 展示三类排行榜（综合榜、利润榜、工期榜）
- 标签切换
- 展示当前玩家排名（如有）
- 返回首页按钮

**关键交互**:
- 切换标签 → 请求对应排行榜数据
- 加载时请求 `/me/rank` 获取自己排名

## 页面间跳转流程

```
HomePage → GamePage → ResultPage → LeaderboardPage
    ↑          ↓           ↓              ↓
    └──────────┴───────────┴──────────────┘
```

## 文件结构建议

```
pages/
├── HomePage/
│   ├── index.tsx
│   └── HomePage.module.css
├── GamePage/
│   ├── index.tsx
│   └── GamePage.module.css
├── ResultPage/
│   ├── index.tsx
│   └── ResultPage.module.css
└── LeaderboardPage/
    ├── index.tsx
    └── LeaderboardPage.module.css
```

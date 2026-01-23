# 还我一个土木梦 MVP 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现一个 H5 手机网页小游戏，玩家通过事件决策管理土木项目，最终获得职级、净资产和排名的战绩单。

**Architecture:** 前后端分离架构。前端使用 React + TypeScript + Vite 构建 SPA，通过 Zustand 管理游戏状态。后端使用 Node.js + Express + SQLite 提供排行榜 API。前后端通过 shared 目录共享类型定义。

**Tech Stack:** React 18, TypeScript, Vite, Zustand, TailwindCSS, Express, SQLite, html2canvas

---

## Phase 1: 前端项目初始化

### Task 1.1: 初始化 Vite + React + TypeScript 项目

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`

**Step 1: 初始化项目**

```bash
cd frontend && npm create vite@latest . -- --template react-ts
```

**Step 2: 安装核心依赖**

```bash
cd frontend && npm install react-router-dom zustand tailwindcss postcss autoprefixer
```

**Step 3: 初始化 TailwindCSS**

```bash
cd frontend && npx tailwindcss init -p
```

**Step 4: 配置 tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6B35',
        secondary: '#2E4057',
        success: '#4CAF50',
        danger: '#F44336',
      },
    },
  },
  plugins: [],
}
```

**Step 5: 配置 src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary: #FF6B35;
  --color-secondary: #2E4057;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  background-color: #F5F5F5;
}
```

**Step 6: 验证开发服务器启动**

```bash
cd frontend && npm run dev
```
Expected: 浏览器打开 http://localhost:5173 显示 Vite + React 页面

**Step 7: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): 初始化 Vite + React + TypeScript 项目"
```

---

### Task 1.2: 配置路由系统

**Files:**
- Create: `frontend/src/pages/HomePage/index.tsx`
- Create: `frontend/src/pages/GamePage/index.tsx`
- Create: `frontend/src/pages/ResultPage/index.tsx`
- Create: `frontend/src/pages/LeaderboardPage/index.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: 创建页面占位组件**

`frontend/src/pages/HomePage/index.tsx`:
```tsx
export default function HomePage() {
  return <div className="p-4">首页 - 还我一个土木梦</div>;
}
```

`frontend/src/pages/GamePage/index.tsx`:
```tsx
export default function GamePage() {
  return <div className="p-4">游戏页</div>;
}
```

`frontend/src/pages/ResultPage/index.tsx`:
```tsx
export default function ResultPage() {
  return <div className="p-4">结算页</div>;
}
```

`frontend/src/pages/LeaderboardPage/index.tsx`:
```tsx
export default function LeaderboardPage() {
  return <div className="p-4">排行榜页</div>;
}
```

**Step 2: 配置 App.tsx 路由**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import ResultPage from './pages/ResultPage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

**Step 3: 验证路由工作**

```bash
cd frontend && npm run dev
```
Expected: 访问 /, /game, /result, /leaderboard 各显示对应页面

**Step 4: Commit**

```bash
git add frontend/src/
git commit -m "feat(frontend): 配置 React Router 路由系统"
```

---

## Phase 2: 共享类型定义与游戏数据

### Task 2.1: 定义共享类型

**Files:**
- Create: `shared/types/game.ts`
- Create: `shared/types/event.ts`
- Create: `shared/types/api.ts`
- Create: `shared/types/index.ts`
- Create: `shared/package.json`
- Create: `shared/tsconfig.json`

**Step 1: 创建 shared/package.json**

```json
{
  "name": "shared",
  "version": "1.0.0",
  "type": "module",
  "main": "types/index.ts",
  "types": "types/index.ts"
}
```

**Step 2: 创建 shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "outDir": "./dist"
  },
  "include": ["types/**/*", "constants/**/*"]
}
```

**Step 3: 创建 shared/types/game.ts**

```typescript
/** 游戏五维数值 */
export interface Stats {
  cash: number;      // 现金流
  health: number;    // 身心健康
  rep: number;       // 声望
  progress: number;  // 工期进度
  quality: number;   // 质量
}

/** 游戏状态 */
export type GameStatus = 'idle' | 'playing' | 'failed' | 'completed';

/** 失败原因 */
export type FailReason = 'bankrupt' | 'burnout' | 'overdue';

/** 回合记录 */
export interface RoundRecord {
  round: number;
  eventId: string;
  selectedOptionId: string;
  statsBefore: Stats;
  statsAfter: Stats;
}

/** 游戏结果 */
export interface GameResult {
  finalScore: number;
  netAssets: number;
  completedRounds: number;
  failReason: FailReason | null;
  title: string;
  history: RoundRecord[];
}
```

**Step 4: 创建 shared/types/event.ts**

```typescript
import type { Stats } from './game';

/** 事件分类 */
export type EventCategory =
  | 'client'   // 甲方相关
  | 'weather'  // 天气事件
  | 'finance'  // 资金相关
  | 'team'     // 团队相关
  | 'quality'  // 质量事件
  | 'safety';  // 安全事件

/** 选项类型 */
export type OptionType = 'rush' | 'cost' | 'quality';

/** 数值影响 */
export type OptionEffect = Partial<Stats>;

/** 选项 */
export interface EventOption {
  id: string;
  label: string;
  type: OptionType;
  effects: OptionEffect;
  feedback: string;
}

/** 事件卡 */
export interface EventCard {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  options: [EventOption, EventOption, EventOption]; // 固定3个选项
}
```

**Step 5: 创建 shared/types/api.ts**

```typescript
import type { GameResult } from './game';

/** 开始游戏请求 */
export interface StartRunRequest {
  deviceId: string;
}

/** 开始游戏响应 */
export interface StartRunResponse {
  runId: string;
  serverSeed: string;
}

/** 结束游戏请求 */
export interface FinishRunRequest {
  runId: string;
  deviceId: string;
  signature: string;
  result: GameResult;
}

/** 结束游戏响应 */
export interface FinishRunResponse {
  success: boolean;
  rank: number;
  totalPlayers: number;
  percentile: number;
}

/** 排行榜类型 */
export type LeaderboardType = 'overall' | 'profit' | 'duration';

/** 排行榜条目 */
export interface LeaderboardEntry {
  rank: number;
  deviceId: string;
  nickname?: string;
  score: number;
  createdAt: string;
}

/** 排行榜响应 */
export interface LeaderboardResponse {
  type: LeaderboardType;
  total: number;
  entries: LeaderboardEntry[];
}

/** 玩家排名响应 */
export interface PlayerRankResponse {
  deviceId: string;
  ranks: {
    overall: { rank: number; score: number } | null;
    profit: { rank: number; score: number } | null;
    duration: { rank: number; score: number } | null;
  };
  totalPlayers: number;
}
```

**Step 6: 创建 shared/types/index.ts**

```typescript
export * from './game';
export * from './event';
export * from './api';
```

**Step 7: Commit**

```bash
git add shared/
git commit -m "feat(shared): 定义前后端共享类型"
```

---

### Task 2.2: 定义游戏常量

**Files:**
- Create: `shared/constants/game.ts`
- Create: `shared/constants/titles.ts`
- Create: `shared/constants/index.ts`

**Step 1: 创建 shared/constants/game.ts**

```typescript
import type { Stats } from '../types/game';

/** 初始数值 */
export const INITIAL_STATS: Stats = {
  cash: 100,
  health: 100,
  rep: 50,
  progress: 0,
  quality: 70,
};

/** 最大回合数 */
export const MAX_ROUNDS = 20;

/** 失败阈值 */
export const FAIL_THRESHOLDS = {
  cash: 0,       // 现金 < 0 破产
  health: 0,     // 健康 <= 0 过劳
  progress: 150, // 进度超过150%超期失败
};

/** 完工进度阈值 */
export const COMPLETION_THRESHOLD = 100;
```

**Step 2: 创建 shared/constants/titles.ts**

```typescript
/** 职级配置 */
export interface TitleConfig {
  minScore: number;
  title: string;
  description: string;
}

/** 职级列表（按分数从高到低） */
export const TITLES: TitleConfig[] = [
  { minScore: 95, title: '区域总', description: '统领一方，土木帝国' },
  { minScore: 85, title: '项目经理', description: '独当一面，运筹帷幄' },
  { minScore: 75, title: '项目副经理', description: '左膀右臂，独挡一面' },
  { minScore: 65, title: '工区负责人', description: '片区之王，指点江山' },
  { minScore: 55, title: '栋号长', description: '一栋之长，责任在肩' },
  { minScore: 45, title: '施工员', description: '现场骨干，冲锋陷阵' },
  { minScore: 30, title: '技术员', description: '技术新星，前途无量' },
  { minScore: 0, title: '实习生', description: '萌新上路，请多关照' },
];

/** 根据分数获取职级 */
export function getTitleByScore(score: number): TitleConfig {
  return TITLES.find(t => score >= t.minScore) || TITLES[TITLES.length - 1];
}
```

**Step 3: 创建 shared/constants/index.ts**

```typescript
export * from './game';
export * from './titles';
```

**Step 4: Commit**

```bash
git add shared/constants/
git commit -m "feat(shared): 定义游戏常量和职级配置"
```

---

### Task 2.3: 创建事件卡数据（20张核心卡）

**Files:**
- Create: `frontend/src/data/events.ts`

**Step 1: 创建事件卡数据文件**

```typescript
import type { EventCard } from '../../../shared/types';

/** MVP 事件卡池（20张核心卡，后续扩展到60张） */
export const EVENT_CARDS: EventCard[] = [
  // === 甲方相关 (client) ===
  {
    id: 'client_001',
    title: '甲方改图',
    description: '甲方凌晨发来消息："这个方案再改改，明天开会要用。"',
    category: 'client',
    options: [
      { id: 'c001_rush', label: '熬夜赶工', type: 'rush', effects: { health: -15, progress: 10, rep: 10 }, feedback: '通宵达旦，终于赶出来了，甲方很满意' },
      { id: 'c001_cost', label: '找外包帮忙', type: 'cost', effects: { cash: -20, progress: 5, health: -5 }, feedback: '花钱省事，但预算又超了' },
      { id: 'c001_quality', label: '沟通延期', type: 'quality', effects: { rep: -10, progress: -5, health: 5 }, feedback: '争取到了缓冲时间，但甲方有些不满' },
    ],
  },
  {
    id: 'client_002',
    title: '临时加需求',
    description: '甲方："对了，这里再加个功能，应该很简单吧？"',
    category: 'client',
    options: [
      { id: 'c002_rush', label: '加班搞定', type: 'rush', effects: { health: -20, progress: 5, rep: 15 }, feedback: '累是累点，但甲方对你印象更好了' },
      { id: 'c002_cost', label: '申请增加预算', type: 'cost', effects: { cash: 15, rep: -5, progress: -5 }, feedback: '拿到了额外预算，但甲方觉得你太计较' },
      { id: 'c002_quality', label: '评估影响后再定', type: 'quality', effects: { progress: -10, quality: 5, rep: -5 }, feedback: '专业的态度，虽然进度慢了点' },
    ],
  },
  {
    id: 'client_003',
    title: '进度款拖欠',
    description: '财务说甲方的进度款又延期了，账上快没钱了...',
    category: 'client',
    options: [
      { id: 'c003_rush', label: '垫资继续干', type: 'rush', effects: { cash: -30, progress: 10, rep: 5 }, feedback: '自己垫钱保进度，压力山大' },
      { id: 'c003_cost', label: '停工催款', type: 'cost', effects: { progress: -15, cash: 10, rep: -10 }, feedback: '停工止血，但甲方很不高兴' },
      { id: 'c003_quality', label: '缩减开支撑着', type: 'quality', effects: { cash: -10, quality: -10, health: -10 }, feedback: '勉强维持，但质量和士气都受影响' },
    ],
  },

  // === 天气事件 (weather) ===
  {
    id: 'weather_001',
    title: '暴雨停工',
    description: '连续暴雨，工地泥泞不堪，无法正常施工。',
    category: 'weather',
    options: [
      { id: 'w001_rush', label: '冒雨赶工', type: 'rush', effects: { health: -20, progress: 5, quality: -15 }, feedback: '强行施工，进度勉强推进，但留下隐患' },
      { id: 'w001_cost', label: '租排水设备', type: 'cost', effects: { cash: -15, progress: 0, quality: 5 }, feedback: '专业设备保护现场，等待天晴' },
      { id: 'w001_quality', label: '安心等待', type: 'quality', effects: { progress: -10, health: 5, quality: 5 }, feedback: '顺应自然，养精蓄锐' },
    ],
  },
  {
    id: 'weather_002',
    title: '高温预警',
    description: '气象局发布高温红色预警，室外温度超过40度。',
    category: 'weather',
    options: [
      { id: 'w002_rush', label: '调整为夜间施工', type: 'rush', effects: { health: -15, cash: -10, progress: 5 }, feedback: '夜间施工，进度不落下' },
      { id: 'w002_cost', label: '发放降温物资', type: 'cost', effects: { cash: -10, health: 5, rep: 5 }, feedback: '绿豆汤管够，工人士气高涨' },
      { id: 'w002_quality', label: '暂停高温作业', type: 'quality', effects: { progress: -10, health: 10, quality: 5 }, feedback: '安全第一，等热浪过去' },
    ],
  },

  // === 资金相关 (finance) ===
  {
    id: 'finance_001',
    title: '材料涨价',
    description: '钢材价格突然上涨20%，采购部急得团团转。',
    category: 'finance',
    options: [
      { id: 'f001_rush', label: '赶紧囤货', type: 'rush', effects: { cash: -25, progress: 5, quality: 5 }, feedback: '提前锁定价格，后面轻松了' },
      { id: 'f001_cost', label: '找替代材料', type: 'cost', effects: { cash: -5, quality: -15, progress: 0 }, feedback: '省了钱，但质量有点担忧' },
      { id: 'f001_quality', label: '等价格回落', type: 'quality', effects: { progress: -15, cash: 5, quality: 0 }, feedback: '观望等待，进度受影响' },
    ],
  },
  {
    id: 'finance_002',
    title: '预算超支',
    description: '项目经理拿着报表找你："预算超了15%，怎么办？"',
    category: 'finance',
    options: [
      { id: 'f002_rush', label: '申请追加预算', type: 'rush', effects: { rep: -15, cash: 20, progress: 0 }, feedback: '要到钱了，但上面对你有意见' },
      { id: 'f002_cost', label: '削减非必要开支', type: 'cost', effects: { cash: 10, quality: -10, health: -10 }, feedback: '勒紧裤腰带，大家都苦一苦' },
      { id: 'f002_quality', label: '优化施工方案', type: 'quality', effects: { progress: -10, cash: 5, quality: 5 }, feedback: '重新规划，磨刀不误砍柴工' },
    ],
  },

  // === 团队相关 (team) ===
  {
    id: 'team_001',
    title: '核心人员离职',
    description: '技术骨干提交了辞职信，说要去甲方那边...',
    category: 'team',
    options: [
      { id: 't001_rush', label: '加薪挽留', type: 'rush', effects: { cash: -20, progress: 5, quality: 5 }, feedback: '钱到位了，人留下了' },
      { id: 't001_cost', label: '紧急招聘', type: 'cost', effects: { cash: -10, progress: -10, quality: -5 }, feedback: '新人需要适应期' },
      { id: 't001_quality', label: '内部培养接班', type: 'quality', effects: { progress: -15, rep: 5, quality: 0 }, feedback: '培养新人，长远来看是好事' },
    ],
  },
  {
    id: 'team_002',
    title: '团队士气低落',
    description: '连续加班一个月，工人们怨声载道。',
    category: 'team',
    options: [
      { id: 't002_rush', label: '许诺完工奖金', type: 'rush', effects: { cash: -15, progress: 10, health: -5 }, feedback: '画饼成功，大家继续肝' },
      { id: 't002_cost', label: '组织团建活动', type: 'cost', effects: { cash: -10, health: 15, progress: -5 }, feedback: '劳逸结合，士气恢复' },
      { id: 't002_quality', label: '调整工作节奏', type: 'quality', effects: { progress: -10, health: 10, quality: 5 }, feedback: '慢工出细活' },
    ],
  },

  // === 质量事件 (quality) ===
  {
    id: 'quality_001',
    title: '质量抽检不合格',
    description: '监理抽检发现混凝土强度不达标，要求整改。',
    category: 'quality',
    options: [
      { id: 'q001_rush', label: '加固处理', type: 'rush', effects: { cash: -20, progress: -5, quality: 10 }, feedback: '亡羊补牢，增加加固措施' },
      { id: 'q001_cost', label: '协商降低标准', type: 'cost', effects: { rep: -20, quality: -10, progress: 5 }, feedback: '勉强通过，但留下隐患' },
      { id: 'q001_quality', label: '返工重做', type: 'quality', effects: { cash: -30, progress: -15, quality: 15 }, feedback: '痛定思痛，彻底解决问题' },
    ],
  },
  {
    id: 'quality_002',
    title: '图纸与现场不符',
    description: '施工发现设计图纸与现场实际情况对不上。',
    category: 'quality',
    options: [
      { id: 'q002_rush', label: '现场变通处理', type: 'rush', effects: { progress: 5, quality: -15, rep: -5 }, feedback: '灵活应变，但不太规范' },
      { id: 'q002_cost', label: '提交设计变更', type: 'cost', effects: { cash: -10, progress: -10, quality: 5 }, feedback: '走正规流程，花时间花钱' },
      { id: 'q002_quality', label: '停工等待澄清', type: 'quality', effects: { progress: -15, quality: 10, health: 5 }, feedback: '搞清楚再动手' },
    ],
  },

  // === 安全事件 (safety) ===
  {
    id: 'safety_001',
    title: '安全大检查',
    description: '上级通知明天有安全大检查，现场还有很多问题...',
    category: 'safety',
    options: [
      { id: 's001_rush', label: '连夜整改', type: 'rush', effects: { health: -20, cash: -15, rep: 10 }, feedback: '通宵达旦，检查顺利通过' },
      { id: 's001_cost', label: '重点区域突击', type: 'cost', effects: { cash: -10, rep: 5, quality: -5 }, feedback: '面子工程，勉强过关' },
      { id: 's001_quality', label: '如实汇报问题', type: 'quality', effects: { rep: -10, progress: -5, quality: 10 }, feedback: '实事求是，赢得后续支持' },
    ],
  },
  {
    id: 'safety_002',
    title: '工人受伤',
    description: '有工人在高空作业时受伤，需要紧急处理。',
    category: 'safety',
    options: [
      { id: 's002_rush', label: '私了赔偿', type: 'rush', effects: { cash: -25, rep: -10, progress: 0 }, feedback: '花钱消灾，但不是长久之计' },
      { id: 's002_cost', label: '走保险流程', type: 'cost', effects: { cash: -10, progress: -10, rep: 0 }, feedback: '正规处理，但流程繁琐' },
      { id: 's002_quality', label: '停工整顿安全', type: 'quality', effects: { progress: -20, health: 10, quality: 10 }, feedback: '安全第一，彻底排查隐患' },
    ],
  },

  // === 额外事件 ===
  {
    id: 'misc_001',
    title: '领导视察',
    description: '公司大领导要来工地视察，接待工作很重要。',
    category: 'client',
    options: [
      { id: 'm001_rush', label: '全面准备汇报', type: 'rush', effects: { health: -15, rep: 15, progress: -5 }, feedback: '汇报精彩，领导很满意' },
      { id: 'm001_cost', label: '准备丰盛招待', type: 'cost', effects: { cash: -15, rep: 10, health: -5 }, feedback: '吃好喝好，印象深刻' },
      { id: 'm001_quality', label: '正常接待', type: 'quality', effects: { rep: 0, progress: 0, health: 0 }, feedback: '平平淡淡，波澜不惊' },
    ],
  },
  {
    id: 'misc_002',
    title: '赶工夜战',
    description: '工期紧张，项目经理建议连续通宵赶进度。',
    category: 'team',
    options: [
      { id: 'm002_rush', label: '全员加班', type: 'rush', effects: { health: -25, progress: 20, quality: -10 }, feedback: '疯狂输出，进度飞涨' },
      { id: 'm002_cost', label: '加钱加人', type: 'cost', effects: { cash: -20, progress: 15, health: -10 }, feedback: '人海战术，效果明显' },
      { id: 'm002_quality', label: '优化施工顺序', type: 'quality', effects: { progress: 5, quality: 5, health: 0 }, feedback: '巧干不如苦干' },
    ],
  },
  {
    id: 'misc_003',
    title: '监理挑刺',
    description: '监理每天在现场转悠，记录了一大堆问题。',
    category: 'quality',
    options: [
      { id: 'm003_rush', label: '一一整改', type: 'rush', effects: { health: -15, cash: -10, quality: 15 }, feedback: '态度端正，监理满意' },
      { id: 'm003_cost', label: '请监理吃饭', type: 'cost', effects: { cash: -10, rep: 5, quality: -5 }, feedback: '人情世故，问题少提了' },
      { id: 'm003_quality', label: '据理力争', type: 'quality', effects: { rep: -5, quality: 5, progress: 0 }, feedback: '专业对话，达成共识' },
    ],
  },
  {
    id: 'misc_004',
    title: '设备故障',
    description: '塔吊突然出现故障，需要停机维修。',
    category: 'finance',
    options: [
      { id: 'm004_rush', label: '紧急租用新设备', type: 'rush', effects: { cash: -25, progress: 5, health: -5 }, feedback: '不耽误工期，但花费不小' },
      { id: 'm004_cost', label: '等待维修', type: 'cost', effects: { progress: -15, cash: -5, quality: 0 }, feedback: '省钱但耽误时间' },
      { id: 'm004_quality', label: '调整施工计划', type: 'quality', effects: { progress: -10, quality: 5, health: 0 }, feedback: '先做不需要塔吊的工作' },
    ],
  },
  {
    id: 'misc_005',
    title: '好消息！',
    description: '之前申请的政府补贴批下来了！',
    category: 'finance',
    options: [
      { id: 'm005_rush', label: '加大投入赶进度', type: 'rush', effects: { cash: 10, progress: 15, health: -10 }, feedback: '有钱就是任性' },
      { id: 'm005_cost', label: '存起来应急', type: 'cost', effects: { cash: 30, progress: 0, rep: 5 }, feedback: '稳健经营，有备无患' },
      { id: 'm005_quality', label: '改善工人待遇', type: 'quality', effects: { cash: 10, health: 15, rep: 10 }, feedback: '大家都开心' },
    ],
  },
  {
    id: 'misc_006',
    title: '验收节点',
    description: '本周就是关键验收节点，一切准备就绪了吗？',
    category: 'quality',
    options: [
      { id: 'm006_rush', label: '冲刺验收', type: 'rush', effects: { health: -15, progress: 15, quality: -5 }, feedback: '险险通过，松了一口气' },
      { id: 'm006_cost', label: '申请延期', type: 'cost', effects: { rep: -15, progress: 0, quality: 5 }, feedback: '多点时间准备更充分' },
      { id: 'm006_quality', label: '充分准备', type: 'quality', effects: { cash: -10, quality: 10, progress: 5 }, feedback: '万事俱备，顺利通过' },
    ],
  },
];
```

**Step 2: Commit**

```bash
git add frontend/src/data/
git commit -m "feat(frontend): 添加20张核心事件卡数据"
```

---

## Phase 3: 游戏状态管理

### Task 3.1: 创建游戏状态 Store

**Files:**
- Create: `frontend/src/store/gameStore.ts`
- Create: `frontend/src/store/index.ts`

**Step 1: 创建 gameStore.ts**

```typescript
import { create } from 'zustand';
import type { Stats, GameStatus, FailReason, RoundRecord, GameResult } from '../../../shared/types';
import { INITIAL_STATS, MAX_ROUNDS, FAIL_THRESHOLDS, COMPLETION_THRESHOLD } from '../../../shared/constants';
import { getTitleByScore } from '../../../shared/constants/titles';
import type { EventCard, EventOption } from '../../../shared/types';
import { EVENT_CARDS } from '../data/events';

interface GameState {
  // 游戏标识
  runId: string | null;

  // 核心数值
  stats: Stats;

  // 回合信息
  currentRound: number;

  // 事件相关
  eventQueue: EventCard[];
  currentEvent: EventCard | null;

  // 游戏状态
  status: GameStatus;
  failReason: FailReason | null;

  // 历史记录
  history: RoundRecord[];

  // Actions
  startGame: () => void;
  selectOption: (option: EventOption) => void;
  resetGame: () => void;
  getResult: () => GameResult | null;
}

/** 洗牌函数 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** 计算最终分数 */
function calculateFinalScore(stats: Stats, completedRounds: number): number {
  // 综合评分公式：0.35*声望 + 0.35*净资产 + 0.15*健康 + 0.15*进度效率
  const repScore = Math.min(stats.rep, 100) / 100;
  const wealthScore = Math.min(Math.max(stats.cash, 0), 200) / 200;
  const healthScore = Math.min(stats.health, 100) / 100;
  const efficiencyScore = completedRounds > 0 ? Math.min(MAX_ROUNDS / completedRounds, 1.5) / 1.5 : 0;

  const rawScore = 0.35 * repScore + 0.35 * wealthScore + 0.15 * healthScore + 0.15 * efficiencyScore;
  return Math.round(rawScore * 100);
}

export const useGameStore = create<GameState>((set, get) => ({
  runId: null,
  stats: { ...INITIAL_STATS },
  currentRound: 0,
  eventQueue: [],
  currentEvent: null,
  status: 'idle',
  failReason: null,
  history: [],

  startGame: () => {
    const shuffledEvents = shuffleArray(EVENT_CARDS);
    const eventQueue = shuffledEvents.slice(0, MAX_ROUNDS);

    set({
      runId: crypto.randomUUID(),
      stats: { ...INITIAL_STATS },
      currentRound: 1,
      eventQueue: eventQueue.slice(1),
      currentEvent: eventQueue[0],
      status: 'playing',
      failReason: null,
      history: [],
    });
  },

  selectOption: (option: EventOption) => {
    const state = get();
    if (state.status !== 'playing' || !state.currentEvent) return;

    const statsBefore = { ...state.stats };

    // 应用数值变化
    const newStats: Stats = {
      cash: state.stats.cash + (option.effects.cash || 0),
      health: state.stats.health + (option.effects.health || 0),
      rep: state.stats.rep + (option.effects.rep || 0),
      progress: state.stats.progress + (option.effects.progress || 0),
      quality: state.stats.quality + (option.effects.quality || 0),
    };

    // 记录历史
    const record: RoundRecord = {
      round: state.currentRound,
      eventId: state.currentEvent.id,
      selectedOptionId: option.id,
      statsBefore,
      statsAfter: newStats,
    };

    // 检测失败条件
    let failReason: FailReason | null = null;
    if (newStats.cash < FAIL_THRESHOLDS.cash) {
      failReason = 'bankrupt';
    } else if (newStats.health <= FAIL_THRESHOLDS.health) {
      failReason = 'burnout';
    } else if (newStats.progress > FAIL_THRESHOLDS.progress) {
      failReason = 'overdue';
    }

    // 检测完工条件
    const isCompleted = newStats.progress >= COMPLETION_THRESHOLD && !failReason;

    // 下一回合
    const nextRound = state.currentRound + 1;
    const nextEvent = state.eventQueue[0] || null;
    const remainingQueue = state.eventQueue.slice(1);

    // 判断游戏是否结束
    const isLastRound = nextRound > MAX_ROUNDS;
    const gameEnded = failReason || isCompleted || isLastRound;

    set({
      stats: newStats,
      currentRound: gameEnded ? state.currentRound : nextRound,
      eventQueue: remainingQueue,
      currentEvent: gameEnded ? null : nextEvent,
      status: failReason ? 'failed' : (isCompleted || isLastRound ? 'completed' : 'playing'),
      failReason,
      history: [...state.history, record],
    });
  },

  resetGame: () => {
    set({
      runId: null,
      stats: { ...INITIAL_STATS },
      currentRound: 0,
      eventQueue: [],
      currentEvent: null,
      status: 'idle',
      failReason: null,
      history: [],
    });
  },

  getResult: () => {
    const state = get();
    if (state.status === 'idle' || state.status === 'playing') return null;

    const finalScore = calculateFinalScore(state.stats, state.currentRound);
    const titleConfig = getTitleByScore(finalScore);

    return {
      finalScore,
      netAssets: Math.max(state.stats.cash, 0) * 10000, // 转换为金额
      completedRounds: state.currentRound,
      failReason: state.failReason,
      title: titleConfig.title,
      history: state.history,
    };
  },
}));
```

**Step 2: 创建 store/index.ts**

```typescript
export { useGameStore } from './gameStore';
```

**Step 3: 验证 Store 编译**

```bash
cd frontend && npm run build
```
Expected: 编译成功，无错误

**Step 4: Commit**

```bash
git add frontend/src/store/
git commit -m "feat(frontend): 实现游戏状态管理 Store"
```

---

## Phase 4: UI 组件开发

### Task 4.1: 创建数值状态条组件

**Files:**
- Create: `frontend/src/components/StatusBar.tsx`
- Create: `frontend/src/components/StatusPanel.tsx`

**Step 1: 创建 StatusBar.tsx**

```tsx
interface StatusBarProps {
  label: string;
  value: number;
  maxValue: number;
  icon: string;
  color: string;
  showDanger?: boolean;
}

export default function StatusBar({ label, value, maxValue, icon, color, showDanger = true }: StatusBarProps) {
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
  const isDanger = showDanger && percentage < 25;

  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg w-6">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">{label}</span>
          <span className={isDanger ? 'text-red-500 font-bold' : 'text-gray-800'}>{value}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${isDanger ? 'bg-red-500' : ''}`}
            style={{
              width: `${percentage}%`,
              backgroundColor: isDanger ? undefined : color,
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

**Step 2: 创建 StatusPanel.tsx**

```tsx
import type { Stats } from '../../../shared/types';
import StatusBar from './StatusBar';

interface StatusPanelProps {
  stats: Stats;
}

export default function StatusPanel({ stats }: StatusPanelProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <StatusBar
        label="现金流"
        value={stats.cash}
        maxValue={150}
        icon="💰"
        color="#4CAF50"
      />
      <StatusBar
        label="健康"
        value={stats.health}
        maxValue={100}
        icon="❤️"
        color="#F44336"
      />
      <StatusBar
        label="声望"
        value={stats.rep}
        maxValue={100}
        icon="⭐"
        color="#FF9800"
        showDanger={false}
      />
      <StatusBar
        label="进度"
        value={stats.progress}
        maxValue={100}
        icon="📅"
        color="#2196F3"
        showDanger={false}
      />
      <StatusBar
        label="质量"
        value={stats.quality}
        maxValue={100}
        icon="✅"
        color="#9C27B0"
        showDanger={false}
      />
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add frontend/src/components/
git commit -m "feat(frontend): 实现数值状态条组件"
```

---

### Task 4.2: 创建事件卡组件

**Files:**
- Create: `frontend/src/components/EventCard.tsx`
- Create: `frontend/src/components/OptionButton.tsx`

**Step 1: 创建 OptionButton.tsx**

```tsx
import type { EventOption, OptionType } from '../../../shared/types';

interface OptionButtonProps {
  option: EventOption;
  onClick: () => void;
  disabled?: boolean;
}

const typeStyles: Record<OptionType, { bg: string; border: string; label: string }> = {
  rush: { bg: 'bg-orange-50', border: 'border-orange-400', label: '赶工' },
  cost: { bg: 'bg-green-50', border: 'border-green-400', label: '控成本' },
  quality: { bg: 'bg-blue-50', border: 'border-blue-400', label: '保质量' },
};

export default function OptionButton({ option, onClick, disabled }: OptionButtonProps) {
  const style = typeStyles[option.type];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full p-4 rounded-lg border-2 ${style.border} ${style.bg}
        text-left transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        hover:shadow-md`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="font-bold text-gray-800">{option.label}</span>
        <span className={`text-xs px-2 py-1 rounded ${style.bg} ${style.border} border`}>
          {style.label}
        </span>
      </div>
      <div className="text-xs text-gray-500 flex flex-wrap gap-2">
        {option.effects.cash !== undefined && option.effects.cash !== 0 && (
          <span className={option.effects.cash > 0 ? 'text-green-600' : 'text-red-500'}>
            💰{option.effects.cash > 0 ? '+' : ''}{option.effects.cash}
          </span>
        )}
        {option.effects.health !== undefined && option.effects.health !== 0 && (
          <span className={option.effects.health > 0 ? 'text-green-600' : 'text-red-500'}>
            ❤️{option.effects.health > 0 ? '+' : ''}{option.effects.health}
          </span>
        )}
        {option.effects.rep !== undefined && option.effects.rep !== 0 && (
          <span className={option.effects.rep > 0 ? 'text-green-600' : 'text-red-500'}>
            ⭐{option.effects.rep > 0 ? '+' : ''}{option.effects.rep}
          </span>
        )}
        {option.effects.progress !== undefined && option.effects.progress !== 0 && (
          <span className={option.effects.progress > 0 ? 'text-green-600' : 'text-red-500'}>
            📅{option.effects.progress > 0 ? '+' : ''}{option.effects.progress}
          </span>
        )}
        {option.effects.quality !== undefined && option.effects.quality !== 0 && (
          <span className={option.effects.quality > 0 ? 'text-green-600' : 'text-red-500'}>
            ✅{option.effects.quality > 0 ? '+' : ''}{option.effects.quality}
          </span>
        )}
      </div>
    </button>
  );
}
```

**Step 2: 创建 EventCard.tsx**

```tsx
import type { EventCard as EventCardType, EventOption } from '../../../shared/types';
import OptionButton from './OptionButton';

interface EventCardProps {
  event: EventCardType;
  round: number;
  maxRounds: number;
  onSelectOption: (option: EventOption) => void;
}

const categoryLabels: Record<string, string> = {
  client: '甲方',
  weather: '天气',
  finance: '资金',
  team: '团队',
  quality: '质量',
  safety: '安全',
};

export default function EventCard({ event, round, maxRounds, onSelectOption }: EventCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* 卡片头部 */}
      <div className="bg-gradient-to-r from-primary to-orange-400 text-white p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm bg-white/20 px-2 py-1 rounded">
            {categoryLabels[event.category] || event.category}
          </span>
          <span className="text-sm">
            第 {round}/{maxRounds} 回合
          </span>
        </div>
        <h2 className="text-xl font-bold">{event.title}</h2>
      </div>

      {/* 卡片内容 */}
      <div className="p-4">
        <p className="text-gray-700 mb-4 leading-relaxed">{event.description}</p>

        {/* 选项按钮 */}
        <div className="space-y-3">
          {event.options.map((option) => (
            <OptionButton
              key={option.id}
              option={option}
              onClick={() => onSelectOption(option)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add frontend/src/components/
git commit -m "feat(frontend): 实现事件卡组件和选项按钮"
```

---

## Phase 5: 页面实现

### Task 5.1: 实现首页

**Files:**
- Modify: `frontend/src/pages/HomePage/index.tsx`

**Step 1: 更新 HomePage**

```tsx
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-400 to-orange-600 flex flex-col items-center justify-center p-4">
      {/* Logo 区域 */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🏗️</div>
        <h1 className="text-3xl font-bold text-white mb-2">还我一个土木梦</h1>
        <p className="text-white/80 text-sm">
          土木人的项目生存模拟
        </p>
      </div>

      {/* 简介 */}
      <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-8 max-w-sm text-center">
        <p className="text-white text-sm leading-relaxed">
          从"工地小白"开始，接项目、做决策、扛变更、控风险。
          <br />
          看看你能拿到什么职级？
        </p>
      </div>

      {/* 按钮区域 */}
      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={() => navigate('/game')}
          className="w-full bg-white text-orange-600 font-bold py-4 px-8 rounded-full
            shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          开始游戏
        </button>

        <button
          onClick={() => navigate('/leaderboard')}
          className="w-full bg-white/20 text-white font-bold py-3 px-8 rounded-full
            border-2 border-white/50 hover:bg-white/30 transition-all active:scale-95"
        >
          查看排行榜
        </button>
      </div>

      {/* 底部信息 */}
      <div className="mt-8 text-white/60 text-xs">
        3-5分钟一局 · 职级 + 资产 + 排名
      </div>
    </div>
  );
}
```

**Step 2: 验证首页显示**

```bash
cd frontend && npm run dev
```
Expected: 访问 http://localhost:5173 显示首页，点击按钮可跳转

**Step 3: Commit**

```bash
git add frontend/src/pages/HomePage/
git commit -m "feat(frontend): 实现首页 UI"
```

---

### Task 5.2: 实现游戏页

**Files:**
- Modify: `frontend/src/pages/GamePage/index.tsx`

**Step 1: 更新 GamePage**

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store';
import { MAX_ROUNDS } from '../../../../shared/constants';
import StatusPanel from '../../components/StatusPanel';
import EventCard from '../../components/EventCard';

export default function GamePage() {
  const navigate = useNavigate();
  const {
    stats,
    currentRound,
    currentEvent,
    status,
    startGame,
    selectOption,
  } = useGameStore();

  // 游戏初始化
  useEffect(() => {
    if (status === 'idle') {
      startGame();
    }
  }, [status, startGame]);

  // 游戏结束跳转
  useEffect(() => {
    if (status === 'completed' || status === 'failed') {
      navigate('/result');
    }
  }, [status, navigate]);

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-4">
      {/* 顶部状态栏 */}
      <div className="sticky top-0 z-10 bg-white shadow-md">
        <div className="p-4">
          <StatusPanel stats={stats} />
        </div>
      </div>

      {/* 事件卡区域 */}
      <div className="p-4">
        <EventCard
          event={currentEvent}
          round={currentRound}
          maxRounds={MAX_ROUNDS}
          onSelectOption={selectOption}
        />
      </div>
    </div>
  );
}
```

**Step 2: 验证游戏流程**

```bash
cd frontend && npm run dev
```
Expected: 从首页点击开始，进入游戏页，可以看到事件卡和数值，点击选项后数值变化

**Step 3: Commit**

```bash
git add frontend/src/pages/GamePage/
git commit -m "feat(frontend): 实现游戏页核心流程"
```

---

### Task 5.3: 实现结算页

**Files:**
- Modify: `frontend/src/pages/ResultPage/index.tsx`

**Step 1: 更新 ResultPage**

```tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store';

const failReasonText: Record<string, string> = {
  bankrupt: '资金链断裂，项目烂尾了...',
  burnout: '身体扛不住，倒在了工地上...',
  overdue: '工期严重超标，被甲方换人了...',
};

export default function ResultPage() {
  const navigate = useNavigate();
  const { status, getResult, resetGame } = useGameStore();
  const result = getResult();

  // 如果没有结果，跳回首页
  useEffect(() => {
    if (status === 'idle') {
      navigate('/');
    }
  }, [status, navigate]);

  if (!result) {
    return null;
  }

  const handlePlayAgain = () => {
    resetGame();
    navigate('/game');
  };

  const handleBackHome = () => {
    resetGame();
    navigate('/');
  };

  const isSuccess = !result.failReason;

  return (
    <div className={`min-h-screen ${isSuccess ? 'bg-gradient-to-b from-green-400 to-green-600' : 'bg-gradient-to-b from-gray-500 to-gray-700'} p-4`}>
      {/* 结果头部 */}
      <div className="text-center text-white mb-6 pt-8">
        <div className="text-6xl mb-4">{isSuccess ? '🎉' : '😢'}</div>
        <h1 className="text-2xl font-bold mb-2">
          {isSuccess ? '项目完工！' : '项目失败'}
        </h1>
        {result.failReason && (
          <p className="text-white/80 text-sm">{failReasonText[result.failReason]}</p>
        )}
      </div>

      {/* 成绩卡片 */}
      <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
        {/* 职级 */}
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-1">职级</div>
          <div className="text-3xl font-bold text-primary">{result.title}</div>
        </div>

        {/* 数据展示 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">综合评分</div>
            <div className="text-2xl font-bold text-gray-800">{result.finalScore}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">净资产</div>
            <div className="text-2xl font-bold text-green-600">
              ¥{result.netAssets.toLocaleString()}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">完成回合</div>
            <div className="text-2xl font-bold text-gray-800">{result.completedRounds}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-500 mb-1">处理事件</div>
            <div className="text-2xl font-bold text-gray-800">{result.history.length}</div>
          </div>
        </div>

        {/* 排名占位 */}
        <div className="text-center text-gray-400 text-sm mb-4">
          排名功能开发中...
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-3">
        <button
          onClick={handlePlayAgain}
          className="w-full bg-white text-primary font-bold py-4 rounded-full shadow-lg
            hover:shadow-xl transition-all active:scale-95"
        >
          再来一局
        </button>
        <button
          onClick={() => navigate('/leaderboard')}
          className="w-full bg-white/20 text-white font-bold py-3 rounded-full
            border-2 border-white/50 hover:bg-white/30 transition-all active:scale-95"
        >
          查看排行榜
        </button>
        <button
          onClick={handleBackHome}
          className="w-full text-white/70 font-medium py-2"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
```

**Step 2: 验证完整游戏流程**

```bash
cd frontend && npm run dev
```
Expected: 完成游戏后跳转到结算页，显示职级、分数、净资产等信息

**Step 3: Commit**

```bash
git add frontend/src/pages/ResultPage/
git commit -m "feat(frontend): 实现结算页 UI"
```

---

### Task 5.4: 实现排行榜页

**Files:**
- Modify: `frontend/src/pages/LeaderboardPage/index.tsx`

**Step 1: 更新 LeaderboardPage**

```tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LeaderboardType } from '../../../../shared/types';

// Mock 数据（后续接入后端 API）
const mockLeaderboard = [
  { rank: 1, nickname: '土木之神001', score: 98 },
  { rank: 2, nickname: '工地老司机', score: 95 },
  { rank: 3, nickname: '甲方克星', score: 92 },
  { rank: 4, nickname: '搬砖小能手', score: 88 },
  { rank: 5, nickname: '工期守护者', score: 85 },
  { rank: 6, nickname: '预算达人', score: 82 },
  { rank: 7, nickname: '质量先锋', score: 79 },
  { rank: 8, nickname: '安全标兵', score: 76 },
  { rank: 9, nickname: '土木新星', score: 73 },
  { rank: 10, nickname: '实习小白', score: 70 },
];

const tabs: { key: LeaderboardType; label: string }[] = [
  { key: 'overall', label: '综合榜' },
  { key: 'profit', label: '利润榜' },
  { key: 'duration', label: '工期榜' },
];

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LeaderboardType>('overall');

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-primary to-orange-400 text-white p-4">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate(-1)} className="text-2xl">←</button>
          <h1 className="text-xl font-bold">排行榜</h1>
        </div>

        {/* Tab 切换 */}
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-full text-sm font-medium transition-all
                ${activeTab === tab.key
                  ? 'bg-white text-primary'
                  : 'bg-white/20 text-white'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 排行榜列表 */}
      <div className="p-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {mockLeaderboard.map((entry, index) => (
            <div
              key={entry.rank}
              className={`flex items-center p-4 ${
                index !== mockLeaderboard.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              {/* 排名 */}
              <div className="w-10 text-center">
                {entry.rank <= 3 ? (
                  <span className="text-2xl">
                    {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="text-gray-500 font-bold">{entry.rank}</span>
                )}
              </div>

              {/* 用户信息 */}
              <div className="flex-1 ml-4">
                <div className="font-medium text-gray-800">{entry.nickname}</div>
              </div>

              {/* 分数 */}
              <div className="text-right">
                <div className="font-bold text-primary">{entry.score}</div>
                <div className="text-xs text-gray-400">
                  {activeTab === 'overall' ? '分' : activeTab === 'profit' ? '万' : '回合'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 我的排名 */}
        <div className="mt-4 bg-primary/10 rounded-xl p-4">
          <div className="text-sm text-gray-600 mb-2">我的排名</div>
          <div className="text-center text-gray-400">
            暂无排名数据
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: 验证排行榜页面**

```bash
cd frontend && npm run dev
```
Expected: 排行榜页面显示 Tab 切换和 Mock 数据

**Step 3: Commit**

```bash
git add frontend/src/pages/LeaderboardPage/
git commit -m "feat(frontend): 实现排行榜页 UI（Mock 数据）"
```

---

## Phase 6: 配置与优化

### Task 6.1: 配置路径别名和移动端适配

**Files:**
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/tsconfig.json`
- Modify: `frontend/index.html`

**Step 1: 更新 vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  server: {
    host: true, // 允许局域网访问
  },
});
```

**Step 2: 更新 tsconfig.json paths**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["src", "../shared"]
}
```

**Step 3: 更新 index.html 添加移动端 meta**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#FF6B35" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />

    <!-- OG Meta Tags -->
    <meta property="og:title" content="还我一个土木梦 - 土木人的模拟经营游戏" />
    <meta property="og:description" content="3分钟体验土木人的职业生涯，你能拿到什么职级？" />
    <meta property="og:type" content="website" />

    <title>还我一个土木梦</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 4: Commit**

```bash
git add frontend/
git commit -m "feat(frontend): 配置路径别名和移动端适配"
```

---

### Task 6.2: 创建组件索引文件

**Files:**
- Create: `frontend/src/components/index.ts`

**Step 1: 创建 components/index.ts**

```typescript
export { default as StatusBar } from './StatusBar';
export { default as StatusPanel } from './StatusPanel';
export { default as EventCard } from './EventCard';
export { default as OptionButton } from './OptionButton';
```

**Step 2: Commit**

```bash
git add frontend/src/components/
git commit -m "refactor(frontend): 添加组件索引文件"
```

---

## Phase 7: 后端 API（可选，用于排行榜）

### Task 7.1: 初始化后端项目

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/index.ts`

**Step 1: 创建 backend/package.json**

```json
{
  "name": "civil-engineering-dream-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "better-sqlite3": "^9.4.3",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/better-sqlite3": "^7.6.8",
    "@types/uuid": "^9.0.8",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3"
  }
}
```

**Step 2: 创建 backend/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*", "../shared/**/*"]
}
```

**Step 3: 安装依赖**

```bash
cd backend && npm install
```

**Step 4: 创建 backend/src/index.ts**

```typescript
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// TODO: 添加 API 路由
// - POST /run/start
// - POST /run/finish
// - GET /leaderboard
// - GET /me/rank

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

**Step 5: 验证后端启动**

```bash
cd backend && npm run dev
```
Expected: 服务器在 3001 端口启动

**Step 6: Commit**

```bash
git add backend/
git commit -m "feat(backend): 初始化后端项目结构"
```

---

## 验收清单

完成所有 Task 后，验证以下功能：

1. **首页** → 点击"开始游戏" → 跳转游戏页
2. **游戏页** → 显示事件卡和数值状态 → 选择选项后数值变化
3. **游戏结束** → 自动跳转结算页
4. **结算页** → 显示职级、分数、净资产 → 可以再来一局
5. **排行榜页** → Tab 切换 → 显示 Mock 数据

---

## 后续扩展（不在本计划内）

1. 扩展事件卡到 60 张
2. 实现后端排行榜 API
3. 实现 Canvas 海报生成
4. 添加数据埋点
5. 部署上线

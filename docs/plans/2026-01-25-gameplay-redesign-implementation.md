# 游戏玩法重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 从季度制事件游戏重构为行动点-季度制游戏，添加团队系统、领导力系统，重构事件系统

**Architecture:**
- 使用 git worktree 创建独立开发分支
- 从零重写游戏核心循环（保留可复用的类型、事件数据、样式）
- 双层时间系统：季度（外层）+ 行动点（内层）
- 五个独立页面通过底部导航切换

**Tech Stack:**
- React 18.2 + TypeScript 5.2
- Zustand 4.4（状态管理）
- React Router 6.21（路由）
- TailwindCSS 3.4（样式）

---

## Phase 1: 类型定义扩展

### Task 1.1: 创建团队系统类型定义

**Files:**
- Create: `shared/types/team.ts`

**Step 1: 创建 team.ts 文件**

```typescript
/**
 * 团队系统类型定义
 */

export enum TeamMemberType {
  ENGINEER = 'engineer',      // 工程师：提升项目质量
  SALESPERSON = 'salesperson', // 业务员：增加项目收益
  WORKER = 'worker',           // 劳务工：降低项目成本
  DESIGNER = 'designer',       // 设计师：提升项目效率
}

export interface TeamMember {
  id: string;
  type: TeamMemberType;
  name: string;
  skill: number;        // 技能等级 1-5
  salary: number;       // 季度工资
  morale: number;       // 士气 0-100
  efficiency: number;   // 效率 50-150%
}

export interface TeamIssue {
  id: string;
  type: 'conflict' | 'burnout' | 'mistake' | 'demand';
  description: string;
  severity: 'low' | 'medium' | 'high';
  affectedMember?: string;
  requiredLeadership: number;
  resolveReward: {
    leadership?: number;
    efficiency?: number;
    morale?: number;
  };
}

export interface TeamState {
  members: TeamMember[];
  leadership: number;
  teamEfficiency: number;
  pendingIssues: TeamIssue[];
}
```

**Step 2: 验证 TypeScript 编译**

Run: `cd shared && npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add shared/types/team.ts
git commit -m "feat(team): add team system type definitions"
```

---

### Task 1.2: 扩展游戏状态类型

**Files:**
- Modify: `shared/types/game.ts`

**Step 1: 添加新枚举和接口**

在 `shared/types/game.ts` 文件末尾添加：

```typescript
/**
 * 游戏阶段
 */
export enum GamePhase {
  EARLY = 'early',   // 前期：实习生-高级工程师
  LATE = 'late',     // 后期：项目经理-合伙人
}

/**
 * 行动类型
 */
export enum ActionType {
  DO_PROJECT = 'do_project',
  TRAINING = 'training',
  REST = 'rest',
  RECRUIT = 'recruit',
  TEAM_PROJECT = 'team_project',
  RESOLVE_ISSUE = 'resolve_issue',
}

/**
 * 行动配置
 */
export interface ActionConfig {
  type: ActionType;
  name: string;
  icon: string;
  description: string;
  costAP: number;
  phase: 'early' | 'late' | 'both';
  costCash?: number;
  effects?: Effects;
}

/**
 * 事件状态
 */
export enum EventStatus {
  PENDING = 'pending',
  PROCESSED = 'processed',
  EXPIRED = 'expired',
  IGNORED = 'ignored',
}
```

**Step 2: 扩展 EndReason 枚举**

修改 `EndReason` 枚举，移除 `OUT_OF_CASH`：

```typescript
export enum EndReason {
  PROMOTED_TO_PARTNER = 'promoted_to_partner',
  HEALTH_DEPLETED = 'health_depleted',
  REPUTATION_DEPLETED = 'reputation_depleted',
}
```

**Step 3: 扩展 GameState 接口**

在 `GameState` 接口中添加新字段：

```typescript
export interface GameState {
  // ... 现有字段保持不变

  // 新增：游戏阶段
  phase: GamePhase;

  // 新增：行动点系统
  actionPoints: number;
  maxActionPoints: number;

  // 新增：团队系统
  team: TeamState;

  // 新增：待处理事件
  pendingEvents: EventCard[];

  // 修改：currentRound 改为 currentQuarter（更清晰的命名）
  // currentRound: number; // 删除
  currentQuarter: number;

  // 新增：每季度最大行动次数
  maxActionsPerQuarter: number;

  // 删除：不再需要
  // eventsInQuarter: number;  // 删除
  // maxEventsPerQuarter: number;  // 删除
}
```

**Step 4: 扩展 EventCard 接口**

在 `shared/types/event.ts` 中添加：

```typescript
export interface EventCard {
  // ... 现有字段

  isUrgent?: boolean;
  deadline?: number;
  status?: EventStatus;
}
```

**Step 5: 更新类型导出**

在 `shared/types/index.ts` 中添加：

```typescript
export * from './team';
```

**Step 6: 验证 TypeScript 编译**

Run: `cd shared && npx tsc --noEmit`
Expected: 无错误

**Step 7: Commit**

```bash
git add shared/types/game.ts shared/types/event.ts shared/types/index.ts
git commit -m "feat(types): extend game state types for action points and team system"
```

---

## Phase 2: 常量配置

### Task 2.1: 添加行动配置

**Files:**
- Modify: `frontend/src/data/constants.ts`

**Step 1: 添加行动配置常量**

在文件末尾添加：

```typescript
// ==================== 行动系统配置 ====================

export const ACTIONS: Record<ActionType, ActionConfig> = {
  [ActionType.DO_PROJECT]: {
    type: ActionType.DO_PROJECT,
    name: '做项目',
    icon: '🏗️',
    description: '消耗资金和健康，推进项目进度',
    costAP: 1,
    phase: 'both',
    costCash: 5000,
    effects: {
      progress: 10,
      quality: 5,
      health: -5,
    },
  },
  [ActionType.TRAINING]: {
    type: ActionType.TRAINING,
    name: '培训学习',
    icon: '📚',
    description: '消耗资金，提升技能或健康',
    costAP: 1,
    phase: 'both',
    costCash: 8000,
    effects: {
      health: 8,
    },
  },
  [ActionType.REST]: {
    type: ActionType.REST,
    name: '休息',
    icon: '😴',
    description: '恢复健康',
    costAP: 1,
    phase: 'both',
    effects: {
      health: 12,
    },
  },
  [ActionType.RECRUIT]: {
    type: ActionType.RECRUIT,
    name: '招募成员',
    icon: '👥',
    description: '招募团队成员',
    costAP: 1,
    phase: 'late',
  },
  [ActionType.TEAM_PROJECT]: {
    type: ActionType.TEAM_PROJECT,
    name: '团队项目',
    icon: '🎯',
    description: '委派团队执行项目',
    costAP: 1,
    phase: 'late',
  },
  [ActionType.RESOLVE_ISSUE]: {
    type: ActionType.RESOLVE_ISSUE,
    name: '解决问题',
    icon: '🔧',
    description: '处理团队问题',
    costAP: 1,
    phase: 'late',
  },
};

// 每季度最大行动次数
export const MAX_ACTIONS_PER_QUARTER = 8;

// 每季度开始自动恢复的健康值
export const QUARTER_HEALTH_REGEN = 2;

// 行动点计算：健康 / 20，向上取整
export const ACTION_POINTS_DIVISOR = 20;
```

**Step 2: 验证编译**

Run: `cd frontend && npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add frontend/src/data/constants.ts
git commit -m "feat(constants): add action system configuration"
```

---

### Task 2.2: 添加团队配置

**Files:**
- Modify: `frontend/src/data/constants.ts`

**Step 1: 添加团队系统常量**

```typescript
// ==================== 团队系统配置 ====================

export const RECRUIT_CONFIG: Record<TeamMemberType, {
  name: string;
  baseSalary: number;
  recruitCost: number;
  skillRange: [number, number];
}> = {
  [TeamMemberType.ENGINEER]: {
    name: '工程师',
    baseSalary: 20000,
    recruitCost: 15000,
    skillRange: [1, 3],
  },
  [TeamMemberType.SALESPERSON]: {
    name: '业务员',
    baseSalary: 15000,
    recruitCost: 10000,
    skillRange: [1, 3],
  },
  [TeamMemberType.WORKER]: {
    name: '劳务工',
    baseSalary: 10000,
    recruitCost: 8000,
    skillRange: [1, 2],
  },
  [TeamMemberType.DESIGNER]: {
    name: '设计师',
    baseSalary: 18000,
    recruitCost: 12000,
    skillRange: [1, 3],
  },
};

export const LEADERSHIP_GAIN = {
  resolveIssue: 10,
  teamSuccess: 5,
  memberMorale: 2,
  training: 3,
};

export const LEADERSHIP_EFFECTS = {
  efficiencyPerPoint: 0.002,  // 每点领导力 +0.2% 效率
  baseTeamSize: 3,
  extraMembersPer10Leadership: 2,
  partnerRequirement: 60,
};

export const TEAM_ISSUE_TEMPLATES = [
  {
    type: 'conflict' as const,
    descriptions: [
      '两名成员因工作分歧发生争执',
      '团队成员之间出现沟通问题',
      '工作分配不均引发矛盾',
    ],
    requiredLeadership: [10, 20, 30],
  },
  {
    type: 'burnout' as const,
    descriptions: [
      '某成员出现职业倦怠迹象',
      '团队成员工作压力过大',
      '成员士气低落',
    ],
    requiredLeadership: [15, 25, 35],
  },
  {
    type: 'mistake' as const,
    descriptions: [
      '团队成员在工作中出现失误',
      '项目执行过程中发现问题',
      '成员操作不当导致返工',
    ],
    requiredLeadership: [20, 30, 40],
  },
  {
    type: 'demand' as const,
    descriptions: [
      '团队成员提出加薪要求',
      '成员希望调整工作安排',
      '团队对福利待遇有诉求',
    ],
    requiredLeadership: [25, 35, 45],
  },
];
```

**Step 2: 验证编译**

Run: `cd frontend && npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add frontend/src/data/constants.ts
git commit -m "feat(constants): add team system configuration"
```

---

### Task 2.3: 添加事件系统配置

**Files:**
- Modify: `frontend/src/data/constants.ts`

**Step 1: 添加事件系统常量**

```typescript
// ==================== 事件系统配置 ====================

export const EVENT_TRIGGER_CONFIG = {
  actionsPerTrigger: 2,      // 每消耗 2 行动点触发检测
  triggerProbability: 0.5,   // 50% 概率触发事件
  deferTurns: 2,            // 延后处理期限（行动次数）
};

export const EVENT_IGNORE_CONSEQUENCES = {
  reputationPenalty: 10,     // 忽略事件的声誉惩罚
  relationshipDecay: 5,      // 忽略事件的关系衰减
};
```

**Step 2: 验证编译**

Run: `cd frontend && npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add frontend/src/data/constants.ts
git commit -m "feat(constants): add event system configuration"
```

---

### Task 2.4: 更新游戏配置

**Files:**
- Modify: `frontend/src/data/constants.ts`

**Step 1: 修改 GAME_CONFIG**

```typescript
export const GAME_CONFIG: GameConfig = {
  initialStats: {
    cash: 50000,
    health: 100,
    reputation: 50,
    progress: 0,
    quality: 60,
  },
  initialRank: Rank.INTERN,
  initialInventory: {
    [MaterialType.CEMENT]: 0,
    [MaterialType.STEEL]: 0,
    [MaterialType.SAND]: 0,
    [MaterialType.CONCRETE]: 0,
  },
  initialRelationships: {
    [RelationshipType.CLIENT]: 50,
    [RelationshipType.SUPERVISION]: 50,
    [RelationshipType.DESIGN]: 50,
    [RelationshipType.LABOR]: 50,
    [RelationshipType.GOVERNMENT]: 50,
  },
  // 删除：maxEventsPerQuarter
};

// 添加游戏阶段配置
export const PHASE_CONFIG = {
  earlyGameRanks: [
    Rank.INTERN,
    Rank.ASSISTANT_ENGINEER,
    Rank.ENGINEER,
    Rank.SENIOR_ENGINEER,
  ],
  lateGameRanks: [
    Rank.PROJECT_MANAGER,
    Rank.PROJECT_DIRECTOR,
    Rank.PARTNER,
  ],
};
```

**Step 2: 验证编译**

Run: `cd frontend && npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add frontend/src/data/constants.ts
git commit -m "feat(constants): update game config for action points system"
```

---

## Phase 3: 状态管理重构

### Task 3.1: 创建新的 Store 接口

**Files:**
- Create: `frontend/src/store/gameStoreNew.ts`（新文件，先不删除旧的）

**Step 1: 创建新的 Store 接口和基础结构**

```typescript
/**
 * 游戏状态管理 Store（重构版）
 * 支持行动点系统、团队系统、事件系统重构
 */

import { create } from 'zustand';
import {
  GameState,
  GameStatus,
  EndReason,
  EventCard,
  PlayerStats,
  Effects,
  Rank,
  MaterialType,
  RelationshipType,
  MaterialPrice,
  RANK_CONFIGS,
  MATERIAL_CONFIGS,
  RELATIONSHIP_CONFIGS,
  TradeResult,
  MaintenanceResult,
  QuarterSettlement,
  GamePhase,
  ActionType,
  TeamMemberType,
  TeamState,
  TeamMember,
} from '@shared/types';
import { EVENTS } from '@/data/events';
import {
  GAME_CONFIG,
  ACTIONS,
  MAX_ACTIONS_PER_QUARTER,
  QUARTER_HEALTH_REGEN,
  ACTION_POINTS_DIVISOR,
  RECRUIT_CONFIG,
  LEADERSHIP_GAIN,
  LEADERSHIP_EFFECTS,
  TEAM_ISSUE_TEMPLATES,
  EVENT_TRIGGER_CONFIG,
  EVENT_IGNORE_CONSEQUENCES,
  PHASE_CONFIG,
  BONUS_EVENTS,
  DISASTER_EVENTS,
  MAINTENANCE_OPTIONS,
  LIVING_COSTS_CONFIG,
  PROJECT_COMPLETION,
  LOSE_CONDITIONS,
} from '@/data/constants';
import { startGame as apiStartGame, finishGame as apiFinishGame } from '@/api';

// ==================== 辅助函数 ====================

const clampStat = (value: number): number => {
  return Math.max(0, Math.min(100, value));
};

const calculateActionPoints = (health: number): number => {
  return Math.ceil(health / ACTION_POINTS_DIVISOR);
};

const isRelationshipUnlocked = (rank: Rank, relationshipType: RelationshipType): boolean => {
  switch (rank) {
    case Rank.INTERN:
      return relationshipType === RelationshipType.CLIENT ||
             relationshipType === RelationshipType.LABOR;
    case Rank.ASSISTANT_ENGINEER:
      return relationshipType === RelationshipType.CLIENT ||
             relationshipType === RelationshipType.LABOR ||
             relationshipType === RelationshipType.SUPERVISION;
    case Rank.ENGINEER:
      return relationshipType === RelationshipType.CLIENT ||
             relationshipType === RelationshipType.LABOR ||
             relationshipType === RelationshipType.SUPERVISION ||
             relationshipType === RelationshipType.DESIGN;
    case Rank.SENIOR_ENGINEER:
    case Rank.PROJECT_MANAGER:
    case Rank.PROJECT_DIRECTOR:
    case Rank.PARTNER:
      return true;
    default:
      return false;
  }
};

// ==================== 初始状态 ====================

const createInitialState = (): GameState => ({
  status: GameStatus.IDLE,
  currentQuarter: 0,
  maxActionsPerQuarter: MAX_ACTIONS_PER_QUARTER,
  stats: {
    cash: GAME_CONFIG.initialStats.cash,
    health: GAME_CONFIG.initialStats.health,
    reputation: GAME_CONFIG.initialStats.reputation,
    progress: GAME_CONFIG.initialStats.progress,
    quality: GAME_CONFIG.initialStats.quality,
  },
  currentEvent: null,
  eventHistory: [],

  // 职级系统
  rank: GAME_CONFIG.initialRank,
  actualSalary: RANK_CONFIGS[GAME_CONFIG.initialRank].minQuarterlySalary,
  gameStats: {
    completedProjects: 0,
    qualityProjects: 0,
    totalQuarters: 0,
    totalEvents: 0,
  },

  // 材料市场
  inventory: { ...GAME_CONFIG.initialInventory },
  materialPrices: {} as Record<MaterialType, MaterialPrice>,

  // 关系系统
  relationships: { ...GAME_CONFIG.initialRelationships },
  maintenanceCount: 0,
  materialTradeCount: 0,
  maintainedRelationships: new Set<RelationshipType>(),

  // 项目进度
  projectProgress: 0,
  projectQuality: GAME_CONFIG.initialStats.quality,

  // 新增：游戏阶段
  phase: GamePhase.EARLY,

  // 新增：行动点系统
  actionPoints: calculateActionPoints(GAME_CONFIG.initialStats.health),
  maxActionPoints: calculateActionPoints(GAME_CONFIG.initialStats.health),

  // 新增：团队系统
  team: {
    members: [],
    leadership: 0,
    teamEfficiency: 100,
    pendingIssues: [],
  },

  // 新增：待处理事件
  pendingEvents: [],

  score: 0,
});

// ==================== 接口定义 ====================

interface GameStore extends GameState {
  // 扩展状态
  runId: string | null;
  deviceId: string | null;

  // LLM 相关状态
  specialEventCount: number;
  isLLMEnhancing: boolean;

  // 当前季度结算数据
  currentSettlement: QuarterSettlement | null;

  // 材料价格历史
  materialPriceHistory: Record<MaterialType, number[]>;

  // 事件触发计数器
  actionsSinceLastEventCheck: number;

  // 本季度已执行行动次数
  actionsThisQuarter: number;

  // Actions
  startGame: () => Promise<void>;
  resetGame: () => void;
  uploadScore: () => Promise<void>;

  // 行动系统
  doAction: (actionType: ActionType) => ActionResult;
  calculateActionPoints: () => number;

  // 季度系统
  finishQuarter: () => void;
  nextQuarter: () => void;

  // 团队系统
  recruitMember: (memberType: TeamMemberType) => { success: boolean; message: string; member?: TeamMember };
  resolveTeamIssue: (issueId: string) => { success: boolean; message: string; rewards?: any };
  updateTeamEfficiency: () => void;
  generateTeamIssue: () => void;

  // 事件系统
  checkEventTrigger: () => Promise<void>;
  deferEvent: (eventId: string) => void;
  ignoreEvent: (eventId: string) => void;

  // 保留的方法
  selectOption: (optionId: string) => void;
  enterStrategyPhase: () => void;
  returnToEventPhase: () => void;
  executePromotion: (newRank: Rank) => void;
  buyMaterial: (materialType: MaterialType, amount: number) => TradeResult;
  sellMaterial: (materialType: MaterialType, amount: number) => TradeResult;
  updateMaterialPrices: () => void;
  maintainRelationship: (
    relationshipType: RelationshipType,
    method: 'dinner' | 'gift' | 'favor' | 'solidarity'
  ) => MaintenanceResult;
  getMaxMaintenanceCount: () => number;
  getMaxMaterialTradeCount: () => number;
  getMaxBuyableAmount: (materialType: MaterialType) => number;
  isRelationshipUnlocked: (relationshipType: RelationshipType) => boolean;
  applyEffects: (effects: Effects) => void;
  checkGameEnd: () => void;
  checkProjectCompletion: () => boolean;
  checkPromotion: () => { canPromote: boolean; nextRank?: Rank; missingRequirements?: string[] };
  calculateNetAssets: () => number;
  calculateStorageFee: () => number;
  calculateQuarterlySalary: () => number;
  raiseSalary: () => { success: boolean; newSalary?: number; message: string };
  enhanceEventDescription: (event: EventCard) => Promise<EventCard>;
  generateLLMSpecialEvent: () => Promise<EventCard | null>;
  shouldTriggerSpecialEvent: (quarter: number, stats: PlayerStats) => boolean;
}

// ==================== Store 定义 ====================

// 材料价格初始化
const initializeMaterialPrices = (): Record<MaterialType, MaterialPrice> => {
  const prices: Record<MaterialType, MaterialPrice> = {} as any;
  Object.values(MaterialType).forEach((type) => {
    const config = MATERIAL_CONFIGS[type];
    const variance = (Math.random() - 0.5) * 2 * config.priceVolatility;
    const currentPrice = Math.round(config.basePrice * (1 + variance));
    prices[type] = {
      type,
      currentPrice,
      priceChange: Math.round(variance * 100),
      trend: variance > 0.05 ? 'up' : variance < -0.05 ? 'down' : 'stable',
    };
  });
  return prices;
};

// ActionResult 接口
interface ActionResult {
  success: boolean;
  message: string;
  effects?: Effects;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // 初始化状态
  ...createInitialState(),
  runId: null,
  deviceId: null,
  specialEventCount: 0,
  isLLMEnhancing: false,
  currentSettlement: null,
  materialPrices: initializeMaterialPrices(),
  materialPriceHistory: {
    [MaterialType.CEMENT]: [],
    [MaterialType.STEEL]: [],
    [MaterialType.SAND]: [],
    [MaterialType.CONCRETE]: [],
  },
  actionsSinceLastEventCheck: 0,
  actionsThisQuarter: 0,

  // ... 其他方法将在后续 Task 中实现
}));
```

**Step 2: 验证编译**

Run: `cd frontend && npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add frontend/src/store/gameStoreNew.ts
git commit -m "feat(store): create new store interface with action points and team system"
```

---

## Phase 4: 页面组件

### Task 4.1: 创建 BottomNav 组件

**Files:**
- Create: `frontend/src/components/BottomNav.tsx`

**Step 1: 创建底部导航栏组件**

```typescript
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Rank } from '@shared/types';

const navItems = [
  { path: '/game/actions', label: '行动', icon: '⚡' },
  { path: '/game/team', label: '团队', icon: '👥' },
  { path: '/game/market', label: '市场', icon: '📊' },
  { path: '/game/relations', label: '关系', icon: '🤝' },
  { path: '/game/events', label: '事件', icon: '📜' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const rank = useGameStore((state) => state.rank);
  const pendingEvents = useGameStore((state) => state.pendingEvents);

  const isTeamUnlocked = rank === Rank.PROJECT_MANAGER ||
                        rank === Rank.PROJECT_DIRECTOR ||
                        rank === Rank.PARTNER;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isLocked = item.path === '/game/team' && !isTeamUnlocked;
          const pendingCount = item.path === '/game/events' ? pendingEvents.length : 0;

          return (
            <button
              key={item.path}
              onClick={() => !isLocked && navigate(item.path)}
              disabled={isLocked}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-all duration-200
                ${isActive ? 'text-brand-600' : 'text-slate-600'}
                ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                hover:bg-slate-50 active:bg-slate-100
              `}
            >
              <div className="relative">
                <span className="text-xl">{item.icon}</span>
                {isLocked && (
                  <span className="absolute -top-1 -right-1 text-xs">🔒</span>
                )}
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

**Step 2: 验证编译**

Run: `cd frontend && npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add frontend/src/components/BottomNav.tsx
git commit -m "feat(ui): add bottom navigation component"
```

---

### Task 4.2: 创建 TopStatusBar 组件

**Files:**
- Create: `frontend/src/components/TopStatusBar.tsx`

**Step 1: 创建顶部状态栏组件**

```typescript
import { useGameStore } from '@/store/gameStore';
import { Rank } from '@shared/types';
import { RANK_CONFIGS } from '@shared/types';

export function TopStatusBar() {
  const stats = useGameStore((state) => state.stats);
  const rank = useGameStore((state) => state.rank);
  const actualSalary = useGameStore((state) => state.actualSalary);
  const actionPoints = useGameStore((state) => state.actionPoints);

  const rankConfig = RANK_CONFIGS[rank];
  const hasRaise = actualSalary > rankConfig.minQuarterlySalary;

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-brand-50 to-engineering-50 border-b border-slate-200 z-40">
      <div className="max-w-md mx-auto px-4 py-2">
        {/* 职级和工资 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <span className="text-sm">👔</span>
            <span className="text-sm font-bold text-amber-900">{rankConfig.name}</span>
            {hasRaise && (
              <>
                <span className="text-xs text-amber-700">📈</span>
                <span className="text-xs text-slate-500">
                  ({rankConfig.minQuarterlySalary})
                </span>
              </>
            )}
          </div>
          <div className="px-2 py-1 bg-white rounded-lg border border-slate-200">
            <span className={`text-sm font-bold ${actualSalary >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {actualSalary >= 0 ? '+' : ''}{actualSalary.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 核心数值 */}
        <div className="flex items-center gap-2">
          {/* 现金 */}
          <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">💰 现金</span>
              <span className={`text-sm font-bold ${stats.cash < 10000 ? 'text-red-600' : 'text-slate-900'}`}>
                {(stats.cash / 10000).toFixed(1)}万
              </span>
            </div>
          </div>

          {/* 健康 */}
          <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">❤️ 健康</span>
              <span className={`text-sm font-bold ${stats.health < 30 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats.health}
              </span>
            </div>
            <div className="mt-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  stats.health < 30 ? 'bg-red-500' : stats.health < 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${stats.health}%` }}
              />
            </div>
          </div>

          {/* 声誉 */}
          <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">⭐ 声誉</span>
              <span className={`text-sm font-bold ${stats.reputation < 30 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats.reputation}
              </span>
            </div>
            <div className="mt-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  stats.reputation < 30 ? 'bg-red-500' : stats.reputation < 60 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${stats.reputation}%` }}
              />
            </div>
          </div>
        </div>

        {/* 行动点 */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg p-2 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">⚡ 行动点</span>
              <span className="text-lg font-bold">
                {actionPoints} / {get().maxActionPoints}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
```

**Step 2: 验证编译**

Run: `cd frontend && npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add frontend/src/components/TopStatusBar.tsx
git commit -m "feat(ui): add top status bar component"
```

---

### Task 4.3: 创建 ActionsPage 组件

**Files:**
- Create: `frontend/src/pages/ActionsPage.tsx`

**Step 1: 创建行动页面组件**

```typescript
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { ACTIONS } from '@/data/constants';
import { ActionType, Rank } from '@shared/types';

export function ActionsPage() {
  const navigate = useNavigate();
  const currentQuarter = useGameStore((state) => state.currentQuarter);
  const actionPoints = useGameStore((state) => state.actionPoints);
  const maxActionPoints = useGameStore((state) => state.maxActionPoints);
  const stats = useGameStore((state) => state.stats);
  const rank = useGameStore((state) => state.rank);
  const team = useGameStore((state) => state.team);
  const doAction = useGameStore((state) => state.doAction);
  const finishQuarter = useGameStore((state) => state.finishQuarter);

  const isLateGame = rank === Rank.PROJECT_MANAGER ||
                     rank === Rank.PROJECT_DIRECTOR ||
                     rank === Rank.PARTNER;

  const availableActions = Object.values(ACTIONS).filter(action => {
    if (action.phase === 'late') return isLateGame;
    if (action.phase === 'early') return !isLateGame;
    return true;
  });

  const handleAction = (actionType: ActionType) => {
    if (actionPoints <= 0) {
      alert('行动点已用完，将进入季度结算');
      return;
    }

    const result = doAction(actionType);
    if (result.success) {
      // 检查是否行动点归零
      if (get().actionPoints <= 0) {
        finishQuarter();
        navigate('/settlement');
      }
    }
  };

  const handleFinishQuarter = () => {
    finishQuarter();
    navigate('/settlement');
  };

  const canAfford = (cost?: number) => {
    return cost === undefined || stats.cash >= cost;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-40">
      <div className="max-w-md mx-auto px-4">
        {/* 季度和状态信息 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            第 {currentQuarter} 季度
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
            <span>⚡ 行动点：{actionPoints}/{maxActionPoints}</span>
            <span>❤️ 健康：{stats.health}/100</span>
          </div>
        </div>

        {/* 基础行动 */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">基础行动</h2>
          <div className="grid grid-cols-2 gap-3">
            {availableActions
              .filter(a => [ActionType.DO_PROJECT, ActionType.TRAINING, ActionType.REST].includes(a.type))
              .map((action) => {
                const affordable = canAfford(action.costCash);
                const hasEnoughAP = actionPoints > 0;

                return (
                  <button
                    key={action.type}
                    onClick={() => handleAction(action.type)}
                    disabled={!hasEnoughAP || !affordable}
                    className={`
                      p-4 rounded-xl border-2 transition-all
                      ${hasEnoughAP && affordable
                        ? 'border-brand-200 bg-white hover:border-brand-400 hover:shadow-md active:scale-[0.98]'
                        : 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{action.icon}</div>
                    <div className="font-bold text-slate-900">{action.name}</div>
                    {action.costCash && (
                      <div className={`text-sm ${affordable ? 'text-slate-600' : 'text-red-600'}`}>
                        💰 {action.costCash.toLocaleString()}
                      </div>
                    )}
                    {action.effects && (
                      <div className="text-xs text-slate-500 mt-1">
                        {action.effects.health !== undefined && (
                          <span className={action.effects.health > 0 ? 'text-green-600' : 'text-red-600'}>
                            ❤️ {action.effects.health > 0 ? '+' : ''}{action.effects.health}
                          </span>
                        )}
                        {action.effects.progress && (
                          <span className="text-brand-600 ml-2">
                            📈 +{action.effects.progress}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        </section>

        {/* 团队行动（后期） */}
        {isLateGame && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">团队行动</h2>
            <div className="grid grid-cols-2 gap-3">
              {availableActions
                .filter(a => [ActionType.RECRUIT, ActionType.TEAM_PROJECT, ActionType.RESOLVE_ISSUE].includes(a.type))
                .map((action) => {
                  const hasEnoughAP = actionPoints > 0;

                  return (
                    <button
                      key={action.type}
                      onClick={() => handleAction(action.type)}
                      disabled={!hasEnoughAP}
                      className={`
                        p-4 rounded-xl border-2 transition-all
                        ${hasEnoughAP
                          ? 'border-purple-200 bg-white hover:border-purple-400 hover:shadow-md active:scale-[0.98]'
                          : 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{action.icon}</div>
                      <div className="font-bold text-slate-900">{action.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{action.description}</div>
                    </button>
                  );
                })}
            </div>
          </section>
        )}

        {/* 完成本季度按钮 */}
        <div className="mt-8">
          <button
            onClick={handleFinishQuarter}
            className="w-full py-3 px-6 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            完成本季度
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: 验证编译**

Run: `cd frontend && npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit**

```bash
git add frontend/src/pages/ActionsPage.tsx
git commit -m "feat(page): add actions page component"
```

---

（继续下一阶段...）

/**
 * 游戏状态类型定义
 */

import { PlayerStats, Effects } from './player';
import { EventCard } from './event';
import { TeamState } from './team';

/**
 * 属性影响配置
 */
export interface AbilityEffects {
  pricePredictionAccuracy: number;  // 价格预测准确率
  specialEventChance: number;       // 特殊事件概率
  relationBonus: number;            // 关系加成
}

/**
 * 属性要求的类型
 */
export interface AbilityRequirement {
  workAbility?: number;
  luck?: number;
}

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
  FREELANCE = 'freelance',
  CUT_CORNERS = 'cut_corners',
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
  effects?: {
    progress?: number;
    quality?: number;
    health?: number;
    cash?: number;
    reputation?: number;
  };
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

export enum GameStatus {
  IDLE = 'idle',           // 未开始
  PLAYING = 'playing',     // 进行中
  STRATEGY_PHASE = 'strategy_phase', // 策略阶段
  SETTLEMENT = 'settlement', // 季度结算
  PAUSED = 'paused',       // 暂停
  COMPLETED = 'completed', // 完成（晋升到合伙人）
  FAILED = 'failed',       // 失败（破产/过劳/封杀）
}

export enum EndReason {
  PROMOTED_TO_PARTNER = 'promoted_to_partner', // 晋升合伙人（胜利）
  HEALTH_DEPLETED = 'health_depleted',         // 过劳猝死
  REPUTATION_DEPLETED = 'reputation_depleted', // 行业封杀
}

/**
 * 职级等级
 */
export enum Rank {
  INTERN = 'intern',                    // 实习生
  ASSISTANT_ENGINEER = 'assistant_engineer', // 助理工程师
  ENGINEER = 'engineer',                // 工程师
  SENIOR_ENGINEER = 'senior_engineer',  // 高级工程师
  PROJECT_MANAGER = 'project_manager',  // 项目经理
  PROJECT_DIRECTOR = 'project_director', // 项目总监
  PARTNER = 'partner',                  // 合伙人
}

/**
 * 关系要求
 */
export interface RelationshipRequirement {
  type: RelationshipType;
  requiredValue: number;
}

/**
 * 职级配置
 */
export interface RankConfig {
  rank: Rank;
  name: string;
  assetsRequired: number;    // 净资产要求
  projectsRequired: number;  // 完成项目数要求
  reputationRequired: number; // 声誉要求
  specialRequirement?: string; // 特殊要求
  minQuarterlySalary: number; // 最低季度工资
  raiseRange: [number, number]; // 涨薪幅度范围 [百分比下限, 百分比上限]，如 [5, 15] 表示 5%-15%
  relationshipRequirements?: {
    requirements: RelationshipRequirement[];
    requirementType?: 'all' | 'any';
  }; // 关系要求：晋升时需要达到的关系值
}

/**
 * 材料类型
 */
export enum MaterialType {
  CEMENT = 'cement',         // 水泥
  STEEL = 'steel',           // 钢筋
  SAND = 'sand',             // 砂石
  CONCRETE = 'concrete',     // 混凝土
}

/**
 * 材料配置
 */
export interface MaterialConfig {
  type: MaterialType;
  name: string;
  unit: string;
  basePrice: number;         // 基准价格
  priceVolatility: number;   // 价格波动幅度 (0-1)
  storageFee: number;        // 仓储费/季度/单位
  minTrade: number;          // 最小交易量
  maxTrade: number;          // 最大交易量
}

/**
 * 材料库存
 */
export interface MaterialInventory {
  type: MaterialType;
  amount: number;
  averageCost: number; // 平均成本
}

/**
 * 材料市场价格
 */
export interface MaterialPrice {
  type: MaterialType;
  currentPrice: number;
  priceChange: number; // 相比基准的变化 (百分比)
  trend: 'up' | 'down' | 'stable';
}

/**
 * 关系类型
 */
export enum RelationshipType {
  CLIENT = 'client',         // 甲方
  SUPERVISION = 'supervision', // 监理
  DESIGN = 'design',         // 设计院
  LABOR = 'labor',           // 劳务队
  GOVERNMENT = 'government', // 政府部门
}

/**
 * 关系配置
 */
export interface RelationshipConfig {
  type: RelationshipType;
  name: string;
  initialValue: number;
  decayRate: number;         // 每季度衰减
  maintenanceCost: 'low' | 'medium' | 'high';
}

/**
 * 关系状态
 */
export interface RelationshipState {
  type: RelationshipType;
  value: number; // 0-100
}

/**
 * 季度结算数据
 */
export interface QuarterSettlement {
  quarter: number;
  income: number;
  expenses: {
    salary: number;
    livingCosts: number;
    storage: number;
    total: number;
  };
  relationshipDecay: Record<RelationshipType, number>;
  netChange: number;
  promotionCheck: {
    canPromote: boolean;
    nextRank?: Rank;
    missingRequirements?: string[];
  };
  quarterStartEvents?: Array<{
    id: string;
    title: string;
    description: string;
    effects: Effects;
    isPositive: boolean;
  }>;
}

/**
 * 游戏统计
 */
export interface GameStats {
  completedProjects: number;
  qualityProjects: number; // 质量≥90的项目数
  totalQuarters: number;
  totalEvents: number;
}

/**
 * 扩展的游戏状态
 */
export interface GameState {
  status: GameStatus;
  currentQuarter: number; // 季度数（原 currentRound）
  maxActionsPerQuarter: number; // 每季度最大行动次数
  stats: PlayerStats;
  currentEvent: EventCard | null;
  eventHistory: EventCard[];

  // 职级系统
  rank: Rank;
  actualSalary: number; // 实际季度工资（可能高于最低工资）
  gameStats: GameStats;

  // 材料市场
  inventory: Record<MaterialType, number>; // 库存
  materialPrices: Record<MaterialType, MaterialPrice>;

  // 关系系统
  relationships: Record<RelationshipType, number>; // 关系值 0-100
  maintenanceCount: number; // 本季度已维护次数
  materialTradeCount: number; // 本季度已交易次数（买卖合并计数）
  maintainedRelationships: Set<RelationshipType>; // 本季度已维护的关系集合

  // 项目进度（单个项目内）
  projectProgress: number; // 当前项目进度
  projectQuality: number;  // 当前项目质量

  // 新增：游戏阶段
  phase: GamePhase;

  // 新增：行动点系统
  actionPoints: number;
  maxActionPoints: number;

  // 新增：团队系统
  team: TeamState;

  // 新增：待处理事件
  pendingEvents: EventCard[];

  score: number;
  endReason?: EndReason;
}

/**
 * 扩展的游戏配置
 */
export interface GameConfig {
  initialStats: PlayerStats;
  initialRank: Rank;
  initialInventory: Record<MaterialType, number>;
  initialRelationships: Record<RelationshipType, number>;
}

/**
 * 买卖操作结果
 */
export interface TradeResult {
  success: boolean;
  cashChange: number;
  inventoryChange: number;
  message: string;
}

/**
 * 关系维护结果
 */
export interface MaintenanceResult {
  success: boolean;
  relationshipChange: number;
  cashChange: number;
  healthChange?: number;
  message: string;
}

// 职级配置表
export const RANK_CONFIGS: Record<Rank, RankConfig> = {
  [Rank.INTERN]: {
    rank: Rank.INTERN,
    name: '实习生',
    assetsRequired: 0,
    projectsRequired: 0,
    reputationRequired: 0,
    minQuarterlySalary: 9000,  // 实习生生活补贴（固定，不涨薪）
    raiseRange: [0, 0],  // 实习生不涨薪
  },
  [Rank.ASSISTANT_ENGINEER]: {
    rank: Rank.ASSISTANT_ENGINEER,
    name: '助理工程师',
    assetsRequired: 100000,
    projectsRequired: 2,
    reputationRequired: 40,
    minQuarterlySalary: 15000,
    raiseRange: [3, 8],  // 3%-8% 涨薪
  },
  [Rank.ENGINEER]: {
    rank: Rank.ENGINEER,
    name: '工程师',
    assetsRequired: 500000,
    projectsRequired: 5,
    reputationRequired: 60,
    minQuarterlySalary: 36000,
    raiseRange: [5, 12],  // 5%-12% 涨薪
  },
  [Rank.SENIOR_ENGINEER]: {
    rank: Rank.SENIOR_ENGINEER,
    name: '高级工程师',
    assetsRequired: 1500000,
    projectsRequired: 10,
    reputationRequired: 70,
    specialRequirement: '完成过1个优质项目(质量≥90)',
    minQuarterlySalary: 60000,
    raiseRange: [8, 15],  // 8%-15% 涨薪
  },
  [Rank.PROJECT_MANAGER]: {
    rank: Rank.PROJECT_MANAGER,
    name: '项目经理',
    assetsRequired: 5000000,
    projectsRequired: 15,
    reputationRequired: 80,
    specialRequirement: '完成过3个项目',
    minQuarterlySalary: 100000,
    raiseRange: [10, 20],  // 10%-20% 涨薪
  },
  [Rank.PROJECT_DIRECTOR]: {
    rank: Rank.PROJECT_DIRECTOR,
    name: '项目总监',
    assetsRequired: 15000000,
    projectsRequired: 25,
    reputationRequired: 90,
    specialRequirement: '完成过5个优质项目',
    minQuarterlySalary: 165000,
    raiseRange: [12, 25],  // 12%-25% 涨薪
  },
  [Rank.PARTNER]: {
    rank: Rank.PARTNER,
    name: '合伙人',
    assetsRequired: 50000000,
    projectsRequired: 40,
    reputationRequired: 95,
    specialRequirement: '完成过10个优质项目',
    minQuarterlySalary: 300000,
    raiseRange: [0, 0],  // 合伙人分红制，不涨薪
  },
};

// 材料配置表（价格调整后）
export const MATERIAL_CONFIGS: Record<MaterialType, MaterialConfig> = {
  [MaterialType.CEMENT]: {
    type: MaterialType.CEMENT,
    name: '水泥',
    unit: '吨',
    basePrice: 45,  // 从 450 → 45
    priceVolatility: 0.2,
    storageFee: 0.5,  // 从 5 → 0.5
    minTrade: 10,
    maxTrade: 100,
  },
  [MaterialType.STEEL]: {
    type: MaterialType.STEEL,
    name: '钢筋',
    unit: '吨',
    basePrice: 420,  // 从 4200 → 420
    priceVolatility: 0.15,
    storageFee: 1.5,  // 从 15 → 1.5
    minTrade: 1,
    maxTrade: 20,
  },
  [MaterialType.SAND]: {
    type: MaterialType.SAND,
    name: '砂石',
    unit: '立方',
    basePrice: 12,  // 从 120 → 12
    priceVolatility: 0.25,
    storageFee: 0.2,  // 从 2 → 0.2
    minTrade: 50,
    maxTrade: 500,
  },
  [MaterialType.CONCRETE]: {
    type: MaterialType.CONCRETE,
    name: '混凝土',
    unit: '立方',
    basePrice: 38,  // 从 380 → 38
    priceVolatility: 0.18,
    storageFee: 0.8,  // 从 8 → 0.8
    minTrade: 10,
    maxTrade: 100,
  },
};

// 关系配置表
export const RELATIONSHIP_CONFIGS: Record<RelationshipType, RelationshipConfig> = {
  [RelationshipType.CLIENT]: {
    type: RelationshipType.CLIENT,
    name: '甲方爸爸',
    initialValue: 50,
    decayRate: 4,
    maintenanceCost: 'high',
  },
  [RelationshipType.SUPERVISION]: {
    type: RelationshipType.SUPERVISION,
    name: '监理单位',
    initialValue: 50,
    decayRate: 3,
    maintenanceCost: 'medium',
  },
  [RelationshipType.DESIGN]: {
    type: RelationshipType.DESIGN,
    name: '设计院',
    initialValue: 50,
    decayRate: 3,
    maintenanceCost: 'medium',
  },
  [RelationshipType.LABOR]: {
    type: RelationshipType.LABOR,
    name: '劳务队',
    initialValue: 50,
    decayRate: 2,
    maintenanceCost: 'low',
  },
  [RelationshipType.GOVERNMENT]: {
    type: RelationshipType.GOVERNMENT,
    name: '政府部门',
    initialValue: 50,
    decayRate: 5,
    maintenanceCost: 'high',
  },
};

/**
 * 游戏状态管理 Store（重构版）
 * 支持行动点系统、团队系统、事件系统重构
 */

import { create } from 'zustand';
import { TRAINING_CONFIG, TRAINING_COOLDOWN } from '@/data/constants';
import {
  GameState,
  GameStatus,
  EndReason,
  EventCard,
  EventOption,
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
  EventStatus,
  TeamMemberType,
  TeamMember,
  TeamIssue,
} from '@shared/types';
import { EVENTS } from '@/data/events';
import {
  GAME_CONFIG,
  ACTIONS,
  MAX_ACTIONS_PER_QUARTER,
  MAX_MATERIAL_TRADES_PER_QUARTER,
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
  RELATIONSHIP_DISPLAY,
  LIVING_COSTS_CONFIG,
  PROJECT_COMPLETION,
  QUARTER_START_EVENT_POOL,
  LOSE_CONDITIONS,
  LLM_CONFIG,
} from '@/data/constants';
import { enhanceDescription, generateSpecialEvent } from '@/api/llmApi';
import { startGame as startGameApi, finishGame } from '@/api/gameApi';
import type {
  DecisionEvent,
  EventResult,
} from '@/data/events/eventTypes';
import {
  getEventsForRank,
  shuffleQuarterEvents
} from '@/data/events/index';

// ==================== 全局变量 ====================

// 用于跟踪最近使用的事件（避免重复）
const recentEventIds = new Set<string>();
const RECENT_EVENT_LIMIT = 3;

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

const getMaxMaintenanceCount = (rank: Rank): number => {
  switch (rank) {
    case Rank.INTERN:
      return 1;
    case Rank.ASSISTANT_ENGINEER:
      return 2;
    case Rank.ENGINEER:
      return 3;
    case Rank.SENIOR_ENGINEER:
      return 4;
    case Rank.PROJECT_MANAGER:
      return 5;
    case Rank.PROJECT_DIRECTOR:
      return 6;
    case Rank.PARTNER:
      return 8;
    default:
      return 3;
  }
};

// 从数组中随机抽取一个元素
const getRandomEvent = (
  events: EventCard[],
  usedEventIds: Set<string>
): EventCard => {
  const availableEvents = events.filter((e) => !usedEventIds.has(e.id));

  if (availableEvents.length === 0) {
    usedEventIds.clear();
    return events[Math.floor(Math.random() * events.length)];
  }

  return availableEvents[Math.floor(Math.random() * availableEvents.length)];
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
    workAbility: GAME_CONFIG.initialStats.workAbility,
    luck: GAME_CONFIG.initialStats.luck,
  },
  currentEvent: null,
  eventHistory: [],

  // 关键决策记录
  keyDecisions: [],

  // 季度行动记录
  quarterlyActions: [],

  // 当前季度临时记录
  currentQuarterActionCounts: {},
  currentQuarterTrainingCounts: {},

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
  projectQuality: 50,  // 初始质量值

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

  // 特殊效果状态（来自关系维护）
  pricePredictionBonus: 0,
  storageFeeDiscount: 0,

  // 优质项目完成通知
  qualityProjectJustCompleted: false,

  score: 0,
});

// ==================== 接口定义 ====================

interface ActionResult {
  success: boolean;
  message: string;
  effects?: Effects;
}

interface GameStore extends GameState {
  // 扩展状态
  playerName?: string;       // 玩家姓名
  playerGender?: 'male' | 'female'; // 玩家性别
  projectCompletedThisQuarter: boolean; // 本季度是否完成了项目
  trainingCooldowns: {       // 训练冷却状态
    basic_work: number;
    advanced_work: number;
    basic_luck: number;
    advanced_luck: number;
  };
  runId: string | null;
  deviceId: string | null;

  // LLM 相关状态
  specialEventCount: number;
  isLLMEnhancing: boolean;

  // 当前季度结算数据
  currentSettlement: QuarterSettlement | null;

  // 材料价格历史
  materialPriceHistory: Record<MaterialType, number[]>;

  // 下季度真实价格（预先生成，玩家不可见）
  nextQuarterRealPrices: Record<MaterialType, number> | null;

  // 本季度价格预测缓存（避免每次点击都重新生成）
  pricePredictions: Record<MaterialType, {
    trend: 'up' | 'down' | 'stable';
    minPrice: number;
    maxPrice: number;
    accuracy: number;
    eventChance: number;
  }> | null;

  // 事件触发计数器
  actionsSinceLastEventCheck: number;

  // 本季度已执行行动次数
  actionsThisQuarter: number;

  // 事件决策系统
  quarterEvents: DecisionEvent[];        // 本季度待处理事件
  currentEventIndex: number;             // 当前事件索引
  completedEventResults: EventResult[];  // 本季度已完成事件结果
  allEventHistory: EventResult[];        // 全局事件历史（合并到eventHistory中）
  pendingEventResult: EventResult | null; // 待确认的结果
  showEventResult: boolean;             // 是否显示结果卡片

  // Actions
  initializeGame: (config?: {
    name?: string;
    gender?: 'male' | 'female';
    workAbility?: number;
    luck?: number;
  }) => Promise<void>;
  executeTraining: (trainingType: 'basic_work' | 'advanced_work' | 'basic_luck' | 'advanced_luck') => {
    success: boolean;
    message: string;
  };
  generatePricePrediction: (material: MaterialType) => {
    trend: 'up' | 'down' | 'stable';
    minPrice: number;
    maxPrice: number;
    accuracy: number;
    eventChance: number;
  };
  startGame: () => Promise<void>;
  resetGame: () => void;
  uploadScore: () => Promise<void>;

  // 事件系统
  drawEvent: () => Promise<void>;

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

  // 事件决策系统 Actions
  initializeQuarterEvents: () => void;
  selectEventOption: (optionId: string) => void;
  continueToNextEvent: () => void;
  applyEventEffects: (effects: any) => void;
  isAllEventsCompleted: () => boolean;
  getCurrentEvent: () => DecisionEvent | null;
  getCurrentEventResult: () => EventResult | null;

  // 保留的方法（待适配）
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
  dismissQualityProjectNotification: () => void;
  calculateNetAssets: () => number;
  calculateStorageFee: () => number;
  calculateQuarterlySalary: () => number;
  raiseSalary: () => { success: boolean; newSalary?: number; message: string };
  enhanceEventDescription: (event: EventCard) => Promise<EventCard>;
  generateLLMSpecialEvent: () => Promise<EventCard | null>;
  shouldTriggerSpecialEvent: (quarter: number, stats: PlayerStats) => boolean;

  // 关键决策系统（传记生成）
  isImportantDecision: (event: EventCard, selectedOption: EventOption) => boolean;
}

// ==================== 材料价格初始化 ====================

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

// ==================== 价格生成函数（支持属性影响）====================

const generateNextQuarterPrices = (
  currentPrices: Record<MaterialType, MaterialPrice>,
  workAbility: number,
  luck: number
): Record<MaterialType, MaterialPrice> => {
  const newPrices: Record<MaterialType, MaterialPrice> = {} as any;

  // 工作能力影响价格波动：工作能力越高，波动越小（市场更稳定可预测）
  // workAbility 0 → ±15% 波动（完全随机）
  // workAbility 50 → ±10% 波动
  // workAbility 100 → ±5% 波动（高度稳定）
  const baseVolatility = 0.30 * (1 - workAbility / 200); // 0.30 → 0.15

  Object.values(MaterialType).forEach(material => {
    const currentPrice = currentPrices[material].currentPrice;

    // 1. 基础价格波动（受工作能力影响）
    let newPrice = currentPrice * (1 + (Math.random() - 0.5) * baseVolatility);

    // 2. 幸运特殊事件（暴涨/暴跌）
    const eventChance = 2 + luck / 20; // 2-7%
    const eventRoll = Math.random() * 100;

    if (eventRoll < eventChance) {
      const isGoodLuck = Math.random() < 0.6; // 60%是好事件
      const multiplier = isGoodLuck ? 1.5 : 0.7;
      newPrice = newPrice * multiplier;

      console.log(`[幸运事件触发] ${material}: ${isGoodLuck ? '暴涨+50%' : '暴跌-30%'}`);
    }

    // 3. 价格边界检查
    newPrice = Math.max(100, Math.min(newPrice, 10000));

    // 4. 生成趋势
    const trend = newPrice > currentPrice ? 'up' :
                  newPrice < currentPrice ? 'down' : 'stable';
    const priceChange = Math.abs((newPrice - currentPrice) / currentPrice * 100);

    newPrices[material] = {
      type: material,
      currentPrice: Math.round(newPrice),
      priceChange: Math.round(priceChange * 10) / 10,
      trend
    };
  });

  return newPrices;
};

// ==================== Store 定义 ====================

export const useGameStore = create<GameStore>((set, get) => ({
  // 初始化状态
  ...createInitialState(),
  playerName: undefined,
  playerGender: undefined,
  projectCompletedThisQuarter: false,
  trainingCooldowns: {
    basic_work: 0,
    advanced_work: 0,
    basic_luck: 0,
    advanced_luck: 0,
  },
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
  nextQuarterRealPrices: null,
  pricePredictions: null,
  actionsSinceLastEventCheck: 0,
  actionsThisQuarter: 0,

  // 事件决策系统
  quarterEvents: [],
  currentEventIndex: 0,
  completedEventResults: [],
  allEventHistory: [],
  pendingEventResult: null,
  showEventResult: false,

  // ==================== 游戏流程 ====================

  initializeGame: async (config?: {
    name?: string;
    gender?: 'male' | 'female';
    workAbility?: number;
    luck?: number;
  }) => {
    const defaultConfig = {
      name: '玩家',
      gender: 'male' as const,
      workAbility: 5,
      luck: 5
    };

    const finalConfig = { ...defaultConfig, ...config };

    const initialState = createInitialState();
    const initialPrices = initializeMaterialPrices();

    // 覆盖初始属性中的 workAbility 和 luck
    initialState.stats.workAbility = finalConfig.workAbility;
    initialState.stats.luck = finalConfig.luck;

    // 初始化价格历史
    const initialHistory: Record<MaterialType, number[]> = {
      [MaterialType.CEMENT]: [initialPrices[MaterialType.CEMENT].currentPrice],
      [MaterialType.STEEL]: [initialPrices[MaterialType.STEEL].currentPrice],
      [MaterialType.SAND]: [initialPrices[MaterialType.SAND].currentPrice],
      [MaterialType.CONCRETE]: [initialPrices[MaterialType.CONCRETE].currentPrice],
    };

    // 初始化：生成第二季度的真实价格（用于价格预测系统）
    const nextQuarterPrices = generateNextQuarterPrices(
      initialPrices,
      initialState.stats.workAbility,
      initialState.stats.luck
    );
    const initialNextQuarterRealPrices: Record<MaterialType, number> = {} as any;
    Object.values(MaterialType).forEach(type => {
      initialNextQuarterRealPrices[type] = nextQuarterPrices[type].currentPrice;
    });

    try {
      // 调用后端 API 获取 runId
      console.log('=== initializeGame 调用 startGameApi ===');
      const response = await startGameApi();
      console.log('✅ startGameApi 返回:', { runId: response.runId, serverSeed: response.serverSeed });

      set({
        ...initialState,
        playerName: finalConfig.name,
        playerGender: finalConfig.gender,
        status: GameStatus.PLAYING,
        currentQuarter: 1,
        materialPrices: initialPrices,
        materialPriceHistory: initialHistory,
        runId: response.runId,
        deviceId: null, // deviceId 在后端通过请求体传递，不需要在 store 中存储
        actionsSinceLastEventCheck: 0,
        actionsThisQuarter: 0,
        nextQuarterRealPrices: initialNextQuarterRealPrices,
      });
      console.log('✅ 游戏状态已设置，runId:', response.runId);

      recentEventIds.clear();
      get().drawEvent();
    } catch (error) {
      console.error('❌ Failed to start game:', error);
      // 降级：仍然允许离线游戏
      set({
        ...initialState,
        playerName: finalConfig.name,
        playerGender: finalConfig.gender,
        status: GameStatus.PLAYING,
        currentQuarter: 1,
        materialPrices: initialPrices,
        materialPriceHistory: initialHistory,
        runId: null,
        deviceId: null,
        actionsSinceLastEventCheck: 0,
        actionsThisQuarter: 0,
        nextQuarterRealPrices: initialNextQuarterRealPrices,
      });
      recentEventIds.clear();
      get().drawEvent();
    }
  },

  executeTraining: (trainingType: 'basic_work' | 'advanced_work' | 'basic_luck' | 'advanced_luck') => {
    const state = get();

    const config = TRAINING_CONFIG[trainingType];
    const cooldownKey = trainingType;
    const cooldownQuarter = state.trainingCooldowns[cooldownKey];
    const currentQuarter = state.currentQuarter;

    // 检查冷却
    if (cooldownQuarter > 0 && currentQuarter < cooldownQuarter) {
      return {
        success: false,
        message: `该训练需要冷却 ${cooldownQuarter - currentQuarter} 个季度`
      };
    }

    const stats = state.stats;

    // 检查资源
    if (stats.cash < config.cost.cash || stats.health < config.cost.health) {
      return {
        success: false,
        message: '资源不足'
      };
    }

    // 计算成功率
    let successRate: number;
    if (config.successRate === 'formula') {
      successRate = 50 + stats.luck / 2;
    } else {
      successRate = config.successRate as number;
    }

    // 高级训练需要判定成功率
    if (trainingType.includes('advanced')) {
      const roll = Math.random() * 100;

      if (roll > successRate) {
        // 训练失败
        set((state) => ({
          ...state,
          stats: {
            ...state.stats,
            cash: state.stats.cash - config.cost.cash,
            health: state.stats.health - config.cost.health
          },
          trainingCooldowns: {
            ...state.trainingCooldowns,
            [cooldownKey]: currentQuarter + TRAINING_COOLDOWN.advanced // 3个季度冷却
          }
        }));

        return {
          success: false,
          message: '训练失败，资源已消耗'
        };
      }
    }

    // 训练成功
    const abilityType: 'workAbility' | 'luck' = trainingType.includes('work') ? 'workAbility' : 'luck';
    const effect = config.effect as { workAbility?: number; luck?: number };
    const newAbility = Math.min(100, stats[abilityType] + (effect[abilityType] || 0));
    const cooldown = trainingType.includes('advanced')
      ? TRAINING_COOLDOWN.advanced
      : TRAINING_COOLDOWN.basic;

    // 记录训练类型（用于传记生成）
    const currentTrainingCounts = { ...state.currentQuarterTrainingCounts };
    currentTrainingCounts[trainingType] = (currentTrainingCounts[trainingType] || 0) + 1;

    set((state) => ({
      ...state,
      stats: {
        ...state.stats,
        [abilityType]: newAbility,
        cash: state.stats.cash - config.cost.cash,
        health: state.stats.health - config.cost.health
      },
      trainingCooldowns: {
        ...state.trainingCooldowns,
        [cooldownKey]: currentQuarter + cooldown
      },
      currentQuarterTrainingCounts: currentTrainingCounts,
    }));

    return {
      success: true,
      message: `训练成功！${abilityType === 'workAbility' ? '工作能力' : '幸运'}+${effect[abilityType]}`
    };
  },

  generatePricePrediction: (material: MaterialType) => {
    const state = get();

    // 1. 如果本季度已有预测缓存，直接返回
    if (state.pricePredictions && state.pricePredictions[material]) {
      return state.pricePredictions[material];
    }

    const workAbility = state.stats.workAbility;
    const luck = state.stats.luck;
    const pricePredictionBonus = state.pricePredictionBonus;
    const currentPrice = state.materialPrices[material].currentPrice;

    // 2. 如果没有下季度真实价格，先生成（这应该在 nextQuarter 中完成，但作为兜底逻辑）
    let realNextPrice: number;
    if (!state.nextQuarterRealPrices) {
      // 兜底：生成真实价格并存储
      const allRealPrices = generateNextQuarterPrices(
        state.materialPrices,
        workAbility,
        luck
      );
      const realPricesRecord: Record<MaterialType, number> = {} as any;
      Object.values(MaterialType).forEach(type => {
        realPricesRecord[type] = allRealPrices[type].currentPrice;
      });
      set({ nextQuarterRealPrices: realPricesRecord });
      realNextPrice = realPricesRecord[material];
    } else {
      realNextPrice = state.nextQuarterRealPrices[material];
    }

    // 3. 计算准确率（工作能力 + 特殊加成）
    const accuracy = 50 + workAbility / 2 + pricePredictionBonus;

    // 4. 基于真实价格生成预测（加入准确率相关的偏差）
    const realChange = (realNextPrice - currentPrice) / currentPrice; // 真实涨跌幅
    const accuracyFactor = accuracy / 100; // 0.5 ~ 1.0

    // 预测偏差：准确率越低，偏差越大
    const maxDeviation = (1 - accuracyFactor) * 0.15; // 最大偏差 0-7.5%
    const deviation = (Math.random() - 0.5) * 2 * maxDeviation;
    const predictedChange = realChange + deviation;

    // 5. 生成预测趋势
    const trend: 'up' | 'down' | 'stable' = predictedChange > 0.02 ? 'up' :
                  predictedChange < -0.02 ? 'down' : 'stable';

    // 6. 预测区间宽度（准确率越高，区间越窄）
    const range = (100 - accuracy) / 100 * 0.15; // 0-15%
    const predictedPrice = currentPrice * (1 + predictedChange);
    const minPrice = Math.round(predictedPrice * (1 - range));
    const maxPrice = Math.round(predictedPrice * (1 + range));

    // 7. 特殊事件概率
    const eventChance = 2 + luck / 20; // 2-7%

    const prediction: {
      trend: 'up' | 'down' | 'stable';
      minPrice: number;
      maxPrice: number;
      accuracy: number;
      eventChance: number;
    } = {
      trend,
      minPrice,
      maxPrice,
      accuracy: Math.round(accuracy),
      eventChance: Math.round(eventChance * 10) / 10
    };

    // 8. 缓存预测结果
    const newPredictions = {
      ...(state.pricePredictions || {} as any),
      [material]: prediction
    };
    set({ pricePredictions: newPredictions });

    return prediction;
  },

  startGame: async () => {
    try {
      const response = await startGameApi();

      const initialState = createInitialState();
      const initialPrices = initializeMaterialPrices();
      const initialHistory: Record<MaterialType, number[]> = {
        [MaterialType.CEMENT]: [initialPrices[MaterialType.CEMENT].currentPrice],
        [MaterialType.STEEL]: [initialPrices[MaterialType.STEEL].currentPrice],
        [MaterialType.SAND]: [initialPrices[MaterialType.SAND].currentPrice],
        [MaterialType.CONCRETE]: [initialPrices[MaterialType.CONCRETE].currentPrice],
      };

      // 初始化：生成第二季度的真实价格（用于价格预测系统）
      const nextQuarterPrices = generateNextQuarterPrices(
        initialPrices,
        initialState.stats.workAbility,
        initialState.stats.luck
      );
      const initialNextQuarterRealPrices: Record<MaterialType, number> = {} as any;
      Object.values(MaterialType).forEach(type => {
        initialNextQuarterRealPrices[type] = nextQuarterPrices[type].currentPrice;
      });

      set({
        ...initialState,
        status: GameStatus.PLAYING,
        currentQuarter: 1,
        materialPrices: initialPrices,
        materialPriceHistory: initialHistory,
        runId: response.runId,
        actionsSinceLastEventCheck: 0,
        actionsThisQuarter: 0,
        nextQuarterRealPrices: initialNextQuarterRealPrices,
      });

      recentEventIds.clear();
      get().drawEvent();
    } catch (error) {
      console.error('Failed to start game:', error);
      const initialState = createInitialState();
      const initialPrices = initializeMaterialPrices();
      const initialHistory: Record<MaterialType, number[]> = {
        [MaterialType.CEMENT]: [initialPrices[MaterialType.CEMENT].currentPrice],
        [MaterialType.STEEL]: [initialPrices[MaterialType.STEEL].currentPrice],
        [MaterialType.SAND]: [initialPrices[MaterialType.SAND].currentPrice],
        [MaterialType.CONCRETE]: [initialPrices[MaterialType.CONCRETE].currentPrice],
      };

      // 初始化：生成第二季度的真实价格（用于价格预测系统）
      const nextQuarterPrices = generateNextQuarterPrices(
        initialPrices,
        initialState.stats.workAbility,
        initialState.stats.luck
      );
      const initialNextQuarterRealPrices: Record<MaterialType, number> = {} as any;
      Object.values(MaterialType).forEach(type => {
        initialNextQuarterRealPrices[type] = nextQuarterPrices[type].currentPrice;
      });

      set({
        ...initialState,
        status: GameStatus.PLAYING,
        currentQuarter: 1,
        materialPrices: initialPrices,
        materialPriceHistory: initialHistory,
        runId: null,
        actionsSinceLastEventCheck: 0,
        actionsThisQuarter: 0,
        nextQuarterRealPrices: initialNextQuarterRealPrices,
      });
    }
  },

  resetGame: () => {
    const initialState = createInitialState();
    const initialPrices = initializeMaterialPrices();
    const initialHistory: Record<MaterialType, number[]> = {
      [MaterialType.CEMENT]: [initialPrices[MaterialType.CEMENT].currentPrice],
      [MaterialType.STEEL]: [initialPrices[MaterialType.STEEL].currentPrice],
      [MaterialType.SAND]: [initialPrices[MaterialType.SAND].currentPrice],
      [MaterialType.CONCRETE]: [initialPrices[MaterialType.CONCRETE].currentPrice],
    };

    // 初始化：生成第二季度的真实价格（用于价格预测系统）
    const nextQuarterPrices = generateNextQuarterPrices(
      initialPrices,
      initialState.stats.workAbility,
      initialState.stats.luck
    );
    const initialNextQuarterRealPrices: Record<MaterialType, number> = {} as any;
    Object.values(MaterialType).forEach(type => {
      initialNextQuarterRealPrices[type] = nextQuarterPrices[type].currentPrice;
    });

    set({
      ...initialState,
      materialPrices: initialPrices,
      materialPriceHistory: initialHistory,
      runId: null,
      deviceId: null,
      specialEventCount: 0,
      isLLMEnhancing: false,
      currentSettlement: null,
      actionsSinceLastEventCheck: 0,
      actionsThisQuarter: 0,
      nextQuarterRealPrices: initialNextQuarterRealPrices,
    });
  },

  uploadScore: async () => {
    const state = get();
    console.log('=== uploadScore 调用 ===');
    console.log('runId:', state.runId);
    console.log('playerName:', state.playerName);
    console.log('score:', state.score);
    console.log('status:', state.status);

    if (!state.runId) {
      console.log('离线模式，跳过成绩上传 (runId 为空)');
      return;
    }

    try {
      // 获取永久保存的角色名
      const playerName = state.playerName || undefined;
      console.log('准备上传成绩:', {
        runId: state.runId,
        score: state.score,
        roundsPlayed: state.currentQuarter,
        playerName,
        endReason: state.endReason,
        finalRank: state.rank,
      });

      const result = await finishGame({
        runId: state.runId,
        score: state.score,
        finalStats: state.stats,
        roundsPlayed: state.currentQuarter,
        playerName,
        endReason: state.endReason || undefined,
        finalRank: state.rank || undefined,
      });
      console.log('✅ 成绩上传成功:', result);
    } catch (error) {
      console.error('❌ 成绩上传失败:', error);
    }
  },

  // ==================== 行动系统 ====================

  calculateActionPoints: () => {
    const state = get();
    return calculateActionPoints(state.stats.health);
  },

  doAction: (actionType: ActionType): ActionResult => {
    const state = get();
    const actionConfig = ACTIONS[actionType];

    // 检查行动点
    if (state.actionPoints <= 0) {
      return {
        success: false,
        message: '行动点已用完',
      };
    }

    // 检查阶段
    if (actionConfig.phase === 'late' && state.phase === GamePhase.EARLY) {
      return {
        success: false,
        message: '该行动在后期阶段解锁',
      };
    }
    if (actionConfig.phase === 'early' && state.phase === GamePhase.LATE) {
      return {
        success: false,
        message: '该行动仅在前期阶段可用',
      };
    }

    // 检查现金
    if (actionConfig.costCash && state.stats.cash < actionConfig.costCash) {
      return {
        success: false,
        message: '现金不足',
      };
    }

    // 执行行动
    const newStats = { ...state.stats };

    // 扣除现金
    if (actionConfig.costCash) {
      newStats.cash = Math.max(0, newStats.cash - actionConfig.costCash);
    }

    // 应用效果
    if (actionConfig.effects) {
      if (actionConfig.effects.health) {
        newStats.health = clampStat(newStats.health + actionConfig.effects.health);
      }
      if (actionConfig.effects.progress) {
        state.projectProgress = clampStat(state.projectProgress + actionConfig.effects.progress);
      }
      if (actionConfig.effects.quality) {
        state.projectQuality = clampStat(state.projectQuality + actionConfig.effects.quality);
      }
      if (actionConfig.effects.cash) {
        newStats.cash = Math.max(0, newStats.cash + actionConfig.effects.cash);
      }
      if (actionConfig.effects.reputation) {
        newStats.reputation = clampStat(newStats.reputation + actionConfig.effects.reputation);
      }
    }

    // 更新行动点
    const newActionPoints = state.actionPoints - 1;
    const newMaxActionPoints = calculateActionPoints(newStats.health);

    // 记录行动类型（用于传记生成）
    const currentCounts = { ...state.currentQuarterActionCounts };
    currentCounts[actionType] = (currentCounts[actionType] || 0) + 1;

    set({
      stats: newStats,
      actionPoints: newActionPoints,
      maxActionPoints: newMaxActionPoints,
      actionsThisQuarter: state.actionsThisQuarter + 1,
      currentQuarterActionCounts: currentCounts,
    });

    // 检查游戏结束
    get().checkGameEnd();

    return {
      success: true,
      message: `执行${actionConfig.name}成功`,
      effects: actionConfig.effects,
    };
  },

  // ==================== 季度系统 ====================

  finishQuarter: () => {
    const state = get();

    // 检查项目是否完成
    const projectCompleted = get().checkProjectCompletion();

    // 计算季度结算
    const salary = get().calculateQuarterlySalary();
    const storageFee = get().calculateStorageFee();
    const livingCostPercent = LIVING_COSTS_CONFIG.minPercent +
      Math.random() * (LIVING_COSTS_CONFIG.maxPercent - LIVING_COSTS_CONFIG.minPercent);
    const livingCost = Math.round(salary * livingCostPercent);
    const relationshipDecay: Record<RelationshipType, number> = {} as any;

    // 关系衰减
    const newRelationships = { ...state.relationships };
    Object.values(RelationshipType).forEach((type) => {
      if (!isRelationshipUnlocked(state.rank, type)) {
        return;
      }
      if (state.maintainedRelationships.has(type)) {
        return;
      }
      const config = RELATIONSHIP_CONFIGS[type];
      const decay = config.decayRate;
      const currentValue = state.relationships[type];
      relationshipDecay[type] = decay;
      newRelationships[type] = Math.max(0, currentValue - decay);
    });

    // 更新材料价格
    get().updateMaterialPrices();

    // 随机奖金事件
    let bonusEvent: typeof BONUS_EVENTS[0] | null = null;
    if (Math.random() < 0.1) {
      const totalProbability = BONUS_EVENTS.reduce((sum, e) => sum + e.probability, 0);
      let random = Math.random() * totalProbability;
      for (const event of BONUS_EVENTS) {
        random -= event.probability;
        if (random <= 0) {
          bonusEvent = event;
          break;
        }
      }
    }

    // 随机天灾事件
    let disasterEvent: typeof DISASTER_EVENTS[0] | null = null;
    if (Math.random() < 0.05) {
      const totalProbability = DISASTER_EVENTS.reduce((sum, e) => sum + e.probability, 0);
      let random = Math.random() * totalProbability;
      for (const event of DISASTER_EVENTS) {
        random -= event.probability;
        if (random <= 0) {
          disasterEvent = event;
          break;
        }
      }
    }

    // 计算收入和支出
    const projectIncome = projectCompleted ? PROJECT_COMPLETION.reward : 0;
    const bonusIncome = bonusEvent ? bonusEvent.cashReward : 0;
    const disasterPenalty = disasterEvent ? disasterEvent.cashPenalty : 0;
    const totalIncome = projectIncome + salary + bonusIncome;
    const totalExpenses = Math.abs(Math.min(0, salary)) + storageFee + livingCost + disasterPenalty;

    // 计算净变化
    const netChange = totalIncome - totalExpenses;

    // 调试日志
    console.log('=== finishQuarter 现金计算 ===');
    console.log('当前现金:', state.stats.cash);
    console.log('项目收入:', projectIncome);
    console.log('工资:', salary);
    console.log('奖金收入:', bonusIncome);
    console.log('生活费:', livingCost);
    console.log('仓储费:', storageFee);
    console.log('天灾惩罚:', disasterPenalty);
    console.log('总收入:', totalIncome);
    console.log('总支出:', totalExpenses);
    console.log('净变化:', netChange);
    console.log('预期现金:', state.stats.cash + netChange);

    // 季度涨薪机制
    let salaryRaise = 0;
    const rankConfig = RANK_CONFIGS[state.rank];
    if (state.rank !== Rank.INTERN && state.rank !== Rank.PARTNER) {
      const [minRaise, maxRaise] = rankConfig.raiseRange;
      if (minRaise > 0 || maxRaise > 0) {
        // 60% 概率涨薪
        if (Math.random() < 0.6) {
          const raisePercent = Math.random() * (maxRaise - minRaise) + minRaise;
          const raiseAmount = Math.round(state.actualSalary * (raisePercent / 100));
          salaryRaise = raiseAmount;
        }
      }
    }

    // 一次性更新所有状态
    const newStats = { ...state.stats };
    newStats.cash = Math.max(0, newStats.cash + netChange);

    // 应用天灾事件的其他影响
    if (disasterEvent) {
      if (disasterEvent.healthPenalty) {
        newStats.health = Math.max(0, newStats.health - disasterEvent.healthPenalty);
      }
      if (disasterEvent.reputationPenalty) {
        newStats.reputation = Math.max(0, newStats.reputation - disasterEvent.reputationPenalty);
      }
    }

    // 计算项目进度（天灾事件可能影响）
    let newProjectProgress = state.projectProgress;
    if (disasterEvent && disasterEvent.progressPenalty) {
      newProjectProgress = Math.max(0, state.projectProgress - disasterEvent.progressPenalty);
    }

    // 一次性更新所有状态
    set({
      stats: newStats,
      actualSalary: salaryRaise > 0 ? state.actualSalary + salaryRaise : state.actualSalary,
      projectProgress: newProjectProgress,
      relationships: newRelationships,
    });

    // 检查游戏结束条件
    get().checkGameEnd();

    // 检查晋升
    const promotionCheck = get().checkPromotion();

    // 生成下季度开始事件（预告，不立即应用）
    const eventCount = Math.floor(Math.random() * 2) + 2; // 2-3个事件
    const nextQuarterStartEvents: typeof QUARTER_START_EVENT_POOL = [];
    const shuffled = [...QUARTER_START_EVENT_POOL].sort(() => Math.random() - 0.5);
    let attempts = 0;
    while (nextQuarterStartEvents.length < eventCount && attempts < shuffled.length * 2) {
      const event = shuffled[attempts % shuffled.length];
      if (!nextQuarterStartEvents.includes(event) && Math.random() < event.probability) {
        nextQuarterStartEvents.push(event);
      }
      attempts++;
    }

    // 计算下季度开始事件的影响（用于预告显示）
    let nextQuarterCashChange = 0;
    let nextQuarterHealthChange = 0;
    let nextQuarterReputationChange = 0;
    let nextQuarterProgressChange = 0;
    let nextQuarterQualityChange = 0;
    let nextQuarterWorkAbilityChange = 0;
    let nextQuarterLuckChange = 0;

    nextQuarterStartEvents.forEach(event => {
      const effects = event.effects as Effects;
      if (effects.cash) nextQuarterCashChange += effects.cash;
      if (effects.health) nextQuarterHealthChange += effects.health;
      if (effects.reputation) nextQuarterReputationChange += effects.reputation;
      if (effects.progress) nextQuarterProgressChange += effects.progress;
      if (effects.quality) nextQuarterQualityChange += effects.quality;
      if (effects.workAbility) nextQuarterWorkAbilityChange += effects.workAbility;
      if (effects.luck) nextQuarterLuckChange += effects.luck;
    });

    // 构建结算数据
    const settlement: QuarterSettlement = {
      quarter: state.currentQuarter,
      income: projectIncome + bonusIncome,
      expenses: {
        salary,
        livingCosts: livingCost,
        storage: storageFee,
        total: totalExpenses,
      },
      relationshipDecay,
      netChange,
      promotionCheck,
      quarterStartEvents: state.currentSettlement?.quarterStartEvents,
    };

    if (bonusEvent) {
      (settlement as any).bonusEvent = bonusEvent;
    }
    if (disasterEvent) {
      (settlement as any).disasterEvent = disasterEvent;
    }
    if (salaryRaise > 0) {
      (settlement as any).salaryRaise = salaryRaise;
      (settlement as any).newSalary = state.actualSalary + salaryRaise;
    }

    // 添加下季度开始事件预告
    (settlement as any).nextQuarterStartEvents = nextQuarterStartEvents.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      effects: e.effects,
      isPositive: e.isPositive,
    }));
    // 添加下季度开始事件的总影响
    (settlement as any).nextQuarterTotalEffects = {
      cash: nextQuarterCashChange,
      health: nextQuarterHealthChange,
      reputation: nextQuarterReputationChange,
      progress: nextQuarterProgressChange,
      quality: nextQuarterQualityChange,
      workAbility: nextQuarterWorkAbilityChange,
      luck: nextQuarterLuckChange,
    };

    // 检查游戏是否已经结束（在设置SETTLEMENT之前）
    const currentState = get();
    if (currentState.status === GameStatus.FAILED || currentState.status === GameStatus.COMPLETED) {
      // 游戏已结束，不进入结算阶段
      return;
    }

    set({
      currentSettlement: settlement,
      status: GameStatus.SETTLEMENT,
      maintenanceCount: 0,
      materialTradeCount: 0,
      maintainedRelationships: new Set<RelationshipType>(),
      actionsThisQuarter: 0,
    });
  },

  nextQuarter: () => {
    // 初始化本季度事件（必须在状态更新前调用）
    get().initializeQuarterEvents();

    // 使用 set 的函数形式，确保读取到最新的状态（包括 finishQuarter 刚更新的现金）
    set((prev) => {
      const newQuarter = prev.currentQuarter + 1;

      // 使用预先生成的真实价格作为新价格（如果存在）
      let newPrices: Record<MaterialType, MaterialPrice>;
      if (prev.nextQuarterRealPrices) {
        // 使用预先生成的真实价格
        newPrices = {} as any;
        Object.values(MaterialType).forEach(type => {
          const realPrice = prev.nextQuarterRealPrices![type];
          const oldPrice = prev.materialPrices[type].currentPrice;
          const priceChange = ((realPrice - oldPrice) / oldPrice) * 100;
          newPrices[type] = {
            type,
            currentPrice: realPrice,
            priceChange: Math.round(priceChange * 10) / 10,
            trend: priceChange > 2 ? 'up' : priceChange < -2 ? 'down' : 'stable',
          };
        });
      } else {
        // 兜底：如果没有预生成的价格（不应该发生），使用随机生成
        newPrices = generateNextQuarterPrices(
          prev.materialPrices,
          prev.stats.workAbility,
          prev.stats.luck
        );
      }

      // 生成下下季度的真实价格（用于下次预测）
      const nextNextQuarterPrices = generateNextQuarterPrices(
        newPrices,
        prev.stats.workAbility,
        prev.stats.luck
      );
      const nextNextQuarterRealPrices: Record<MaterialType, number> = {} as any;
      Object.values(MaterialType).forEach(type => {
        nextNextQuarterRealPrices[type] = nextNextQuarterPrices[type].currentPrice;
      });

      // 更新价格历史记录
      const newHistory: Record<MaterialType, number[]> = {} as any;
      Object.values(MaterialType).forEach(type => {
        const history = [...prev.materialPriceHistory[type]];
        history.push(newPrices[type].currentPrice);
        // 最多保留 50 个数据点（支持50个季度的历史）
        if (history.length > 50) {
          history.shift();
        }
        newHistory[type] = history;
      });

      // 季度开始：自动恢复健康
      let newHealth = Math.min(100, prev.stats.health + QUARTER_HEALTH_REGEN);
      let newCash = prev.stats.cash; // ← 使用 prev.stats.cash 确保获取最新值
      let newReputation = prev.stats.reputation;
      let newWorkAbility = prev.stats.workAbility;
      let newLuck = prev.stats.luck;

      // 从 settlement 中读取已生成的季度开始事件（在结算页面已展示）
      const nextQuarterEvents = (prev.currentSettlement as any)?.nextQuarterStartEvents || [];

      // 应用事件效果（包括 workAbility 和 luck）
      // 注意：progress 和 quality 效果应用到项目状态，不是人物属性
      let progressEffect = 0;
      let qualityEffect = 0;
      let quarterEventCashChange = 0;

      nextQuarterEvents.forEach((event: any) => {
        const effects = event.effects as Effects;
        if (effects.cash) {
          newCash += effects.cash;
          quarterEventCashChange += effects.cash;
        }
        if (effects.health) newHealth = Math.max(0, Math.min(100, newHealth + effects.health));
        if (effects.reputation) newReputation = Math.max(0, Math.min(100, newReputation + effects.reputation));
        if (effects.progress) progressEffect += effects.progress;
        if (effects.quality) qualityEffect += effects.quality;
        if (effects.workAbility) newWorkAbility = Math.max(0, Math.min(100, newWorkAbility + effects.workAbility));
        if (effects.luck) newLuck = Math.max(0, Math.min(100, newLuck + effects.luck));
      });

      console.log('=== nextQuarter 季度开始事件 ===');
      console.log('进入时现金:', prev.stats.cash);
      console.log('季度事件现金变化:', quarterEventCashChange);
      console.log('应用后现金:', newCash);

      // 计算新的行动点
      const newActionPoints = calculateActionPoints(newHealth);

      // 检查是否进入后期阶段
      const newPhase = PHASE_CONFIG.lateGameRanks.includes(prev.rank)
        ? GamePhase.LATE
        : GamePhase.EARLY;

      // 季度开始事件记录（用于下一次结算页面显示）
      const quarterStartEventsRecord = nextQuarterEvents;

      // 保存本季度行动记录到历史（用于传记生成）
      const actionRecords = Object.entries(prev.currentQuarterActionCounts)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => ({ type, count }));
      const trainingRecords = Object.entries(prev.currentQuarterTrainingCounts)
        .filter(([_, count]) => count > 0)
        .map(([type, count]) => ({ type, count }));

      const newQuarterlyAction = {
        quarter: prev.currentQuarter,
        actions: actionRecords,
        training: trainingRecords,
      };

      const newQuarterlyActions = [...prev.quarterlyActions, newQuarterlyAction];

      // 如果本季度完成了项目，季度开始事件的项目效果应该忽略
      // 因为项目已经重置为新的空项目，不应该再受上季度事件影响
      const shouldApplyProjectEffects = !prev.projectCompletedThisQuarter;

      return {
        status: GameStatus.PLAYING,
        currentQuarter: newQuarter,
        stats: {
          ...prev.stats,
          health: newHealth,
          cash: newCash,
          reputation: newReputation,
          workAbility: newWorkAbility,
          luck: newLuck,
        },
        // 应用项目状态效果（项目刚完成时忽略季度开始事件的项目效果）
        projectProgress: shouldApplyProjectEffects ? clampStat(prev.projectProgress + progressEffect) : 0,
        projectQuality: shouldApplyProjectEffects ? clampStat(prev.projectQuality + qualityEffect) : 50,
        materialPrices: newPrices,
        materialPriceHistory: newHistory,
        actionPoints: newActionPoints,
        maxActionPoints: newActionPoints,
        phase: newPhase,
        currentSettlement: {
          ...prev.currentSettlement,
          quarterStartEvents: quarterStartEventsRecord,
        } as QuarterSettlement,
        currentEvent: null,
        gameStats: {
          ...prev.gameStats,
          totalQuarters: prev.gameStats.totalQuarters + 1,
        },
        actionsThisQuarter: 0,
        actionsSinceLastEventCheck: 0,
        // 重置特殊效果（季度开始时失效）
        pricePredictionBonus: 0,
        storageFeeDiscount: 0,
        // 重置项目完成标志
        projectCompletedThisQuarter: false,
        // 价格预测系统：存储下季度真实价格，清空预测缓存
        nextQuarterRealPrices: nextNextQuarterRealPrices,
        pricePredictions: null,
        // 季度行动记录：保存历史并重置当前季度
        quarterlyActions: newQuarterlyActions,
        currentQuarterActionCounts: {},
        currentQuarterTrainingCounts: {},
      };
    });
  },

  // ==================== 团队系统 ====================

  recruitMember: (memberType: TeamMemberType) => {
    const state = get();
    const config = RECRUIT_CONFIG[memberType];

    // 检查现金
    if (state.stats.cash < config.recruitCost) {
      return {
        success: false,
        message: '现金不足',
      };
    }

    // 检查团队人数上限
    const maxTeamSize = LEADERSHIP_EFFECTS.baseTeamSize +
      Math.floor(state.team.leadership / 10) * LEADERSHIP_EFFECTS.extraMembersPer10Leadership;
    if (state.team.members.length >= maxTeamSize) {
      return {
        success: false,
        message: `团队已满（当前${state.team.members.length}/${maxTeamSize}人），需要提升领导力`,
      };
    }

    // 生成随机技能
    const skill = Math.floor(Math.random() * (config.skillRange[1] - config.skillRange[0] + 1)) + config.skillRange[0];

    // 创建新成员
    const newMember: TeamMember = {
      id: `member_${Date.now()}`,
      type: memberType,
      name: `${config.name}${state.team.members.length + 1}`,
      skill,
      salary: config.baseSalary,
      morale: 80,
      efficiency: 100,
    };

    set({
      stats: {
        ...state.stats,
        cash: state.stats.cash - config.recruitCost,
      },
      team: {
        ...state.team,
        members: [...state.team.members, newMember],
      },
    });

    get().updateTeamEfficiency();

    return {
      success: true,
      message: `成功招募 ${newMember.name}（技能等级 ${skill}）`,
      member: newMember,
    };
  },

  resolveTeamIssue: (issueId: string) => {
    const state = get();
    const issue = state.team.pendingIssues.find(i => i.id === issueId);

    if (!issue) {
      return {
        success: false,
        message: '问题不存在',
      };
    }

    // 检查领导力
    if (state.team.leadership < issue.requiredLeadership) {
      return {
        success: false,
        message: `领导力不足（需要 ${issue.requiredLeadership}，当前 ${state.team.leadership}）`,
      };
    }

    // 应用奖励
    const newTeam = { ...state.team };
    newTeam.pendingIssues = newTeam.pendingIssues.filter(i => i.id !== issueId);
    newTeam.leadership = Math.min(100, newTeam.leadership + (issue.resolveReward.leadership || 0));

    // 更新成员士气
    if (issue.resolveReward.morale && issue.affectedMember) {
      newTeam.members = newTeam.members.map(m => {
        if (m.id === issue.affectedMember && issue.resolveReward.morale) {
          return {
            ...m,
            morale: Math.min(100, m.morale + issue.resolveReward.morale),
          };
        }
        return m;
      });
    }

    set({ team: newTeam });
    get().updateTeamEfficiency();

    return {
      success: true,
      message: '成功解决团队问题',
      rewards: issue.resolveReward,
    };
  },

  updateTeamEfficiency: () => {
    const state = get();

    // 基础效率
    let efficiency = 100;

    // 领导力加成
    efficiency += state.team.leadership * LEADERSHIP_EFFECTS.efficiencyPerPoint * 100;

    // 成员士气加成
    const avgMorale = state.team.members.length > 0
      ? state.team.members.reduce((sum, m) => sum + m.morale, 0) / state.team.members.length
      : 80;
    efficiency += (avgMorale - 80) * 0.2;

    set({
      team: {
        ...state.team,
        teamEfficiency: Math.round(efficiency),
      },
    });
  },

  generateTeamIssue: () => {
    const state = get();

    // 检查团队是否有成员
    if (state.team.members.length === 0) {
      return;
    }

    // 检查是否已有待处理问题
    if (state.team.pendingIssues.length >= 3) {
      return;
    }

    // 随机选择问题类型
    const template = TEAM_ISSUE_TEMPLATES[Math.floor(Math.random() * TEAM_ISSUE_TEMPLATES.length)];
    const severityIndex = Math.floor(Math.random() * 3); // 0=low, 1=medium, 2=high

    const newIssue: TeamIssue = {
      id: `issue_${Date.now()}`,
      type: template.type,
      description: template.descriptions[Math.floor(Math.random() * template.descriptions.length)],
      severity: severityIndex === 0 ? 'low' : severityIndex === 1 ? 'medium' : 'high',
      requiredLeadership: template.requiredLeadership[severityIndex],
      resolveReward: {
        leadership: LEADERSHIP_GAIN.resolveIssue,
      },
    };

    // 随机选择受影响的成员
    if (state.team.members.length > 0 && Math.random() > 0.3) {
      const affectedMember = state.team.members[Math.floor(Math.random() * state.team.members.length)];
      newIssue.affectedMember = affectedMember.id;
    }

    set({
      team: {
        ...state.team,
        pendingIssues: [...state.team.pendingIssues, newIssue],
      },
    });
  },

  // ==================== 事件系统 ====================

  drawEvent: async () => {
    const state = get();

    if (state.status !== GameStatus.PLAYING) {
      return;
    }

    const quarter = state.currentQuarter;
    const stats = state.stats;

    // 检查是否触发特殊事件
    if (get().shouldTriggerSpecialEvent(quarter, stats)) {
      const specialEvent = await get().generateLLMSpecialEvent();
      if (specialEvent) {
        set((prev) => ({
          ...prev,
          specialEventCount: prev.specialEventCount + 1,
          currentEvent: specialEvent,
          gameStats: {
            ...prev.gameStats,
            totalEvents: prev.gameStats.totalEvents + 1,
          },
        }));
        return;
      }
    }

    // 抽取常规事件
    let eventPool: EventCard[];
    if (quarter <= 5) {
      eventPool = EVENTS.slice(0, 10);
    } else if (quarter <= 15) {
      eventPool = EVENTS.slice(10, 43); // 中期事件（包含涨薪事件）
    } else {
      eventPool = EVENTS.slice(43, 63); // 后期事件
    }

    let event = getRandomEvent(eventPool, recentEventIds);

    recentEventIds.add(event.id);
    if (recentEventIds.size > RECENT_EVENT_LIMIT) {
      const firstId = Array.from(recentEventIds)[0];
      recentEventIds.delete(firstId);
    }

    // LLM 增强描述（使用配置的概率）
    if (Math.random() < LLM_CONFIG.enhanceDescriptionProbability) {
      event = await get().enhanceEventDescription(event);
    }

    set({
      currentEvent: event,
      gameStats: {
        ...state.gameStats,
        totalEvents: state.gameStats.totalEvents + 1,
      },
    });
  },

  checkEventTrigger: async () => {
    const state = get();

    // 增加计数器
    const newCount = state.actionsSinceLastEventCheck + 1;
    set({ actionsSinceLastEventCheck: newCount });

    // 检查是否需要触发检测
    if (newCount >= EVENT_TRIGGER_CONFIG.actionsPerTrigger) {
      set({ actionsSinceLastEventCheck: 0 });

      // 概率检测
      if (Math.random() < EVENT_TRIGGER_CONFIG.triggerProbability) {
        await get().drawEvent();
      }
    }
  },

  deferEvent: (eventId: string) => {
    const state = get();

    // 检查是否是当前事件
    if (state.currentEvent && state.currentEvent.id === eventId) {
      // 将当前事件添加到待处理事件列表
      const eventWithDeadline = {
        ...state.currentEvent,
        status: EventStatus.PENDING as const,
        deadline: state.actionsThisQuarter + EVENT_TRIGGER_CONFIG.deferTurns,
      };
      set({
        currentEvent: null,
        pendingEvents: [...state.pendingEvents, eventWithDeadline],
      });
      return;
    }

    // 检查是否已在待处理列表中
    const event = state.pendingEvents.find(e => e.id === eventId);
    if (event) {
      // 更新截止时间
      set({
        pendingEvents: state.pendingEvents.map(e =>
          e.id === eventId
            ? { ...e, deadline: state.actionsThisQuarter + EVENT_TRIGGER_CONFIG.deferTurns }
            : e
        ),
      });
    }
  },

  ignoreEvent: (eventId: string) => {
    const state = get();
    const event = state.pendingEvents.find(e => e.id === eventId);

    if (!event) {
      return;
    }

    // 应用惩罚
    const newStats = { ...state.stats };
    newStats.reputation = Math.max(0, newStats.reputation - EVENT_IGNORE_CONSEQUENCES.reputationPenalty);

    // 移除事件
    set({
      stats: newStats,
      pendingEvents: state.pendingEvents.filter(e => e.id !== eventId),
    });

    // 检查游戏结束条件
    get().checkGameEnd();
  },

  // ==================== 辅助函数 ====================

  /**
   * 判断事件是否为重要决策（用于传记生成）
   * 自动判断规则：
   * 1. 特殊事件总是重要（isSpecial、isUrgent、llmEnhanced）
   * 2. 有明显权衡（属性变化幅度超过 10）
   * 3. 选项数量多（3 个以上说明有选择）
   */
  isImportantDecision: (event: EventCard, selectedOption: EventOption): boolean => {
    // 特殊事件总是重要
    if (event.isSpecialEvent || event.isUrgent || event.llmEnhanced) {
      return true;
    }

    // 检查属性变化幅度（单一属性变化超过 10）
    const effect = selectedOption.effects;
    if (effect) {
      const maxChange = Math.max(
        Math.abs(effect.cash || 0),
        Math.abs(effect.health || 0),
        Math.abs(effect.reputation || 0),
        Math.abs(effect.workAbility || 0),
        Math.abs(effect.luck || 0)
      );
      if (maxChange >= 10) {
        return true;
      }
    }

    // 检查选项数量（3 个以上说明有权衡）
    if (event.options.length >= 3) {
      return true;
    }

    return false;
  },

  // ==================== 事件处理方法 ====================

  selectOption: (optionId: string) => {
    const state = get();

    if (!state.currentEvent || state.status !== GameStatus.PLAYING) {
      return;
    }

    const option = state.currentEvent.options?.find((opt) => opt.id === optionId);

    if (!option) {
      console.error('Option not found:', optionId);
      return;
    }

    // 处理特殊动作（涨薪）
    if (option.action === 'raiseSalary') {
      const raiseResult = get().raiseSalary();
      if (raiseResult.success) {
        // 涨薪成功，使用覆盖反馈
        const eventWithFeedback = {
          ...state.currentEvent,
          options: state.currentEvent.options.map(opt =>
            opt.id === optionId
              ? { ...opt, feedback: option.actionFeedbackOverride || raiseResult.message }
              : opt
          ),
        };
        const eventHistory = [...state.eventHistory, eventWithFeedback];
        set({ eventHistory, currentEvent: null });

        get().checkGameEnd();
        // 新系统不自动抽取事件，等待玩家行动
        return;
      }
      // 涨薪失败（如实习生），继续应用正常效果
    }

    // 应用效果
    if (option.effects) {
      get().applyEffects(option.effects);
    }

    // 记录关键决策（用于传记生成）
    // 自动判断是否为重要决策
    const isImportant = state.currentEvent.isImportant ||
                       state.currentEvent.isSpecialEvent ||
                       state.currentEvent.llmEnhanced ||
                       get().isImportantDecision(state.currentEvent, option);

    if (isImportant) {
      const newDecision = {
        event: state.currentEvent.title,
        choice: option.text,
        quarter: state.currentQuarter,
        timestamp: new Date(),
      };
      set({ keyDecisions: [...state.keyDecisions, newDecision] });
      console.log('📝 记录关键决策:', newDecision);
    }

    // 添加到历史
    const eventHistory = [...state.eventHistory, state.currentEvent];

    set({
      eventHistory,
      currentEvent: null,
    });

    // 检查失败条件
    get().checkGameEnd();
  },

  enterStrategyPhase: () => {
    set({
      status: GameStatus.STRATEGY_PHASE,
      currentEvent: null, // 清空当前事件
    });
  },

  returnToEventPhase: () => {
    set({
      status: GameStatus.PLAYING,
    });
    // 不自动抽取事件，等待玩家行动
  },

  executePromotion: (newRank: Rank) => {
    const state = get();
    const newRankConfig = RANK_CONFIGS[newRank];
    const newSalary = Math.max(state.actualSalary, newRankConfig.minQuarterlySalary);

    set({
      rank: newRank,
      actualSalary: newSalary,
      phase: PHASE_CONFIG.lateGameRanks.includes(newRank) ? GamePhase.LATE : GamePhase.EARLY,
    });

    get().checkGameEnd();
  },

  buyMaterial: (materialType: MaterialType, amount: number): TradeResult => {
    const state = get();
    const material = state.materialPrices[materialType];
    const config = MATERIAL_CONFIGS[materialType];

    if (!material || !config) {
      return {
        success: false,
        cashChange: 0,
        inventoryChange: 0,
        message: '材料不存在',
      };
    }

    // 检查交易次数
    if (state.materialTradeCount >= MAX_MATERIAL_TRADES_PER_QUARTER) {
      return {
        success: false,
        cashChange: 0,
        inventoryChange: 0,
        message: `本季度交易次数已达上限（${MAX_MATERIAL_TRADES_PER_QUARTER}次）`,
      };
    }

    const cost = material.currentPrice * amount;

    if (state.stats.cash < cost) {
      return {
        success: false,
        cashChange: 0,
        inventoryChange: 0,
        message: '现金不足',
      };
    }

    const newStats = { ...state.stats };
    newStats.cash = Math.max(0, state.stats.cash - cost);

    const newInventory = { ...state.inventory };
    newInventory[materialType] = state.inventory[materialType] + amount;

    set({
      stats: newStats,
      inventory: newInventory,
      materialTradeCount: state.materialTradeCount + 1,
    });

    // 检查游戏结束条件
    get().checkGameEnd();

    return {
      success: true,
      cashChange: -cost,
      inventoryChange: amount,
      message: `成功买入 ${amount}${config.unit} ${config.name}`,
    };
  },

  sellMaterial: (materialType: MaterialType, amount: number): TradeResult => {
    const state = get();
    const material = state.materialPrices[materialType];
    const config = MATERIAL_CONFIGS[materialType];

    if (!material || !config) {
      return {
        success: false,
        cashChange: 0,
        inventoryChange: 0,
        message: '材料不存在',
      };
    }

    // 检查交易次数
    if (state.materialTradeCount >= MAX_MATERIAL_TRADES_PER_QUARTER) {
      return {
        success: false,
        cashChange: 0,
        inventoryChange: 0,
        message: `本季度交易次数已达上限（${MAX_MATERIAL_TRADES_PER_QUARTER}次）`,
      };
    }

    const currentInventory = state.inventory[materialType];

    if (currentInventory < amount) {
      return {
        success: false,
        cashChange: 0,
        inventoryChange: 0,
        message: '库存不足',
      };
    }

    const revenue = material.currentPrice * amount;

    const newStats = { ...state.stats };
    newStats.cash = state.stats.cash + revenue;

    const newInventory = { ...state.inventory };
    newInventory[materialType] = currentInventory - amount;

    set({
      stats: newStats,
      inventory: newInventory,
      materialTradeCount: state.materialTradeCount + 1,
    });

    // 检查游戏结束条件
    get().checkGameEnd();

    return {
      success: true,
      cashChange: revenue,
      inventoryChange: -amount,
      message: `成功卖出 ${amount}${config.unit} ${config.name}`,
    };
  },

  updateMaterialPrices: () => {
    const state = get();
    const newPrices: Record<MaterialType, MaterialPrice> = {} as any;
    const newHistory: Record<MaterialType, number[]> = JSON.parse(JSON.stringify(state.materialPriceHistory));

    Object.values(MaterialType).forEach((type) => {
      const config = MATERIAL_CONFIGS[type];
      const oldPrice = state.materialPrices[type]?.currentPrice || config.basePrice;
      const variance = (Math.random() - 0.5) * 2 * config.priceVolatility;
      const newPrice = Math.round(oldPrice * (1 + variance));

      newPrices[type] = {
        type,
        currentPrice: newPrice,
        priceChange: Math.round(variance * 100),
        trend: variance > 0.05 ? 'up' : variance < -0.05 ? 'down' : 'stable',
      };

      // 记录历史价格（最多保留 20 个数据点）
      newHistory[type].push(newPrice);
      if (newHistory[type].length > 20) {
        newHistory[type].shift();
      }
    });

    set({ materialPrices: newPrices, materialPriceHistory: newHistory });
  },

  maintainRelationship: (
    relationshipType: RelationshipType,
    method: 'dinner' | 'gift' | 'favor' | 'solidarity'
  ): MaintenanceResult => {
    const state = get();

    // 检查维护次数
    const maxCount = getMaxMaintenanceCount(state.rank);
    if (state.maintenanceCount >= maxCount) {
      return {
        success: false,
        relationshipChange: 0,
        cashChange: 0,
        healthChange: 0,
        message: `本季度维护次数已达上限（${maxCount}次）`,
      };
    }

    const option = MAINTENANCE_OPTIONS[method];
    const cost = option.cost;
    let relationshipGain = option.relationshipGain;
    const healthCost = 'healthCost' in option ? (option.healthCost || 0) : 0;

    // 属性影响：工作能力加成（专业性关系）
    let hasWorkAbilityBonus = false;
    if ((relationshipType === RelationshipType.DESIGN || relationshipType === RelationshipType.SUPERVISION) &&
        state.stats.workAbility >= 60) {
      const originalGain = relationshipGain;
      relationshipGain = Math.round(relationshipGain * 1.2); // +20%
      hasWorkAbilityBonus = relationshipGain > originalGain;
    }

    // 属性影响：幸运加成（贵人相助）
    const luck = state.stats.luck;
    const hasMentor = luck >= 60 && Math.random() * 100 < 15;

    if (hasMentor) {
      // 贵人相助：效果翻倍或免费维护
      if (Math.random() < 0.5) {
        // 免费维护
        set((state) => ({
          ...state,
          relationships: {
            ...state.relationships,
            [relationshipType]: Math.min(100, state.relationships[relationshipType] + 10)
          },
          maintenanceCount: state.maintenanceCount + 1,
          maintainedRelationships: new Set([...state.maintainedRelationships, relationshipType]),
        }));

        return {
          success: true,
          relationshipChange: 10,
          cashChange: 0,
          healthChange: 0,
          message: `✨ 贵人相助：幸运让你遇到了贵人，${RELATIONSHIP_DISPLAY[relationshipType].label}关系+10！`,
        };
      } else {
        // 效果翻倍
        const finalGain = relationshipGain * 2;
        const newRelationships = { ...state.relationships };
        newRelationships[relationshipType] = Math.min(100, state.relationships[relationshipType] + finalGain);

        const newStats = { ...state.stats };
        newStats.cash = Math.max(0, state.stats.cash - cost);
        newStats.health = Math.max(0, state.stats.health - healthCost);

        set({
          stats: newStats,
          relationships: newRelationships,
          maintenanceCount: state.maintenanceCount + 1,
          maintainedRelationships: new Set([...state.maintainedRelationships, relationshipType]),
        });

        // 检查游戏结束条件
        get().checkGameEnd();

        return {
          success: true,
          relationshipChange: finalGain,
          cashChange: -cost,
          healthChange: healthCost || undefined,
          message: `✨ 贵人相助：关系提升双倍！+${finalGain}${hasWorkAbilityBonus ? ' (🔧工作能力+20%)' : ''}`,
        };
      }
    }

    if (state.stats.cash < cost) {
      return {
        success: false,
        relationshipChange: 0,
        cashChange: 0,
        healthChange: 0,
        message: '现金不足',
      };
    }

    const newStats = { ...state.stats };
    newStats.cash = Math.max(0, state.stats.cash - cost);
    newStats.health = Math.max(0, state.stats.health - healthCost);

    const newRelationships = { ...state.relationships };
    newRelationships[relationshipType] = Math.min(100, state.relationships[relationshipType] + relationshipGain);

    // 记录已维护的关系
    const newMaintained = new Set(state.maintainedRelationships);
    newMaintained.add(relationshipType);

    set({
      stats: newStats,
      relationships: newRelationships,
      maintenanceCount: state.maintenanceCount + 1,
      maintainedRelationships: newMaintained,
    });

    // 检查游戏结束条件
    get().checkGameEnd();

    return {
      success: true,
      relationshipChange: relationshipGain,
      cashChange: -cost,
      healthChange: healthCost || undefined,
      message: `${RELATIONSHIP_DISPLAY[relationshipType].label}关系+${relationshipGain}${hasWorkAbilityBonus ? ' (🔧工作能力+20%)' : ''}`,
    };
  },

  getMaxMaintenanceCount: () => {
    const state = get();
    return getMaxMaintenanceCount(state.rank);
  },

  getMaxMaterialTradeCount: () => {
    return MAX_MATERIAL_TRADES_PER_QUARTER;
  },

  getMaxBuyableAmount: (materialType: MaterialType): number => {
    const state = get();
    const material = state.materialPrices[materialType];
    const config = MATERIAL_CONFIGS[materialType];

    if (!material || !config) {
      return 0;
    }

    // 计算基于现金的最大可购买量
    const maxByCash = Math.floor(state.stats.cash / material.currentPrice);

    // 限制在材料的最大交易量范围内
    return Math.min(maxByCash, config.maxTrade);
  },

  isRelationshipUnlocked: (relationshipType: RelationshipType): boolean => {
    const state = get();
    return isRelationshipUnlocked(state.rank, relationshipType);
  },

  applyEffects: (effects: Effects) => {
    const currentStats = get().stats;

    const newStats: PlayerStats = {
      cash: Math.max(0, currentStats.cash + (effects.cash || 0)),
      health: clampStat(currentStats.health + (effects.health || 0)),
      reputation: clampStat(currentStats.reputation + (effects.reputation || 0)),
      workAbility: clampStat(currentStats.workAbility + (effects.workAbility || 0)),
      luck: clampStat(currentStats.luck + (effects.luck || 0)),
    };

    set({
      stats: newStats,
      projectProgress: clampStat(get().projectProgress + (effects.progress || 0)),
      projectQuality: clampStat(get().projectQuality + (effects.quality || 0)),
    });
  },

  checkGameEnd: () => {
    const state = get();
    const { stats } = state;

    // 检查现金（破产）
    if (stats.cash <= LOSE_CONDITIONS.cash) {
      const score = get().calculateNetAssets();
      set({
        status: GameStatus.FAILED,
        score,
        endReason: EndReason.BANKRUPT,
      });
      return;
    }

    // 检查健康（过劳）
    if (stats.health <= LOSE_CONDITIONS.health) {
      const score = get().calculateNetAssets();
      set({
        status: GameStatus.FAILED,
        score,
        endReason: EndReason.HEALTH_DEPLETED,
      });
      return;
    }

    // 检查声誉（封杀）
    if (stats.reputation <= LOSE_CONDITIONS.reputation) {
      const score = get().calculateNetAssets();
      set({
        status: GameStatus.FAILED,
        score,
        endReason: EndReason.REPUTATION_DEPLETED,
      });
      return;
    }

    // 检查是否晋升到合伙人
    if (state.rank === Rank.PARTNER) {
      const score = get().calculateNetAssets();
      set({
        status: GameStatus.COMPLETED,
        score,
        endReason: EndReason.PROMOTED_TO_PARTNER,
      });
    }
  },

  checkProjectCompletion: (): boolean => {
    const state = get();
    const { projectProgress, projectQuality } = state;

    if (projectProgress >= PROJECT_COMPLETION.minProgress &&
        projectQuality >= PROJECT_COMPLETION.minQuality) {
      const isQualityProject = projectQuality >= PROJECT_COMPLETION.qualityThreshold;

      set({
        gameStats: {
          ...state.gameStats,
          completedProjects: state.gameStats.completedProjects + 1,
          qualityProjects: isQualityProject
            ? state.gameStats.qualityProjects + 1
            : state.gameStats.qualityProjects,
        },
        projectProgress: 0,
        projectQuality: 50,  // 重置为新项目的初始质量
        projectCompletedThisQuarter: true, // 标记本季度完成了项目
        qualityProjectJustCompleted: isQualityProject, // 设置优质项目完成通知标志
      });

      return true;
    }

    return false;
  },

  checkPromotion: () => {
    const state = get();
    const currentRank = state.rank;
    const netAssets = get().calculateNetAssets();
    const { gameStats, stats, team, relationships } = state;

    if (currentRank === Rank.PARTNER) {
      return { canPromote: false };
    }

    const rankValues = Object.values(Rank);
    const currentIndex = rankValues.indexOf(currentRank);
    const nextRank = rankValues[currentIndex + 1];

    if (!nextRank) {
      return { canPromote: false };
    }

    const nextRankConfig = RANK_CONFIGS[nextRank];
    const missing: string[] = [];

    // 检查净资产
    if (netAssets < nextRankConfig.assetsRequired) {
      missing.push(`净资产需达到 ${(nextRankConfig.assetsRequired / 10000).toFixed(0)}万`);
    }

    // 检查完成项目数
    if (gameStats.completedProjects < nextRankConfig.projectsRequired) {
      missing.push(`完成项目数需达到 ${nextRankConfig.projectsRequired}个`);
    }

    // 检查声誉
    if (stats.reputation < nextRankConfig.reputationRequired) {
      missing.push(`声誉需达到 ${nextRankConfig.reputationRequired}`);
    }

    // 检查特殊要求（优质项目、完成项目数）
    if (nextRankConfig.specialRequirement) {
      if (nextRankConfig.rank === Rank.SENIOR_ENGINEER || nextRankConfig.rank === Rank.PROJECT_DIRECTOR) {
        if (gameStats.qualityProjects < (nextRankConfig.rank === Rank.SENIOR_ENGINEER ? 1 : 5)) {
          missing.push(nextRankConfig.specialRequirement);
        }
      } else if (nextRankConfig.rank === Rank.PROJECT_MANAGER) {
        // 项目经理要求完成过3个项目（不是优质项目，是普通项目）
        if (gameStats.completedProjects < 3) {
          missing.push(nextRankConfig.specialRequirement);
        }
      } else if (nextRankConfig.rank === Rank.PARTNER) {
        // 检查领导力要求
        if (team.leadership < LEADERSHIP_EFFECTS.partnerRequirement) {
          missing.push(`领导力需达到 ${LEADERSHIP_EFFECTS.partnerRequirement}`);
        }
        if (gameStats.qualityProjects < 10) {
          missing.push(nextRankConfig.specialRequirement);
        }
      }
    }

    // 检查关系要求
    if (nextRankConfig.relationshipRequirements) {
      const { requirements, requirementType } = nextRankConfig.relationshipRequirements;
      const unsatisfiedRelationships: string[] = [];

      // 关系类型中文映射
      const relationshipLabels: Record<RelationshipType, string> = {
        [RelationshipType.CLIENT]: '甲方',
        [RelationshipType.SUPERVISION]: '监理',
        [RelationshipType.DESIGN]: '设计院',
        [RelationshipType.LABOR]: '劳务队',
        [RelationshipType.GOVERNMENT]: '政府部门',
      };

      // 检查每个关系要求
      for (const req of requirements) {
        const currentValue = relationships[req.type];
        if (currentValue < req.requiredValue) {
          unsatisfiedRelationships.push(
            `${relationshipLabels[req.type]}需达到 ${req.requiredValue}（当前 ${currentValue}）`
          );
        }
      }

      // 根据要求类型决定是否阻止晋升
      if (requirementType === 'all') {
        // 需要满足所有要求
        if (unsatisfiedRelationships.length > 0) {
          if (unsatisfiedRelationships.length === 1) {
            missing.push(`虽然你的业绩很优秀，但${unsatisfiedRelationships[0]}才能晋升。`);
          } else {
            missing.push(`虽然你的业绩很优秀，但以下关系需要加强才能晋升：${unsatisfiedRelationships.join('、')}`);
          }
        }
      } else if (requirementType === 'any') {
        // 满足任一要求即可
        const allUnsatisfied = unsatisfiedRelationships.length === requirements.length;
        if (allUnsatisfied) {
          missing.push(`至少需要满足以下关系之一：${unsatisfiedRelationships.join('、')}`);
        }
      }
    }

    const canPromote = missing.length === 0;

    return {
      canPromote,
      nextRank: canPromote ? nextRank : undefined,
      missingRequirements: canPromote ? undefined : missing,
    } as { canPromote: boolean; nextRank?: Rank; missingRequirements?: string[] };
  },

  calculateNetAssets: (): number => {
    const state = get();
    let assets = state.stats.cash;

    Object.values(MaterialType).forEach((type) => {
      const amount = state.inventory[type];
      const price = state.materialPrices[type]?.currentPrice || MATERIAL_CONFIGS[type].basePrice;
      assets += amount * price;
    });

    return Math.round(assets);
  },

  calculateStorageFee: (): number => {
    const state = get();
    let totalFee = 0;

    Object.values(MaterialType).forEach((type) => {
      const amount = state.inventory[type];
      const fee = MATERIAL_CONFIGS[type].storageFee;
      totalFee += amount * fee;
    });

    // 应用仓储费折扣（政策解读效果）
    const discount = state.storageFeeDiscount;
    const discountedFee = totalFee * (1 - discount / 100);

    return Math.round(discountedFee);
  },

  calculateQuarterlySalary: (): number => {
    const state = get();
    return state.actualSalary;
  },

  raiseSalary: (): { success: boolean; newSalary?: number; message: string } => {
    const state = get();
    const rankConfig = RANK_CONFIGS[state.rank];

    if (state.rank === Rank.INTERN || state.rank === Rank.PARTNER) {
      return {
        success: false,
        message: state.rank === Rank.INTERN ? '实习生不能涨薪' : '合伙人是分红制，不涨薪',
      };
    }

    const [minRaise, maxRaise] = rankConfig.raiseRange;
    if (minRaise === 0 && maxRaise === 0) {
      return {
        success: false,
        message: '当前职级不支持涨薪',
      };
    }

    const raisePercent = Math.random() * (maxRaise - minRaise) + minRaise;
    const raiseAmount = Math.round(state.actualSalary * (raisePercent / 100));
    const newSalary = state.actualSalary + raiseAmount;

    set({ actualSalary: newSalary });

    return {
      success: true,
      newSalary,
      message: `恭喜！工资上涨 ${raisePercent.toFixed(1)}%，从 ${state.actualSalary} 涨到 ${newSalary}`,
    };
  },

  dismissQualityProjectNotification: () => {
    set({ qualityProjectJustCompleted: false });
  },

  enhanceEventDescription: async (event: EventCard): Promise<EventCard> => {
    try {
      set({ isLLMEnhancing: true });

      const state = get();
      const result = await enhanceDescription({
        baseEvent: {
          id: event.id,
          title: event.title,
          description: event.description,
        },
        stats: state.stats,
        round: state.currentQuarter,
      });

      if (result && result.description) {
        return {
          ...event,
          description: result.description,
          llmEnhanced: true,
        };
      }

      return event;
    } catch (error) {
      console.warn('LLM enhance failed:', error);
      return event;
    } finally {
      set({ isLLMEnhancing: false });
    }
  },

  generateLLMSpecialEvent: async (): Promise<EventCard | null> => {
    try {
      set({ isLLMEnhancing: true });

      const state = get();
      const result = await generateSpecialEvent({
        stats: state.stats,
        round: state.currentQuarter,
      });

      if (result) {
        return result as EventCard;
      }

      return null;
    } catch (error) {
      console.warn('LLM special event generation failed:', error);
      return null;
    } finally {
      set({ isLLMEnhancing: false });
    }
  },

  shouldTriggerSpecialEvent: (quarter: number, stats: PlayerStats) => {
    const state = get();

    if (state.specialEventCount >= LLM_CONFIG.specialEvent.maxCount) {
      return false;
    }

    if (quarter < LLM_CONFIG.specialEvent.minQuarter) {
      return false;
    }

    // 固定节点触发（第 3、6、9 季度）
    if ([3, 6, 9].includes(quarter)) {
      return Math.random() < 0.6;
    }

    // 危机时刻触发
    if (stats.cash < 20000 || stats.health < 20) {
      return Math.random() < 0.25;
    }

    return false;
  },

  // ==================== 事件决策系统 ====================

  /**
   * 初始化本季度事件
   * 从当前职级可用事件中随机抽取 2-4 个事件
   */
  initializeQuarterEvents: () => {
    const state = get();
    const rank = state.rank;

    // 获取当前职级可用的事件
    const availableEvents = getEventsForRank(rank);

    // 如果没有可用事件，跳过
    if (availableEvents.length === 0) {
      console.warn('No events available for rank:', rank);
      return;
    }

    // 随机抽取 2-4 个事件
    const eventCount = Math.floor(Math.random() * 3) + 2;
    const selectedEvents = shuffleQuarterEvents(availableEvents, eventCount);

    set({
      quarterEvents: selectedEvents,
      currentEventIndex: 0,
      completedEventResults: [],
      pendingEventResult: null,
      showEventResult: false,
    });
  },

  /**
   * 选择事件选项
   * 创建事件结果记录并显示结果卡片
   */
  selectEventOption: (optionId: string) => {
    const state = get();
    const currentEvent = state.quarterEvents[state.currentEventIndex];

    if (!currentEvent) {
      console.error('No current event available');
      return;
    }

    const selectedOption = currentEvent.options.find(o => o.id === optionId);
    if (!selectedOption) {
      console.error('Option not found:', optionId);
      return;
    }

    // 检查是否为冒险选项
    if (selectedOption.riskFactor !== undefined) {
      const luck = state.stats.luck;
      const successThreshold = 100 - selectedOption.riskFactor * 100 + luck / 2;
      const roll = Math.random() * 100;

      if (roll > successThreshold) {
        // 失败，使用失败效果
        const failureEffects = selectedOption.effects.failure || {};
        const failureFeedback = selectedOption.failureFeedback || '（失败）';
        const result: EventResult = {
          eventId: currentEvent.id,
          eventTitle: currentEvent.title,
          selectedOptionId: optionId,
          selectedOptionText: selectedOption.text,
          feedback: selectedOption.feedback + failureFeedback,
          effects: failureEffects,
          timestamp: Date.now(),
        };

        set({
          pendingEventResult: result,
          showEventResult: true,
        });
        return;
      }
    }

    // 正常流程
    const result: EventResult = {
      eventId: currentEvent.id,
      eventTitle: currentEvent.title,
      selectedOptionId: optionId,
      selectedOptionText: selectedOption.text,
      feedback: selectedOption.feedback,
      effects: selectedOption.effects,
      timestamp: Date.now(),
    };

    // 暂存结果，显示结果卡片
    set({
      pendingEventResult: result,
      showEventResult: true,
    });
  },

  /**
   * 继续下一个事件
   * 应用当前事件的影响并移动到下一个事件
   */
  continueToNextEvent: () => {
    const state = get();

    if (!state.pendingEventResult) {
      console.error('No pending event result');
      return;
    }

    // 应用当前事件的影响
    get().applyEventEffects(state.pendingEventResult.effects);

    // 添加到已完成列表
    const newCompleted = [...state.completedEventResults, state.pendingEventResult];
    const newIndex = state.currentEventIndex + 1;

    // 检查是否还有更多事件
    if (newIndex < state.quarterEvents.length) {
      // 还有更多事件
      set({
        completedEventResults: newCompleted,
        currentEventIndex: newIndex,
        pendingEventResult: null,
        showEventResult: false,
      });
    } else {
      // 所有事件已完成
      set({
        completedEventResults: newCompleted,
        currentEventIndex: newIndex,
        allEventHistory: [...state.allEventHistory, ...newCompleted],
        eventHistory: [...state.eventHistory, ...newCompleted.map(r => ({
          id: `${r.eventId}-${r.selectedOptionId}`,
          title: r.eventTitle,
          description: r.selectedOptionText,
          options: [],
        }))],
        quarterEvents: [],
        pendingEventResult: null,
        showEventResult: false,
      });
    }
  },

  /**
   * 应用事件效果
   * 将事件选项的效果应用到游戏状态
   */
  applyEventEffects: (effects: any) => {
    if (!effects) {
      return;
    }

    const state = get();
    const newStats = { ...state.stats };

    // 应用各项效果
    if (effects.cash) {
      newStats.cash = Math.max(0, newStats.cash + effects.cash);
    }
    if (effects.health) {
      newStats.health = clampStat(newStats.health + effects.health);
    }
    if (effects.reputation) {
      newStats.reputation = clampStat(newStats.reputation + effects.reputation);
    }
    if (effects.progress) {
      set({ projectProgress: clampStat(state.projectProgress + effects.progress) });
    }
    if (effects.quality) {
      set({ projectQuality: clampStat(state.projectQuality + effects.quality) });
    }

    set({ stats: newStats });

    // 检查游戏结束条件
    get().checkGameEnd();
  },

  /**
   * 检查所有事件是否完成
   */
  isAllEventsCompleted: () => {
    const state = get();
    return state.quarterEvents.length > 0 &&
           state.currentEventIndex >= state.quarterEvents.length;
  },

  /**
   * 获取当前事件
   */
  getCurrentEvent: () => {
    const state = get();
    return state.quarterEvents[state.currentEventIndex] || null;
  },

  /**
   * 获取当前事件结果
   */
  getCurrentEventResult: () => {
    const state = get();
    return state.pendingEventResult;
  },
}));

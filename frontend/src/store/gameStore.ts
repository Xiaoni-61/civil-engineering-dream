/**
 * 游戏状态管理 Store
 * 使用 Zustand 管理游戏核心逻辑
 * 支持职级系统、材料市场、关系维护
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
} from '@shared/types';
import { EVENTS } from '@/data/events';
import {
  GAME_CONFIG,
  LOSE_CONDITIONS,
  PROJECT_COMPLETION,
  LLM_CONFIG,
  BONUS_EVENTS,
  DISASTER_EVENTS,
  LIVING_COSTS,
  MAINTENANCE_OPTIONS,
} from '@/data/constants';
import { startGame as apiStartGame, finishGame as apiFinishGame } from '@/api';
import { enhanceDescription, generateSpecialEvent } from '@/api';

interface GameStore extends GameState {
  // 扩展状态
  runId: string | null;
  deviceId: string | null;

  // LLM 相关状态
  specialEventCount: number;
  isLLMEnhancing: boolean;

  // 当前季度结算数据
  currentSettlement: QuarterSettlement | null;

  // 材料价格历史（用于走势图）
  materialPriceHistory: Record<MaterialType, number[]>;

  // Actions
  startGame: () => Promise<void>;
  drawEvent: () => Promise<void>;
  selectOption: (optionId: string) => void;
  resetGame: () => void;
  uploadScore: () => Promise<void>;

  // 季度流程
  enterStrategyPhase: () => void;
  finishQuarter: () => void;
  nextQuarter: () => void;
  executePromotion: (newRank: Rank) => void;

  // 材料市场操作
  buyMaterial: (materialType: MaterialType, amount: number) => TradeResult;
  sellMaterial: (materialType: MaterialType, amount: number) => TradeResult;
  updateMaterialPrices: () => void;

  // 关系维护操作
  maintainRelationship: (
    relationshipType: RelationshipType,
    method: 'dinner' | 'gift' | 'favor' | 'solidarity'
  ) => MaintenanceResult;
  decayRelationships: () => void;

  // Helper methods
  applyEffects: (effects: Effects) => void;
  checkGameEnd: () => void;
  checkProjectCompletion: () => boolean;
  checkPromotion: () => { canPromote: boolean; nextRank?: Rank; missingRequirements?: string[] };
  calculateNetAssets: () => number;
  calculateStorageFee: () => number;
  calculateQuarterlySalary: () => number;

  // LLM Helper
  shouldTriggerSpecialEvent: (quarter: number, stats: PlayerStats) => boolean;
  enhanceEventDescription: (event: EventCard) => Promise<EventCard>;
  generateLLMSpecialEvent: () => Promise<EventCard | null>;
}

// 初始状态
const createInitialState = (): GameState => ({
  status: GameStatus.IDLE,
  currentRound: 0,
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

  // 项目进度
  projectProgress: 0,
  projectQuality: GAME_CONFIG.initialStats.quality,
  eventsInQuarter: 0,
  maxEventsPerQuarter: GAME_CONFIG.maxEventsPerQuarter,

  score: 0,
});

// 初始化材料价格
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

// 辅助函数：限制数值在 0-100 之间
const clampStat = (value: number): number => {
  return Math.max(0, Math.min(100, value));
};

// 辅助函数：从数组中随机抽取一个元素
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

// 用于跟踪最近使用的事件（避免重复）
const recentEventIds = new Set<string>();
const RECENT_EVENT_LIMIT = 3;

export const useGameStore = create<GameStore>((set, get) => ({
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

  // 开始游戏
  startGame: async () => {
    try {
      const response = await apiStartGame();

      const initialState = createInitialState();
      const initialPrices = initializeMaterialPrices();
      // 初始化价格历史，包含当前价格
      const initialHistory: Record<MaterialType, number[]> = {
        [MaterialType.CEMENT]: [initialPrices[MaterialType.CEMENT].currentPrice],
        [MaterialType.STEEL]: [initialPrices[MaterialType.STEEL].currentPrice],
        [MaterialType.SAND]: [initialPrices[MaterialType.SAND].currentPrice],
        [MaterialType.CONCRETE]: [initialPrices[MaterialType.CONCRETE].currentPrice],
      };

      set({
        ...initialState,
        status: GameStatus.PLAYING,
        currentRound: 1,
        materialPrices: initialPrices,
        materialPriceHistory: initialHistory,
        runId: response.runId,
        specialEventCount: 0,
        isLLMEnhancing: false,
        eventsInQuarter: 0,
      });

      recentEventIds.clear();
      await get().drawEvent();
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

      set({
        ...initialState,
        status: GameStatus.PLAYING,
        currentRound: 1,
        materialPrices: initialPrices,
        materialPriceHistory: initialHistory,
        runId: null,
        specialEventCount: 0,
        isLLMEnhancing: false,
        eventsInQuarter: 0,
      });

      recentEventIds.clear();
      await get().drawEvent();
    }
  },

  // 抽取事件
  drawEvent: async () => {
    const state = get();

    if (state.status !== GameStatus.PLAYING) {
      return;
    }

    const quarter = state.currentRound;
    const stats = state.stats;

    // 检查是否应该进入策略阶段
    if (state.eventsInQuarter >= state.maxEventsPerQuarter) {
      get().enterStrategyPhase();
      return;
    }

    // 检查是否触发特殊事件
    if (get().shouldTriggerSpecialEvent(quarter, stats)) {
      const specialEvent = await get().generateLLMSpecialEvent();
      if (specialEvent) {
        set((prev) => ({
          ...prev,
          specialEventCount: prev.specialEventCount + 1,
          currentEvent: specialEvent,
          eventsInQuarter: prev.eventsInQuarter + 1,
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
      eventPool = EVENTS.slice(10, 40);
    } else {
      eventPool = EVENTS.slice(40, 60);
    }

    let event = getRandomEvent(eventPool, recentEventIds);

    recentEventIds.add(event.id);
    if (recentEventIds.size > RECENT_EVENT_LIMIT) {
      const firstId = Array.from(recentEventIds)[0];
      recentEventIds.delete(firstId);
    }

    // 15% 概率调用 LLM 增强描述
    if (Math.random() < LLM_CONFIG.enhanceDescriptionProbability) {
      event = await get().enhanceEventDescription(event);
    }

    set({
      currentEvent: event,
      eventsInQuarter: state.eventsInQuarter + 1,
      gameStats: {
        ...state.gameStats,
        totalEvents: state.gameStats.totalEvents + 1,
      },
    });
  },

  // 进入策略阶段
  enterStrategyPhase: () => {
    set({ status: GameStatus.STRATEGY_PHASE });
  },

  // 完成季度（进入结算）
  finishQuarter: () => {
    const state = get();

    // 检查项目是否完成
    const projectCompleted = get().checkProjectCompletion();

    // 计算季度结算
    const salary = get().calculateQuarterlySalary();
    const storageFee = get().calculateStorageFee();
    const livingCost = LIVING_COSTS.total;
    const relationshipDecay: Record<RelationshipType, number> = {} as any;

    // 关系衰减
    Object.values(RelationshipType).forEach((type) => {
      const config = RELATIONSHIP_CONFIGS[type];
      const decay = config.decayRate;
      const currentValue = state.relationships[type];
      relationshipDecay[type] = decay;
      state.relationships[type] = Math.max(0, currentValue - decay);
    });

    // 更新材料价格
    get().updateMaterialPrices();

    // 随机奖金事件触发（10% 概率）
    let bonusEvent: typeof BONUS_EVENTS[0] | null = null;
    if (Math.random() < 0.1) {
      // 根据概率选择奖金事件
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

    // 随机天灾事件触发（5% 概率）
    let disasterEvent: typeof DISASTER_EVENTS[0] | null = null;
    if (Math.random() < 0.05) {
      // 根据概率选择天灾事件
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

    // 应用天灾事件的其他影响
    if (disasterEvent) {
      const newStats = { ...state.stats };
      if (disasterEvent.healthPenalty) {
        newStats.health = Math.max(0, newStats.health - disasterEvent.healthPenalty);
      }
      if (disasterEvent.reputationPenalty) {
        newStats.reputation = Math.max(0, newStats.reputation - disasterEvent.reputationPenalty);
      }
      if (disasterEvent.progressPenalty) {
        const currentProjectProgress = state.projectProgress;
        newStats.progress = Math.max(0, currentProjectProgress - disasterEvent.progressPenalty);
        // 同时更新项目进度
        set({ projectProgress: Math.max(0, currentProjectProgress - disasterEvent.progressPenalty) });
      }
      set({ stats: newStats });
    }

    // 更新现金（收入 - 支出）
    const netChange = totalIncome - totalExpenses;
    const newStats = { ...get().stats };
    newStats.cash = Math.max(0, newStats.cash + netChange);
    set({ stats: newStats });

    // 检查晋升
    const promotionCheck = get().checkPromotion();

    // 构建结算数据（扩展类型以包含新字段）
    const settlement: QuarterSettlement = {
      quarter: state.currentRound,
      income: projectIncome + bonusIncome,
      expenses: {
        salary,
        storage: storageFee,
        total: totalExpenses,
      },
      relationshipDecay,
      netChange,
      promotionCheck,
    } as QuarterSettlement;

    // 添加额外的结算信息（奖金/天灾事件）
    if (bonusEvent) {
      (settlement as any).bonusEvent = bonusEvent;
    }
    if (disasterEvent) {
      (settlement as any).disasterEvent = disasterEvent;
    }
    (settlement as any).livingCost = livingCost;

    set({
      currentSettlement: settlement,
      status: GameStatus.SETTLEMENT,
    });
  },

  // 检查项目完成
  checkProjectCompletion: (): boolean => {
    const state = get();
    const { projectProgress, projectQuality } = state;

    if (projectProgress >= PROJECT_COMPLETION.minProgress &&
        projectQuality >= PROJECT_COMPLETION.minQuality) {
      // 项目完成
      const isQualityProject = projectQuality >= PROJECT_COMPLETION.qualityThreshold;

      set({
        gameStats: {
          ...state.gameStats,
          completedProjects: state.gameStats.completedProjects + 1,
          qualityProjects: isQualityProject
            ? state.gameStats.qualityProjects + 1
            : state.gameStats.qualityProjects,
        },
        projectProgress: 0, // 重置项目进度
        projectQuality: GAME_CONFIG.initialStats.quality,
      });

      return true;
    }

    return false;
  },

  // 选择选项
  selectOption: (optionId: string) => {
    const state = get();

    if (!state.currentEvent || state.status !== GameStatus.PLAYING) {
      return;
    }

    const option = state.currentEvent.options.find((opt) => opt.id === optionId);

    if (!option) {
      console.error('Option not found:', optionId);
      return;
    }

    get().applyEffects(option.effects);

    const eventHistory = [...state.eventHistory, state.currentEvent];

    set({
      eventHistory,
      currentEvent: null,
    });

    // 检查失败条件
    get().checkGameEnd();

    if (get().status === GameStatus.PLAYING) {
      // 继续抽取事件或进入策略阶段
      if (state.eventsInQuarter >= state.maxEventsPerQuarter) {
        get().enterStrategyPhase();
      } else {
        get().drawEvent();
      }
    }
  },

  // 应用效果
  applyEffects: (effects: Effects) => {
    const currentStats = get().stats;

    const newStats: PlayerStats = {
      cash: Math.max(0, currentStats.cash + (effects.cash || 0)), // 现金不限制上限，只限制最小值为 0
      health: clampStat(currentStats.health + (effects.health || 0)),
      reputation: clampStat(currentStats.reputation + (effects.reputation || 0)),
      progress: clampStat(currentStats.progress + (effects.progress || 0)),
      quality: clampStat(currentStats.quality + (effects.quality || 0)),
    };

    // 更新项目进度和质量
    const state = get();
    set({
      stats: newStats,
      projectProgress: clampStat(state.projectProgress + (effects.progress || 0)),
      projectQuality: clampStat(state.projectQuality + (effects.quality || 0)),
    });
  },

  // 检查游戏结束
  checkGameEnd: () => {
    const state = get();
    const { stats } = state;

    // 检查现金
    if (stats.cash <= LOSE_CONDITIONS.cash) {
      const score = get().calculateNetAssets();
      set({
        status: GameStatus.FAILED,
        score,
        endReason: EndReason.OUT_OF_CASH,
      });
      return;
    }

    // 检查健康
    if (stats.health <= LOSE_CONDITIONS.health) {
      const score = get().calculateNetAssets();
      set({
        status: GameStatus.FAILED,
        score,
        endReason: EndReason.HEALTH_DEPLETED,
      });
      return;
    }

    // 检查声誉
    if (stats.reputation <= LOSE_CONDITIONS.reputation) {
      const score = get().calculateNetAssets();
      set({
        status: GameStatus.FAILED,
        score,
        endReason: EndReason.REPUTATION_DEPLETED,
      });
      return;
    }

    // 检查是否晋升到合伙人（胜利）
    if (state.rank === Rank.PARTNER) {
      const score = get().calculateNetAssets();
      set({
        status: GameStatus.COMPLETED,
        score,
        endReason: EndReason.PROMOTED_TO_PARTNER,
      });
    }
  },

  // 检查晋升
  checkPromotion: () => {
    const state = get();
    const currentRank = state.rank;
    const netAssets = get().calculateNetAssets();
    const { gameStats, stats } = state;

    // 如果已经是合伙人，不需要再检查
    if (currentRank === Rank.PARTNER) {
      return { canPromote: false };
    }

    // 获取下一职级
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

    // 检查特殊要求
    if (nextRankConfig.specialRequirement) {
      if (nextRankConfig.rank === Rank.SENIOR_ENGINEER || nextRankConfig.rank === Rank.PROJECT_DIRECTOR) {
        if (gameStats.qualityProjects < (nextRankConfig.rank === Rank.SENIOR_ENGINEER ? 1 : 5)) {
          missing.push(nextRankConfig.specialRequirement);
        }
      } else if (nextRankConfig.rank === Rank.PROJECT_MANAGER) {
        // 已经检查过 completedProjects，这里不需要额外检查
      } else if (nextRankConfig.rank === Rank.PARTNER) {
        if (gameStats.qualityProjects < 10) {
          missing.push(nextRankConfig.specialRequirement);
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

  // 执行晋升
  executePromotion: (newRank: Rank) => {
    set({ rank: newRank });
    get().checkGameEnd(); // 检查是否达到胜利条件
  },

  // 进入下一季度
  nextQuarter: () => {
    const state = get();

    set({
      status: GameStatus.PLAYING,
      currentRound: state.currentRound + 1,
      eventsInQuarter: 0,
      currentSettlement: null,
      gameStats: {
        ...state.gameStats,
        totalQuarters: state.gameStats.totalQuarters + 1,
      },
    });

    get().drawEvent();
  },

  // 买入材料
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
    });

    return {
      success: true,
      cashChange: -cost,
      inventoryChange: amount,
      message: `成功买入 ${amount}${config.unit} ${config.name}`,
    };
  },

  // 卖出材料
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
    });

    return {
      success: true,
      cashChange: revenue,
      inventoryChange: -amount,
      message: `成功卖出 ${amount}${config.unit} ${config.name}`,
    };
  },

  // 更新材料价格
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

  // 关系维护
  maintainRelationship: (
    relationshipType: RelationshipType,
    method: 'dinner' | 'gift' | 'favor' | 'solidarity'
  ): MaintenanceResult => {
    const state = get();

    const option = MAINTENANCE_OPTIONS[method];
    const cost = option.cost;
    const relationshipGain = option.relationshipGain;
    const healthCost = 'healthCost' in option ? (option.healthCost || 0) : 0;

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

    set({
      stats: newStats,
      relationships: newRelationships,
    });

    return {
      success: true,
      relationshipChange: relationshipGain,
      cashChange: -cost,
      healthChange: healthCost || undefined,
      message: `关系维护成功，关系值 +${relationshipGain}`,
    };
  },

  // 关系衰减
  decayRelationships: () => {
    // 这部分在 finishQuarter 中已经处理
  },

  // 计算净资产
  calculateNetAssets: (): number => {
    const state = get();
    let assets = state.stats.cash;

    // 加上库存价值
    Object.values(MaterialType).forEach((type) => {
      const amount = state.inventory[type];
      const price = state.materialPrices[type]?.currentPrice || MATERIAL_CONFIGS[type].basePrice;
      assets += amount * price;
    });

    return Math.round(assets);
  },

  // 计算仓储费
  calculateStorageFee: (): number => {
    const state = get();
    let totalFee = 0;

    Object.values(MaterialType).forEach((type) => {
      const amount = state.inventory[type];
      const fee = MATERIAL_CONFIGS[type].storageFee;
      totalFee += amount * fee;
    });

    return totalFee;
  },

  // 计算季度工资
  calculateQuarterlySalary: (): number => {
    const state = get();
    const rankConfig = RANK_CONFIGS[state.rank];
    return rankConfig.quarterlySalary; // 正数为收入，负数为支出
  },

  // LLM 增强事件描述
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
        round: state.currentRound,
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

  // 生成 LLM 特殊事件
  generateLLMSpecialEvent: async (): Promise<EventCard | null> => {
    try {
      set({ isLLMEnhancing: true });

      const state = get();
      const result = await generateSpecialEvent({
        stats: state.stats,
        round: state.currentRound,
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

  // 判断是否触发特殊事件
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
    if (stats.cash < 20 || stats.health < 20) {
      return Math.random() < 0.25;
    }

    return false;
  },

  // 重置游戏
  resetGame: () => {
    const initialState = createInitialState();
    const initialPrices = initializeMaterialPrices();
    const initialHistory: Record<MaterialType, number[]> = {
      [MaterialType.CEMENT]: [initialPrices[MaterialType.CEMENT].currentPrice],
      [MaterialType.STEEL]: [initialPrices[MaterialType.STEEL].currentPrice],
      [MaterialType.SAND]: [initialPrices[MaterialType.SAND].currentPrice],
      [MaterialType.CONCRETE]: [initialPrices[MaterialType.CONCRETE].currentPrice],
    };

    recentEventIds.clear();
    set({
      ...initialState,
      materialPrices: initialPrices,
      materialPriceHistory: initialHistory,
      runId: null,
      deviceId: null,
      specialEventCount: 0,
      isLLMEnhancing: false,
      currentSettlement: null,
    });
  },

  // 上传成绩
  uploadScore: async () => {
    const state = get();

    if (!state.runId) {
      console.log('离线模式，跳过成绩上传');
      return;
    }

    try {
      const result = await apiFinishGame({
        runId: state.runId,
        score: state.score,
        finalStats: state.stats,
        roundsPlayed: state.currentRound,
      });

      console.log('成绩上传成功:', result);
    } catch (error) {
      console.error('成绩上传失败:', error);
    }
  },
}));

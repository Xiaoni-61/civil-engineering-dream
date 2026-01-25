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
  TeamIssue,
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
  TEAM_EFFECTS,
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

interface ActionResult {
  success: boolean;
  message: string;
  effects?: Effects;
}

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
  calculateNetAssets: () => number;
  calculateStorageFee: () => number;
  calculateQuarterlySalary: () => number;
  raiseSalary: () => { success: boolean; newSalary?: number; message: string };
  enhanceEventDescription: (event: EventCard) => Promise<EventCard>;
  generateLLMSpecialEvent: () => Promise<EventCard | null>;
  shouldTriggerSpecialEvent: (quarter: number, stats: PlayerStats) => boolean;
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

// ==================== Store 定义 ====================

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

  // ==================== 游戏流程 ====================

  startGame: async () => {
    try {
      const response = await apiStartGame();

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
        currentQuarter: 1,
        materialPrices: initialPrices,
        materialPriceHistory: initialHistory,
        runId: response.runId,
        actionsSinceLastEventCheck: 0,
        actionsThisQuarter: 0,
      });
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
        currentQuarter: 1,
        materialPrices: initialPrices,
        materialPriceHistory: initialHistory,
        runId: null,
        actionsSinceLastEventCheck: 0,
        actionsThisQuarter: 0,
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
    });
  },

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
        roundsPlayed: state.currentQuarter,
      });
      console.log('成绩上传成功:', result);
    } catch (error) {
      console.error('成绩上传失败:', error);
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
        newStats.progress = clampStat(newStats.progress + actionConfig.effects.progress);
        state.projectProgress = clampStat(state.projectProgress + actionConfig.effects.progress);
      }
      if (actionConfig.effects.quality) {
        newStats.quality = clampStat(newStats.quality + actionConfig.effects.quality);
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

    set({
      stats: newStats,
      actionPoints: newActionPoints,
      maxActionPoints: newMaxActionPoints,
      actionsThisQuarter: state.actionsThisQuarter + 1,
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
    set({ relationships: newRelationships });

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

    // 应用天灾事件的其他影响
    if (disasterEvent) {
      const newStats = { ...get().stats };
      if (disasterEvent.healthPenalty) {
        newStats.health = Math.max(0, newStats.health - disasterEvent.healthPenalty);
      }
      if (disasterEvent.reputationPenalty) {
        newStats.reputation = Math.max(0, newStats.reputation - disasterEvent.reputationPenalty);
      }
      if (disasterEvent.progressPenalty) {
        const currentProjectProgress = state.projectProgress;
        newStats.progress = Math.max(0, currentProjectProgress - disasterEvent.progressPenalty);
        set({ projectProgress: Math.max(0, currentProjectProgress - disasterEvent.progressPenalty) });
      }
      set({ stats: newStats });
    }

    // 更新现金
    const netChange = totalIncome - totalExpenses;
    const newStats = { ...get().stats };
    newStats.cash = Math.max(0, newStats.cash + netChange);
    set({ stats: newStats });

    // 检查晋升
    const promotionCheck = get().checkPromotion();

    // 构建结算数据
    const settlement: QuarterSettlement = {
      quarter: state.currentQuarter,
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
      maintenanceCount: 0,
      materialTradeCount: 0,
      maintainedRelationships: new Set<RelationshipType>(),
      actionsThisQuarter: 0,
    });
  },

  nextQuarter: () => {
    const state = get();

    // 季度开始：自动恢复健康
    const newHealth = Math.min(100, state.stats.health + QUARTER_HEALTH_REGEN);

    // 计算新的行动点
    const newActionPoints = calculateActionPoints(newHealth);

    // 检查是否进入后期阶段
    const newPhase = PHASE_CONFIG.lateGameRanks.includes(state.rank)
      ? GamePhase.LATE
      : GamePhase.EARLY;

    set({
      status: GameStatus.PLAYING,
      currentQuarter: state.currentQuarter + 1,
      stats: {
        ...state.stats,
        health: newHealth,
      },
      actionPoints: newActionPoints,
      maxActionPoints: newActionPoints,
      phase: newPhase,
      currentSettlement: null,
      gameStats: {
        ...state.gameStats,
        totalQuarters: state.gameStats.totalQuarters + 1,
      },
      actionsThisQuarter: 0,
      actionsSinceLastEventCheck: 0,
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
        // TODO: 实现事件抽取逻辑
        console.log('触发事件');
      }
    }
  },

  deferEvent: (eventId: string) => {
    // TODO: 实现延后事件逻辑
    console.log('延后事件:', eventId);
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
  },

  // ==================== 保留的方法（待适配）====================

  selectOption: (optionId: string) => {
    // TODO: 适配新系统
    console.log('selectOption:', optionId);
  },

  enterStrategyPhase: () => {
    // TODO: 适配新系统
    console.log('enterStrategyPhase');
  },

  returnToEventPhase: () => {
    // TODO: 适配新系统
    console.log('returnToEventPhase');
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
    // TODO: 适配新系统
    return { success: false, cashChange: 0, inventoryChange: 0, message: '待实现' };
  },

  sellMaterial: (materialType: MaterialType, amount: number): TradeResult => {
    // TODO: 适配新系统
    return { success: false, cashChange: 0, inventoryChange: 0, message: '待实现' };
  },

  updateMaterialPrices: () => {
    // TODO: 适配新系统
    console.log('updateMaterialPrices');
  },

  maintainRelationship: (
    relationshipType: RelationshipType,
    method: 'dinner' | 'gift' | 'favor' | 'solidarity'
  ): MaintenanceResult => {
    // TODO: 适配新系统
    return { success: false, relationshipChange: 0, cashChange: 0, message: '待实现' };
  },

  getMaxMaintenanceCount: () => {
    // TODO: 适配新系统
    return 3;
  },

  getMaxMaterialTradeCount: () => {
    // TODO: 适配新系统
    return 3;
  },

  getMaxBuyableAmount: (materialType: MaterialType): number => {
    // TODO: 适配新系统
    return 10;
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
      progress: clampStat(currentStats.progress + (effects.progress || 0)),
      quality: clampStat(currentStats.quality + (effects.quality || 0)),
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
        projectQuality: GAME_CONFIG.initialStats.quality,
      });

      return true;
    }

    return false;
  },

  checkPromotion: () => {
    const state = get();
    const currentRank = state.rank;
    const netAssets = get().calculateNetAssets();
    const { gameStats, stats, team } = state;

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

    if (netAssets < nextRankConfig.assetsRequired) {
      missing.push(`净资产需达到 ${(nextRankConfig.assetsRequired / 10000).toFixed(0)}万`);
    }

    if (gameStats.completedProjects < nextRankConfig.projectsRequired) {
      missing.push(`完成项目数需达到 ${nextRankConfig.projectsRequired}个`);
    }

    if (stats.reputation < nextRankConfig.reputationRequired) {
      missing.push(`声誉需达到 ${nextRankConfig.reputationRequired}`);
    }

    if (nextRankConfig.specialRequirement) {
      if (nextRankConfig.rank === Rank.SENIOR_ENGINEER || nextRankConfig.rank === Rank.PROJECT_DIRECTOR) {
        if (gameStats.qualityProjects < (nextRankConfig.rank === Rank.SENIOR_ENGINEER ? 1 : 5)) {
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

    return totalFee;
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

  enhanceEventDescription: async (event: EventCard): Promise<EventCard> => {
    // TODO: 适配 LLM 系统
    return event;
  },

  generateLLMSpecialEvent: async (): Promise<EventCard | null> => {
    // TODO: 适配 LLM 系统
    return null;
  },

  shouldTriggerSpecialEvent: (quarter: number, stats: PlayerStats) => {
    // TODO: 适配新系统
    return false;
  },
}));

/**
 * 游戏常量配置
 */

import { GameConfig, Rank, MaterialType, RelationshipType, ActionType, ActionConfig, TeamMemberType } from '@shared/types';

// 游戏基础配置
export const GAME_CONFIG: GameConfig = {
  initialStats: {
    cash: 50000,  // 从 50 提高到 50000
    health: 100,
    reputation: 50,
    workAbility: 0,  // 将通过人物创建设置
    luck: 0,         // 将通过人物创建设置
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
};

// 胜利条件：晋升到合伙人
export const WIN_CONDITION = {
  targetRank: Rank.PARTNER,
};

// 失败条件
export const LOSE_CONDITIONS = {
  cash: 0,           // 现金 ≤ 0 破产
  health: 0,         // 健康 ≤ 0 过劳
  reputation: 0,     // 声誉 ≤ 0 封杀
};

// 项目完成条件（单个项目）
export const PROJECT_COMPLETION = {
  minProgress: 100,  // 进度 ≥ 100
  minQuality: 60,    // 质量 ≥ 60
  qualityThreshold: 90, // 优质项目阈值
  reward: 50000,     // 项目完成奖励（主要收入来源）
};

// 生活成本配置（当季度工资的百分比范围）
export const LIVING_COSTS_CONFIG = {
  minPercent: 0.10,  // 最低 10%
  maxPercent: 0.25,  // 最高 25%
};

// 生活成本说明（用于显示）
export const LIVING_COSTS_BREAKDOWN = {
  accommodation: '住宿费',
  food: '餐饮费',
  transport: '交通费',
  communication: '通讯费',
  miscellaneous: '其他杂费',
};

// 指标显示配置
export const STAT_DISPLAY = {
  cash: {
    label: '现金',
    icon: '💰',
    color: '#10B981', // green
    dangerThreshold: 5000,  // 调整为 5000 元
  },
  health: {
    label: '健康',
    icon: '❤️',
    color: '#EF4444', // red
    dangerThreshold: 20,
  },
  reputation: {
    label: '声誉',
    icon: '⭐',
    color: '#F59E0B', // yellow
    dangerThreshold: 30,
  },
  workAbility: {
    label: '工作能力',
    icon: '📚',
    color: '#3B82F6', // blue
    dangerThreshold: 0,
  },
  luck: {
    label: '幸运',
    icon: '🎲',
    color: '#F59E0B', // yellow
    dangerThreshold: 0,
  },
} as const;

// 职级显示配置
export const RANK_DISPLAY = {
  [Rank.INTERN]: {
    label: '实习生',
    icon: '🎓',
    color: '#94A3B8',
  },
  [Rank.ENGINEER]: {
    label: '工程师',
    icon: '👷',
    color: '#60A5FA',
  },
  [Rank.SENIOR_ENGINEER]: {
    label: '高级工程师',
    icon: '👨‍🔧',
    color: '#3B82F6',
  },
  [Rank.PROJECT_MANAGER]: {
    label: '项目经理',
    icon: '👨‍💼',
    color: '#2563EB',
  },
  [Rank.PROJECT_DIRECTOR]: {
    label: '项目总监',
    icon: '📋',
    color: '#7C3AED',
  },
  [Rank.PARTNER]: {
    label: '合伙人',
    icon: '🎯',
    color: '#DC2626',
  },
};

// 材料显示配置
export const MATERIAL_DISPLAY = {
  [MaterialType.CEMENT]: {
    label: '水泥',
    shortLabel: '水泥',
    icon: '🧱',
    color: '#9CA3AF',
  },
  [MaterialType.STEEL]: {
    label: '钢筋',
    shortLabel: '钢筋',
    icon: '🔩',
    color: '#6B7280',
  },
  [MaterialType.SAND]: {
    label: '砂石',
    shortLabel: '砂石',
    icon: '⛰️',
    color: '#D97706',
  },
  [MaterialType.CONCRETE]: {
    label: '混凝土',
    shortLabel: '混凝土',
    icon: '🏗️',
    color: '#78716C',
  },
};

// 关系显示配置
export const RELATIONSHIP_DISPLAY = {
  [RelationshipType.CLIENT]: {
    label: '甲方',
    icon: '🤵',
    color: '#DC2626',
    unlockHint: '实习生即可接触',
  },
  [RelationshipType.SUPERVISION]: {
    label: '监理',
    icon: '📝',
    color: '#2563EB',
    unlockHint: '晋升助理工程师解锁',
  },
  [RelationshipType.DESIGN]: {
    label: '设计院',
    icon: '📐',
    color: '#7C3AED',
    unlockHint: '晋升工程师解锁',
  },
  [RelationshipType.LABOR]: {
    label: '劳务队',
    icon: '👷',
    color: '#EA580C',
    unlockHint: '实习生即可接触',
  },
  [RelationshipType.GOVERNMENT]: {
    label: '政府部门',
    icon: '🏛️',
    color: '#BE185D',
    unlockHint: '晋升高级工程师解锁',
  },
};

// 关系维护配置（调整后）
export const MAINTENANCE_OPTIONS = {
  dinner: {
    name: '应酬吃饭',
    icon: '🍻',
    cost: 2000,
    relationshipGain: 10,
    healthCost: 2,
    riskLevel: 'low',
  },
  gift: {
    name: '节日送礼',
    icon: '🎁',
    cost: 8000,
    relationshipGain: 18,
    riskLevel: 'medium',
  },
  favor: {
    name: '帮忙办事',
    icon: '🤝',
    cost: 5000,
    relationshipGain: 25,
    riskLevel: 'high',
  },
  solidarity: {
    name: '一起扛事',
    icon: '💪',
    cost: 12000,
    relationshipGain: 18,
    healthCost: 5,
    riskLevel: 'medium',
    unlocksBond: true,
  },
};

// 季度结算消息
export const QUARTER_MESSAGES = {
  promotion: {
    title: '🎉 恭喜晋升！',
    description: '你的努力得到了认可，成功晋升到',
  },
  project_complete: {
    title: '🏗️ 项目完工！',
    description: '这个项目顺利完成了！',
  },
  quarter_end: {
    title: '📊 季度结算',
    description: '本季度收支情况如下',
  },
};

// 游戏结束消息
export const END_MESSAGES = {
  promoted_to_partner: {
    title: '🎉 晋升合伙人！',
    description: '恭喜你！经过多个季度的努力，你终于成为了公司的合伙人，站在了职业生涯的巅峰！',
  },
  bankrupt: {
    title: '💸 资金链断裂',
    description: '现金流枯竭，你破产了...',
  },
  out_of_cash: {
    title: '💸 资金链断裂',
    description: '现金流枯竭，公司宣告破产...',
  },
  health_depleted: {
    title: '🏥 身体垮了',
    description: '长期的高强度工作让你的身体再也撑不住了，被送进了医院...',
  },
  reputation_depleted: {
    title: '😞 行业封杀',
    description: '声誉扫地，没有任何公司或甲方愿意和你合作了...',
  },
};

// 统计显示范围
export const STAT_RANGE = {
  min: 0,
  max: 100,
};

// LLM 增强配置
export const LLM_CONFIG = {
  // 动态描述增强概率（降低频率以提升加载速度）
  enhanceDescriptionProbability: 0.05, // 从 15% 降低到 5%

  // 特殊事件触发配置
  specialEvent: {
    minQuarter: 2,
    maxCount: 2, // 每局最多 2 次
    probability: 0.05, // 从 10% 降低到 5%（降低特殊事件频率）
  },

  // 启用状态（可通过环境变量控制）
  enabled: true,
};

// 价格波动事件配置
export const PRICE_EVENTS = [
  {
    id: 'environmental_check',
    name: '环保督查加强',
    description: '环保督查加强，水泥厂限产',
    affectedMaterials: [MaterialType.CEMENT],
    priceMultiplier: 1.5,
    duration: 2,
  },
  {
    id: 'infrastructure_boom',
    name: '基建热潮',
    description: '国家基建投资加码',
    affectedMaterials: [MaterialType.STEEL, MaterialType.CEMENT],
    priceMultiplier: 1.3,
    duration: 3,
  },
  {
    id: 'rain_impact',
    name: '暴雨影响',
    description: '暴雨影响砂石开采',
    affectedMaterials: [MaterialType.SAND],
    priceMultiplier: 1.5,
    duration: 1,
  },
  {
    id: 'market_slump',
    name: '市场低迷',
    description: '房地产市场低迷',
    affectedMaterials: [MaterialType.CEMENT, MaterialType.STEEL, MaterialType.SAND, MaterialType.CONCRETE],
    priceMultiplier: 0.7,
    duration: 3,
  },
];

// 随机奖金事件
export const BONUS_EVENTS = [
  {
    id: 'year_end_bonus',
    name: '年终奖',
    description: '公司发放年终奖，你的努力得到了认可！',
    cashReward: 20000,
    probability: 0.05,
  },
  {
    id: 'project_bonus',
    name: '项目奖金',
    description: '上一个项目表现优异，公司额外发放项目奖金！',
    cashReward: 15000,
    probability: 0.04,
  },
  {
    id: 'insurance_claim',
    name: '保险索赔',
    description: '之前的保险索赔终于成功了！',
    cashReward: 8000,
    probability: 0.03,
  },
  {
    id: 'government_subsidy',
    name: '政府补贴',
    description: '新能源项目获得政府补贴！',
    cashReward: 10000,
    probability: 0.03,
  },
  {
    id: 'client_extra',
    name: '甲方追加款',
    description: '甲方对项目很满意，追加了款项！',
    cashReward: 12000,
    probability: 0.03,
  },
  {
    id: 'windfall',
    name: '意外之财',
    description: '一笔小额意外收入到账！',
    cashReward: 5000,
    probability: 0.02,
  },
];

// 天灾事件
export const DISASTER_EVENTS = [
  {
    id: 'work_injury',
    name: '工伤事故',
    description: '工地发生了一起工伤事故，需要赔偿和停工整改。',
    cashPenalty: 15000,
    healthPenalty: 10,
    probability: 0.02,
  },
  {
    id: 'material_theft',
    name: '材料被盗',
    description: '工地昨晚被偷了一批材料！',
    cashPenalty: 8000,
    probability: 0.02,
  },
  {
    id: 'rain_damage',
    name: '暴雨损失',
    description: '连续暴雨导致工地停工，材料受损。',
    cashPenalty: 10000,
    progressPenalty: 5,
    probability: 0.02,
  },
  {
    id: 'supervision_fine',
    name: '监理罚款',
    description: '监理检查发现了安全问题，开出了罚单。',
    cashPenalty: 5000,
    reputationPenalty: 5,
    probability: 0.01,
  },
  {
    id: 'equipment_breakdown',
    name: '设备故障',
    description: '关键设备突然故障，需要紧急维修。',
    cashPenalty: 12000,
    progressPenalty: 5,
    probability: 0.01,
  },
  {
    id: 'worker_strike',
    name: '工人罢工',
    description: '工资纠纷导致工人罢工，项目进度受影响。',
    cashPenalty: 8000,
    reputationPenalty: 5,
    progressPenalty: 5,
    probability: 0.01,
  },
];

// 季度开始事件池（每次随机抽取2-3个事件同时发生）
export const QUARTER_START_EVENT_POOL = [
  // 正面事件
  {
    id: 'qs_bonus',
    title: '季度奖金',
    description: '公司发放了季度奖金！',
    probability: 0.3,
    effects: { cash: 5000, reputation: 2 },
    isPositive: true,
  },
  {
    id: 'qs_good_health',
    title: '身体状况良好',
    description: '经过休息，你的身体状态恢复得不错。',
    probability: 0.3,
    effects: { health: 10 },
    isPositive: true,
  },
  {
    id: 'qs_praise',
    title: '领导表扬',
    description: '你在上季度的工作表现得到了领导的公开表扬。',
    probability: 0.25,
    effects: { reputation: 5 },
    isPositive: true,
  },
  {
    id: 'qs_market_up',
    title: '市场需求旺盛',
    description: '本季度市场需求旺盛，项目收益有望提升。',
    probability: 0.2,
    effects: { progress: 5 },
    isPositive: true,
  },
  {
    id: 'qs_team_boost',
    title: '团队士气高涨',
    description: '团队成员士气高昂，工作效率提升。',
    probability: 0.2,
    effects: { quality: 5 },
    isPositive: true,
  },
  {
    id: 'qs_relationship',
    title: '关系融洽',
    description: '与各方关系维护得当，工作开展顺利。',
    probability: 0.25,
    effects: { reputation: 3, cash: -1000 },
    isPositive: true,
  },

  // 负面事件
  {
    id: 'qs_market_down',
    title: '市场低迷',
    description: '受市场环境影响，本季度项目收益可能下降。',
    probability: 0.25,
    effects: { cash: -3000, reputation: -2 },
    isPositive: false,
  },
  {
    id: 'qs_health_issue',
    title: '身体不适',
    description: '换季时节，你感到身体有些不适。',
    probability: 0.25,
    effects: { health: -8 },
    isPositive: false,
  },
  {
    id: 'qs_pressure',
    title: '工期压力',
    description: '项目工期紧张，工作压力增大。',
    probability: 0.3,
    effects: { health: -5, progress: 3 },
    isPositive: false,
  },
  {
    id: 'qs_complaint',
    title: '甲方投诉',
    description: '甲方对某些工作提出了不满。',
    probability: 0.2,
    effects: { reputation: -5, cash: -2000 },
    isPositive: false,
  },
  {
    id: 'qs_material_rise',
    title: '材料涨价',
    description: '主要材料价格上涨，成本增加。',
    probability: 0.25,
    effects: { cash: -4000 },
    isPositive: false,
  },
  {
    id: 'qs_quality_issue',
    title: '质量问题',
    description: '发现部分工程质量问题，需要返工。',
    probability: 0.2,
    effects: { quality: -5, progress: -3, cash: -2000 },
    isPositive: false,
  },
  {
    id: 'qs_labor_issue',
    title: '劳务纠纷',
    description: '劳务队对工资待遇有意见，需要协调。',
    probability: 0.15,
    effects: { cash: -3000, reputation: -2 },
    isPositive: false,
  },
];

// ==================== 行动系统配置 ====================

// 行动配置
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
  [ActionType.FREELANCE]: {
    type: ActionType.FREELANCE,
    name: '承接私活',
    icon: '💼',
    description: '私下接活赚钱，但有健康和声誉风险',
    costAP: 1,
    phase: 'both',
    effects: {
      cash: 15000,
      health: -8,
      reputation: -5,
    },
  },
  [ActionType.CUT_CORNERS]: {
    type: ActionType.CUT_CORNERS,
    name: '偷工减料',
    icon: '⚠️',
    description: '大幅推进进度，但质量和声誉会下降',
    costAP: 1,
    phase: 'both',
    effects: {
      progress: 18,
      quality: -12,
      reputation: -3,
      health: -3,
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

// 每季度最大材料交易次数
export const MAX_MATERIAL_TRADES_PER_QUARTER = 3;

// 每季度开始自动恢复的健康值
export const QUARTER_HEALTH_REGEN = 2;

// 行动点计算：健康 / 20，向上取整
export const ACTION_POINTS_DIVISOR = 20;

// 游戏阶段配置
export const PHASE_CONFIG = {
  earlyGameRanks: [
    Rank.INTERN,
    Rank.ENGINEER,
    Rank.SENIOR_ENGINEER,
  ],
  lateGameRanks: [
    Rank.PROJECT_MANAGER,
    Rank.PROJECT_DIRECTOR,
    Rank.PARTNER,
  ],
};

// 事件系统配置
export const EVENT_TRIGGER_CONFIG = {
  actionsPerTrigger: 2,      // 每消耗 2 行动点触发检测
  triggerProbability: 0.5,   // 50% 概率触发事件
  deferTurns: 2,            // 延后处理期限（行动次数）
};

export const EVENT_IGNORE_CONSEQUENCES = {
  reputationPenalty: 10,     // 忽略事件的声誉惩罚
  relationshipDecay: 5,      // 忽略事件的关系衰减
};

// ==================== 团队系统配置 ====================

// 招募配置
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

// 领导力获取方式
export const LEADERSHIP_GAIN = {
  resolveIssue: 10,        // 解决团队问题
  teamSuccess: 5,          // 团队项目成功
  memberMorale: 2,         // 提升成员士气
  training: 3,             // 团队培训
};

// 领导力作用
export const LEADERSHIP_EFFECTS = {
  efficiencyPerPoint: 0.002,  // 每点领导力 +0.2% 效率
  baseTeamSize: 3,            // 基础团队规模
  extraMembersPer10Leadership: 2,  // 每10点领导力+2人
  partnerRequirement: 60,     // 晋升合伙人所需领导力
};

// 团队问题模板
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

// 团队效果计算
export const TEAM_EFFECTS = {
  engineer: {
    qualityBonusPerSkill: 5,  // 工程师：每技能点+5质量
  },
  salesperson: {
    incomeBonusPerSkill: 3,   // 业务员：每技能点+3%收益
  },
  worker: {
    costReductionPerSkill: 2, // 劳务工：每技能点-2%成本
  },
  designer: {
    efficiencyBonusPerSkill: 4, // 设计师：每技能点+4%效率
  },
};

// ==================== 属性成长配置 ====================

// 属性成长配置
export const ABILITY_GROWTH = {
  base: { workAbility: 5, luck: 3 },        // 基础训练
  advanced: { workAbility: 8, luck: 5 },     // 高级训练
  promotionBonus: [10, 8, 6, 5, 4, 3],      // 晋升加成（递减）
};

// 训练冷却配置
export const TRAINING_COOLDOWN = {
  basic: 1,      // 基础训练冷却 1 个季度
  advanced: 3,   // 高级训练冷却 3 个季度
};

// 训练配置
export const TRAINING_CONFIG = {
  basic_work: {
    name: '专业培训',
    icon: '📚',
    description: '提升工作能力',
    effect: { workAbility: 5 },
    cost: { cash: 2000, health: 5 },
    successRate: 100,
  },
  advanced_work: {
    name: '考取证书',
    icon: '📖',
    description: '大幅提升工作能力',
    effect: { workAbility: 8 },
    cost: { cash: 3000, health: 8 },
    successRate: 'formula', // 50 + 幸运/2
  },
  basic_luck: {
    name: '参加行业活动',
    icon: '🎯',
    description: '提升幸运',
    effect: { luck: 3 },
    cost: { cash: 1000, health: 2 },
    successRate: 100,
  },
  advanced_luck: {
    name: '外出社交',
    icon: '🎲',
    description: '大幅提升幸运',
    effect: { luck: 5 },
    cost: { cash: 1500, health: 3 },
    successRate: 'formula', // 50 + 幸运/2
  },
};

// 隐藏选项解锁阈值
export const HIDDEN_OPTION_THRESHOLD = {
  workAbility: 30,  // 工作能力 ≥ 30 解锁技术选项
  luck: 40,         // 幸运 ≥ 40 解锁冒险选项
};

// 关系加成配置
export const RELATIONSHIP_ABILITY_BONUS = {
  workAbilityThreshold: 60,    // 工作能力 ≥ 60 时
  designAndSupervisionBonus: 20, // 设计院、监理关系维护 +20% 成功率
  luckThreshold: 60,            // 幸运 ≥ 60 时
  mentorChance: 15,             // 15% 概率触发贵人相助
  mentorBonus: 10,              // 贵人相助关系 +10
};

/**
 * 游戏常量配置
 */

import { GameConfig, Rank, MaterialType, RelationshipType } from '@shared/types';

// 游戏基础配置
export const GAME_CONFIG: GameConfig = {
  initialStats: {
    cash: 50000,  // 从 50 提高到 50000
    health: 100,
    reputation: 50,
    progress: 0,
    quality: 50,
  },
  initialRank: Rank.INTERN,
  maxEventsPerQuarter: 4, // 每季度最多处理 4 个事件
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

// 生活成本（每季度固定支出）
export const LIVING_COSTS = {
  total: 10000,  // 总生活成本
  breakdown: {
    accommodation: 3000,  // 住宿费
    food: 4000,          // 餐饮费
    transport: 1500,     // 交通费
    communication: 500,  // 通讯费
    miscellaneous: 1000, // 其他杂费
  },
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
  progress: {
    label: '进度',
    icon: '📈',
    color: '#3B82F6', // blue
    dangerThreshold: 0,
  },
  quality: {
    label: '质量',
    icon: '🏆',
    color: '#8B5CF6', // purple
    dangerThreshold: 40,
  },
} as const;

// 职级显示配置
export const RANK_DISPLAY = {
  [Rank.INTERN]: {
    label: '实习生',
    icon: '🎓',
    color: '#94A3B8',
  },
  [Rank.ASSISTANT_ENGINEER]: {
    label: '助理工程师',
    icon: '👷',
    color: '#60A5FA',
  },
  [Rank.ENGINEER]: {
    label: '工程师',
    icon: '👨‍🔧',
    color: '#3B82F6',
  },
  [Rank.SENIOR_ENGINEER]: {
    label: '高级工程师',
    icon: '👨‍💼',
    color: '#2563EB',
  },
  [Rank.PROJECT_MANAGER]: {
    label: '项目经理',
    icon: '📋',
    color: '#7C3AED',
  },
  [Rank.PROJECT_DIRECTOR]: {
    label: '项目总监',
    icon: '🎯',
    color: '#DC2626',
  },
  [Rank.PARTNER]: {
    label: '合伙人',
    icon: '👑',
    color: '#F59E0B',
  },
};

// 材料显示配置
export const MATERIAL_DISPLAY = {
  [MaterialType.CEMENT]: {
    label: '水泥',
    icon: '🧱',
    color: '#9CA3AF',
  },
  [MaterialType.STEEL]: {
    label: '钢筋',
    icon: '🔩',
    color: '#6B7280',
  },
  [MaterialType.SAND]: {
    label: '砂石',
    icon: '⛰️',
    color: '#D97706',
  },
  [MaterialType.CONCRETE]: {
    label: '混凝土',
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
  },
  [RelationshipType.SUPERVISION]: {
    label: '监理',
    icon: '📝',
    color: '#2563EB',
  },
  [RelationshipType.DESIGN]: {
    label: '设计院',
    icon: '📐',
    color: '#7C3AED',
  },
  [RelationshipType.LABOR]: {
    label: '劳务队',
    icon: '👷',
    color: '#EA580C',
  },
  [RelationshipType.GOVERNMENT]: {
    label: '政府部门',
    icon: '🏛️',
    color: '#BE185D',
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
  // 动态描述增强概率
  enhanceDescriptionProbability: 0.15, // 15%

  // 特殊事件触发配置
  specialEvent: {
    minQuarter: 2,
    maxCount: 2, // 每局最多 2 次
    probability: 0.1, // 10% 基础概率
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

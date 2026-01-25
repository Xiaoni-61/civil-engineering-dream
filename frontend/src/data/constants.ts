/**
 * 游戏常量配置
 */

import { GameConfig } from '@shared/types';

// 游戏基础配置
export const GAME_CONFIG: GameConfig = {
  maxRounds: 20,
  initialStats: {
    cash: 50,
    health: 100,
    reputation: 50,
    progress: 0,
    quality: 50,
  },
  winConditions: {
    minProgress: 100,
    minQuality: 60,
  },
  loseConditions: {
    criticalStats: ['cash', 'health'],
  },
};

// 指标显示配置
export const STAT_DISPLAY = {
  cash: {
    label: '现金',
    icon: '💰',
    color: '#10B981', // green
    dangerThreshold: 20,
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

// 计分规则
export const SCORING = {
  // 基础分
  baseScore: 1000,

  // 完成项目奖励
  completeBonus: 3000,

  // 提前完成奖励（每少用一回合）
  earlyCompletionBonus: 200,

  // 各项指标权重
  statWeights: {
    cash: 10,
    health: 15,
    reputation: 10,
    progress: 20,
    quality: 25,
  },

  // 健康惩罚（健康低于阈值时扣分）
  healthPenalty: {
    threshold: 30,
    multiplier: -5,
  },

  // 质量奖励（高质量额外加分）
  qualityBonus: {
    threshold: 80,
    multiplier: 2,
  },
};

// LLM 增强配置
export const LLM_CONFIG = {
  // 动态描述增强概率
  enhanceDescriptionProbability: 0.15, // 15%

  // 特殊事件触发配置
  specialEvent: {
    minRound: 5,
    maxRound: 18,
    maxCount: 2, // 每局最多 2 次
    probability: 0.1, // 10% 基础概率
  },

  // 动态奖励调整概率
  adjustRewardProbability: 0.1, // 10%

  // 启用状态（可通过环境变量控制）
  enabled: true,
};

// 游戏结束消息
export const END_MESSAGES = {
  project_complete: {
    title: '🎉 项目完工！',
    description: '恭喜你成功完成了这个艰巨的土木工程项目！',
  },
  out_of_cash: {
    title: '💸 资金耗尽',
    description: '项目资金链断裂，无法继续...',
  },
  health_depleted: {
    title: '🏥 身体垮了',
    description: '长期的高强度工作让你的身体再也撑不住了...',
  },
  max_rounds: {
    title: '⏰ 时间到了',
    description: '项目已经到了截止日期，但还没有完成...',
  },
};

// 统计显示范围
export const STAT_RANGE = {
  min: 0,
  max: 100,
};

// 回合配置
export const ROUND_CONFIG = {
  min: 1,
  max: GAME_CONFIG.maxRounds,
};

// 事件卡配置
export const EVENT_CONFIG = {
  // 事件池最小数量
  minEventPoolSize: 15,

  // 相同事件最小间隔回合数
  sameEventCooldown: 3,
};

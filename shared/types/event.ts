/**
 * 事件卡类型定义
 */

import { Effects } from './player';
import { EventStatus, Rank, RelationshipType } from './game';

export type EventOptionAction = 'raiseSalary' | 'none';

export interface EventOption {
  id: string;
  text: string;
  effects: Effects;
  feedback?: string; // 选择后的反馈文本
  action?: EventOptionAction; // 特殊动作（如涨薪）
  actionFeedbackOverride?: string; // 动作成功后的反馈覆盖
}

export interface EventCard {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  options: EventOption[];
  llmEnhanced?: boolean; // 是否由 LLM 增强
  isSpecialEvent?: boolean; // 是否为特殊事件
  isUrgent?: boolean; // 是否紧急（紧急事件必须立即处理）
  isImportant?: boolean; // 是否为重要决策（用于传记生成）
  deadline?: number; // 截止回合数
  status?: EventStatus; // 事件状态
}

export enum EventType {
  NORMAL = 'normal',           // 普通事件
  SPECIAL = 'special',         // 特殊事件（LLM 生成）
  MILESTONE = 'milestone',     // 里程碑事件
}

export interface EventTriggerCondition {
  minRound?: number;
  maxRound?: number;
  requiredStats?: Partial<Record<keyof Effects, number>>;
}

// ==================== 决策事件系统类型 ====================

/**
 * 事件类别
 */
export type EventCategory = 'professional' | 'workplace';

/**
 * 决策事件
 */
export interface DecisionEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  requiredRank: Rank;
  options: DecisionEventOption[];
  flavorText?: string;
}

/**
 * 决策选项
 */
export interface DecisionEventOption {
  id: string;
  text: string;
  feedback: string;
  effects: DecisionEventEffects;

  // 隐藏选项支持
  requiredAbility?: {
    workAbility?: number;
    luck?: number;
  };
  hidden?: boolean;        // 是否为隐藏选项
  riskFactor?: number;     // 冒险选项的失败率 (0-1)
  // 失败时的反馈文本（会附加在 feedback 后）
  failureFeedback?: string;
}

/**
 * 事件影响效果
 */
export interface DecisionEventEffects {
  cash?: number;
  health?: number;
  reputation?: number;
  progress?: number;
  quality?: number;
  relationships?: RelationshipEffect[];
  teamMorale?: number;
  leadership?: number;
  workAbility?: number;  // 工作能力变化
  luck?: number;         // 幸运变化

  // 冒险选项失败时的效果（仅在 riskFactor 存在时有效）
  failure?: DecisionEventEffects;
}

/**
 * 关系影响
 */
export interface RelationshipEffect {
  type: RelationshipType;
  change: number;
}

/**
 * 事件结果记录
 */
export interface EventResult {
  eventId: string;
  eventTitle: string;
  selectedOptionId: string;
  selectedOptionText: string;
  feedback: string;
  effects: DecisionEventEffects;
  timestamp: number;
}

/**
 * 事件池配置
 */
export interface EventPoolConfig {
  common: DecisionEvent[];
  intern: DecisionEvent[];
  assistantEngineer: DecisionEvent[];
  engineer: DecisionEvent[];
  seniorEngineer: DecisionEvent[];
  manager: DecisionEvent[];
  director: DecisionEvent[];
  partner: DecisionEvent[];
}

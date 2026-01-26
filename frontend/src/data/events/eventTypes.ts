/**
 * 事件决策系统类型定义
 */

import { Rank, RelationshipType } from '@shared/types';

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
  options: DecisionOption[];
  flavorText?: string;
}

/**
 * 决策选项
 */
export interface DecisionOption {
  id: string;
  text: string;
  feedback: string;
  effects: EventEffects;
}

/**
 * 事件影响效果
 */
export interface EventEffects {
  cash?: number;
  health?: number;
  reputation?: number;
  progress?: number;
  quality?: number;
  relationships?: RelationshipEffect[];
  teamMorale?: number;
  leadership?: number;
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
  effects: EventEffects;
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

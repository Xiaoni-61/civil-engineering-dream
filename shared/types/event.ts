/**
 * 事件卡类型定义
 */

import { Effects } from './player';

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

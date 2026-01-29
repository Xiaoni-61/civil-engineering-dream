/**
 * 事件决策系统类型定义
 *
 * 注意：这些类型现在已经定义在 @shared/types/event.ts 中
 * 此文件为了向后兼容，从 shared 重新导出这些类型
 */

// 从 shared/types 导入所有决策事件相关类型
export type {
  EventCategory,
  DecisionEvent,
  DecisionEventOption as DecisionOption,
  DecisionEventEffects as EventEffects,
  RelationshipEffect,
  EventResult,
  EventPoolConfig,
} from '@shared/types/event';

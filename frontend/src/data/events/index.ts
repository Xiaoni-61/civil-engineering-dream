/**
 * 事件决策系统 - 索引文件
 *
 * 按职级组织的事件池
 * - 低职级（实习生-高级工程师）: 40-50个事件
 * - 高职级（项目经理-合伙人）: 30个事件
 * - 通用事件: 所有职级共享
 */

import {
  DecisionEvent,
  EventPoolConfig,
  EventResult,
  DecisionOption,
  EventEffects,
  RelationshipEffect
} from './eventTypes';
import { Rank } from '@shared/types';

// 导出类型
export type {
  DecisionEvent,
  EventPoolConfig,
  EventResult,
  DecisionOption,
  EventEffects,
  RelationshipEffect
};

// 导入各职级事件
import { commonEvents } from './commonEvents';
import { internEvents } from './internEvents';
import { assistantEngineerEvents } from './assistantEngineerEvents';
import { engineerEvents } from './engineerEvents';
import { seniorEngineerEvents } from './seniorEngineerEvents';
import { managerEvents } from './managerEvents';
import { directorEvents } from './directorEvents';
import { partnerEvents } from './partnerEvents';

/**
 * 获取指定职级可用的所有事件
 */
export function getEventsForRank(rank: Rank): DecisionEvent[] {
  const events: DecisionEvent[] = [
    ...commonEvents,  // 通用事件所有人都能遇到
  ];

  // 添加当前及以下职级的事件
  if (rank >= Rank.INTERN) {
    events.push(...internEvents);
  }
  if (rank >= Rank.ASSISTANT_ENGINEER) {
    events.push(...assistantEngineerEvents);
  }
  if (rank >= Rank.ENGINEER) {
    events.push(...engineerEvents);
  }
  if (rank >= Rank.SENIOR_ENGINEER) {
    events.push(...seniorEngineerEvents);
  }
  if (rank >= Rank.PROJECT_MANAGER) {
    events.push(...managerEvents);
  }
  if (rank >= Rank.PROJECT_DIRECTOR) {
    events.push(...directorEvents);
  }
  if (rank >= Rank.PARTNER) {
    events.push(...partnerEvents);
  }

  return events;
}

/**
 * 从事件池中随机抽取指定数量的事件
 */
export function shuffleQuarterEvents(
  availableEvents: DecisionEvent[],
  count: number
): DecisionEvent[] {
  const shuffled = [...availableEvents].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, availableEvents.length));
}

/**
 * 根据事件ID查找事件
 */
export function findEventById(eventId: string): DecisionEvent | undefined {
  const allEvents = [
    ...commonEvents,
    ...internEvents,
    ...assistantEngineerEvents,
    ...engineerEvents,
    ...seniorEngineerEvents,
    ...managerEvents,
    ...directorEvents,
    ...partnerEvents,
  ];

  return allEvents.find(e => e.id === eventId);
}

// 导出所有事件（用于文档和测试）
export const eventPool: EventPoolConfig = {
  common: commonEvents,
  intern: internEvents,
  assistantEngineer: assistantEngineerEvents,
  engineer: engineerEvents,
  seniorEngineer: seniorEngineerEvents,
  manager: managerEvents,
  director: directorEvents,
  partner: partnerEvents,
};

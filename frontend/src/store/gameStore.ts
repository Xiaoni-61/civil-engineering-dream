/**
 * 游戏状态管理 Store
 * 使用 Zustand 管理游戏核心逻辑
 * 集成 LLM 增强功能
 */

import { create } from 'zustand';
import {
  GameState,
  GameStatus,
  EndReason,
  EventCard,
  PlayerStats,
  Effects,
} from '@shared/types';
import { EVENTS } from '@/data/events';
import { GAME_CONFIG, SCORING, LLM_CONFIG } from '@/data/constants';
import { startGame as apiStartGame, finishGame as apiFinishGame } from '@/api';
import { enhanceDescription, generateSpecialEvent } from '@/api';

interface GameStore extends GameState {
  // 新增：runId 和 deviceId
  runId: string | null;
  deviceId: string | null;

  // LLM 相关状态
  specialEventCount: number;
  isLLMEnhancing: boolean;

  // Actions
  startGame: () => Promise<void>;
  drawEvent: () => Promise<void>;
  selectOption: (optionId: string) => void;
  resetGame: () => void;
  uploadScore: () => Promise<void>;

  // Helper methods
  applyEffects: (effects: Effects) => void;
  checkGameEnd: () => void;
  calculateScore: () => number;

  // LLM Helper
  shouldTriggerSpecialEvent: (round: number, stats: PlayerStats) => boolean;
  enhanceEventDescription: (event: EventCard) => Promise<EventCard>;
  generateLLMSpecialEvent: () => Promise<EventCard | null>;
}

// 初始状态
const initialState: GameState = {
  status: GameStatus.IDLE,
  currentRound: 0,
  maxRounds: GAME_CONFIG.maxRounds,
  stats: { ...GAME_CONFIG.initialStats },
  currentEvent: null,
  eventHistory: [],
  score: 0,
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
  // 过滤掉最近使用过的事件
  const availableEvents = events.filter(e => !usedEventIds.has(e.id));

  if (availableEvents.length === 0) {
    // 如果所有事件都用过了，清空历史重新开始
    usedEventIds.clear();
    return events[Math.floor(Math.random() * events.length)];
  }

  return availableEvents[Math.floor(Math.random() * availableEvents.length)];
};

// 用于跟踪最近使用的事件（避免重复）
const recentEventIds = new Set<string>();
const RECENT_EVENT_LIMIT = 3;

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  runId: null,
  deviceId: null,
  specialEventCount: 0,
  isLLMEnhancing: false,

  // 开始游戏
  startGame: async () => {
    try {
      // 调用后端 API 创建游戏会话
      const response = await apiStartGame();

      set({
        ...initialState,
        status: GameStatus.PLAYING,
        currentRound: 1,
        stats: { ...GAME_CONFIG.initialStats },
        runId: response.runId,
        specialEventCount: 0,
        isLLMEnhancing: false,
      });

      // 清空最近事件记录
      recentEventIds.clear();

      // 抽取第一个事件
      await get().drawEvent();
    } catch (error) {
      console.error('Failed to start game:', error);
      // 如果后端调用失败，仍然可以开始游戏（离线模式）
      set({
        ...initialState,
        status: GameStatus.PLAYING,
        currentRound: 1,
        stats: { ...GAME_CONFIG.initialStats },
        runId: null,
        specialEventCount: 0,
        isLLMEnhancing: false,
      });

      recentEventIds.clear();
      await get().drawEvent();
    }
  },

  // 抽取事件（支持 LLM 增强）
  drawEvent: async () => {
    const state = get();

    if (state.status !== GameStatus.PLAYING) {
      return;
    }

    const round = state.currentRound;
    const stats = state.stats;

    // 1. 检查是否触发特殊事件（第 5/10/15 回合）
    if (get().shouldTriggerSpecialEvent(round, stats)) {
      const specialEvent = await get().generateLLMSpecialEvent();
      if (specialEvent) {
        set((prev) => ({
          ...prev,
          specialEventCount: prev.specialEventCount + 1,
          currentEvent: specialEvent,
        }));
        return;
      }
    }

    // 2. 抽取常规事件
    let eventPool: EventCard[];
    if (round <= 5) {
      // 前期事件 (1-5)
      eventPool = EVENTS.slice(0, 10);
    } else if (round <= 15) {
      // 中期事件 (6-15)
      eventPool = EVENTS.slice(10, 40);
    } else {
      // 后期事件 (16-20)
      eventPool = EVENTS.slice(40, 60);
    }

    // 随机抽取一个事件
    let event = getRandomEvent(eventPool, recentEventIds);

    // 记录到最近事件列表
    recentEventIds.add(event.id);
    if (recentEventIds.size > RECENT_EVENT_LIMIT) {
      const firstId = Array.from(recentEventIds)[0];
      recentEventIds.delete(firstId);
    }

    // 3. 15% 概率调用 LLM 增强描述
    if (Math.random() < LLM_CONFIG.enhanceDescriptionProbability) {
      event = await get().enhanceEventDescription(event);
    }

    set({
      currentEvent: event,
    });
  },

  // 判断是否应该触发特殊事件
  shouldTriggerSpecialEvent: (round: number, stats: PlayerStats) => {
    const state = get();

    // 每局最多 2 次特殊事件
    if (state.specialEventCount >= 2) {
      return false;
    }

    // 固定节点触发（第 5、10、15 回合）
    if ([5, 10, 15].includes(round)) {
      return Math.random() < 0.8; // 80% 概率
    }

    // 危机时刻触发（现金或健康极低）
    if (stats.cash < 20 || stats.health < 20) {
      return Math.random() < 0.3; // 30% 概率
    }

    return false;
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

  // 选择选项
  selectOption: (optionId: string) => {
    const state = get();

    if (!state.currentEvent || state.status !== GameStatus.PLAYING) {
      return;
    }

    // 找到选择的选项
    const option = state.currentEvent.options.find(opt => opt.id === optionId);

    if (!option) {
      console.error('Option not found:', optionId);
      return;
    }

    // 应用效果
    get().applyEffects(option.effects);

    // 将当前事件加入历史
    const eventHistory = [...state.eventHistory, state.currentEvent];

    // 检查游戏是否结束
    const nextRound = state.currentRound + 1;
    const shouldEnd = nextRound > state.maxRounds;

    if (shouldEnd) {
      // 达到最大回合数
      const score = get().calculateScore();
      const progress = get().stats.progress;

      let endReason: EndReason;
      if (progress >= GAME_CONFIG.winConditions.minProgress) {
        endReason = EndReason.PROJECT_COMPLETE;
      } else {
        endReason = EndReason.MAX_ROUNDS;
      }

      set({
        status: GameStatus.COMPLETED,
        eventHistory,
        currentEvent: null,
        score,
        endReason,
      });
    } else {
      // 继续下一回合
      set({
        currentRound: nextRound,
        eventHistory,
        currentEvent: null,
      });

      // 检查是否有指标归零（失败）
      get().checkGameEnd();

      // 如果游戏还在进行，抽取下一个事件
      if (get().status === GameStatus.PLAYING) {
        get().drawEvent();
      }
    }
  },

  // 应用效果到玩家状态
  applyEffects: (effects: Effects) => {
    const currentStats = get().stats;

    const newStats: PlayerStats = {
      cash: clampStat(currentStats.cash + (effects.cash || 0)),
      health: clampStat(currentStats.health + (effects.health || 0)),
      reputation: clampStat(currentStats.reputation + (effects.reputation || 0)),
      progress: clampStat(currentStats.progress + (effects.progress || 0)),
      quality: clampStat(currentStats.quality + (effects.quality || 0)),
    };

    set({ stats: newStats });
  },

  // 检查游戏是否结束
  checkGameEnd: () => {
    const state = get();
    const { stats } = state;

    // 检查关键指标是否归零
    for (const statKey of GAME_CONFIG.loseConditions.criticalStats) {
      if (stats[statKey] <= 0) {
        const score = get().calculateScore();

        let endReason: EndReason;
        if (statKey === 'cash') {
          endReason = EndReason.OUT_OF_CASH;
        } else if (statKey === 'health') {
          endReason = EndReason.HEALTH_DEPLETED;
        } else {
          endReason = EndReason.MAX_ROUNDS;
        }

        set({
          status: GameStatus.FAILED,
          score,
          endReason,
        });
        return;
      }
    }

    // 检查是否提前完成项目
    if (stats.progress >= GAME_CONFIG.winConditions.minProgress &&
        stats.quality >= GAME_CONFIG.winConditions.minQuality) {
      const score = get().calculateScore();

      set({
        status: GameStatus.COMPLETED,
        score,
        endReason: EndReason.PROJECT_COMPLETE,
      });
    }
  },

  // 计算最终分数
  calculateScore: () => {
    const state = get();
    const { stats, currentRound, maxRounds } = state;

    // 基础分
    let score = SCORING.baseScore;

    // 各项指标得分
    score += stats.cash * SCORING.statWeights.cash;
    score += stats.health * SCORING.statWeights.health;
    score += stats.reputation * SCORING.statWeights.reputation;
    score += stats.progress * SCORING.statWeights.progress;
    score += stats.quality * SCORING.statWeights.quality;

    // 完成项目奖励
    if (stats.progress >= GAME_CONFIG.winConditions.minProgress) {
      score += SCORING.completeBonus;

      // 提前完成奖励
      const roundsLeft = maxRounds - currentRound;
      if (roundsLeft > 0) {
        score += roundsLeft * SCORING.earlyCompletionBonus;
      }
    }

    // 健康惩罚
    if (stats.health < SCORING.healthPenalty.threshold) {
      const penalty = (SCORING.healthPenalty.threshold - stats.health) *
                     SCORING.healthPenalty.multiplier;
      score += penalty; // multiplier is negative
    }

    // 质量奖励
    if (stats.quality >= SCORING.qualityBonus.threshold) {
      const bonus = (stats.quality - SCORING.qualityBonus.threshold) *
                   SCORING.qualityBonus.multiplier;
      score += bonus;
    }

    // 确保分数不为负
    return Math.max(0, Math.round(score));
  },

  // 重置游戏
  resetGame: () => {
    recentEventIds.clear();
    set({
      ...initialState,
      runId: null,
      deviceId: null,
      specialEventCount: 0,
      isLLMEnhancing: false,
    });
  },

  // 上传成绩到后端
  uploadScore: async () => {
    const state = get();

    // 如果没有 runId，说明是离线模式，不上传
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
      // 上传失败不影响游戏继续
    }
  },
}));

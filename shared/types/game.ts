/**
 * 游戏状态类型定义
 */

import { PlayerStats } from './player';
import { EventCard } from './event';

export enum GameStatus {
  IDLE = 'idle',           // 未开始
  PLAYING = 'playing',     // 进行中
  PAUSED = 'paused',       // 暂停
  COMPLETED = 'completed', // 完成（通关）
  FAILED = 'failed',       // 失败（任一指标归零）
}

export enum EndReason {
  PROJECT_COMPLETE = 'project_complete', // 项目完成
  OUT_OF_CASH = 'out_of_cash',           // 现金耗尽
  HEALTH_DEPLETED = 'health_depleted',   // 健康耗尽
  MAX_ROUNDS = 'max_rounds',             // 达到最大回合数
}

export interface GameState {
  status: GameStatus;
  currentRound: number;
  maxRounds: number;
  stats: PlayerStats;
  currentEvent: EventCard | null;
  eventHistory: EventCard[];
  score: number;
  endReason?: EndReason;
}

export interface GameConfig {
  maxRounds: number;
  initialStats: PlayerStats;
  winConditions: {
    minProgress: number;
    minQuality: number;
  };
  loseConditions: {
    criticalStats: Array<keyof PlayerStats>; // 这些指标归零即失败
  };
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
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

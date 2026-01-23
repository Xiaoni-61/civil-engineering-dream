/**
 * 玩家状态类型定义
 */

export interface PlayerStats {
  cash: number;        // 现金 (0-100)
  health: number;      // 健康 (0-100)
  reputation: number;  // 声誉 (0-100)
  progress: number;    // 进度 (0-100)
  quality: number;     // 质量 (0-100)
}

export interface Effects {
  cash?: number;
  health?: number;
  reputation?: number;
  progress?: number;
  quality?: number;
}

export const INITIAL_STATS: PlayerStats = {
  cash: 50,
  health: 100,
  reputation: 50,
  progress: 0,
  quality: 50,
};

export const MAX_STAT_VALUE = 100;
export const MIN_STAT_VALUE = 0;

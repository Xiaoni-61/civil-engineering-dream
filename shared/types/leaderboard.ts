/**
 * 排行榜类型定义
 */

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  rounds: number;
  finalProgress: number;
  finalQuality: number;
  timestamp: number; // Unix 时间戳
  endReason: string;
}

export interface LeaderboardQuery {
  limit?: number;
  offset?: number;
  sortBy?: 'score' | 'timestamp';
  order?: 'asc' | 'desc';
}

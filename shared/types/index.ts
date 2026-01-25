/**
 * 共享类型定义统一导出
 */

// Player types
export type {
  PlayerStats,
  Effects,
} from './player';

export {
  INITIAL_STATS,
  MAX_STAT_VALUE,
  MIN_STAT_VALUE,
} from './player';

// Event types
export type {
  EventOption,
  EventCard,
  EventTriggerCondition,
} from './event';

export {
  EventType,
} from './event';

// Game types
export type {
  GameState,
  GameConfig,
  RankConfig,
  MaterialConfig,
  MaterialInventory,
  MaterialPrice,
  RelationshipConfig,
  RelationshipState,
  QuarterSettlement,
  GameStats,
  TradeResult,
  MaintenanceResult,
} from './game';

export {
  GameStatus,
  EndReason,
  Rank,
  MaterialType,
  RelationshipType,
  RANK_CONFIGS,
  MATERIAL_CONFIGS,
  RELATIONSHIP_CONFIGS,
} from './game';

// Leaderboard types
export type {
  LeaderboardEntry,
  LeaderboardQuery,
} from './leaderboard';

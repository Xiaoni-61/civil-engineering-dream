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

// Character types
export type {
  CharacterCreation,
  CharacterEvaluation,
} from './character';

export {
  RANDOM_NAMES,
  EVALUATIONS,
} from './character';

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
  RelationshipNegativeEvent,
  RelationshipNegativeEventTrigger,
  RelationshipNegativeEventEffects,
  QuarterSettlement,
  GameStats,
  TradeResult,
  MaintenanceResult,
  ActionConfig,
  AbilityEffects,
  AbilityRequirement,
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
  GamePhase,
  ActionType,
  EventStatus,
} from './game';

// Leaderboard types
export type {
  LeaderboardEntry,
  LeaderboardQuery,
} from './leaderboard';

// Team types
export type {
  TeamMember,
  TeamIssue,
  TeamState,
} from './team';

export {
  TeamMemberType,
} from './team';

// Save types
export type {
  SaveGameState,
  SaveSlot,
  SaveGameRequest,
  SaveGameResponse,
  GetSavesListResponse,
  LoadGameRequest,
  LoadGameResponse,
  DeleteSaveRequest,
  DeleteSaveResponse,
  PricePrediction,
} from './save';

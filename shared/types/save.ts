/**
 * 存档系统类型定义
 */

import { PlayerStats } from './player';
import {
  Rank,
  GameStatus,
  EndReason,
  GamePhase,
  MaterialType,
  MaterialPrice,
  GameStats,
  RelationshipType,
} from './game';
import { TeamState } from './team';
import { DecisionEvent, EventResult } from '../../frontend/src/data/events/eventTypes';
import { EventCard } from './event';

/**
 * 价格预测类型
 */
export interface PricePrediction {
  trend: 'up' | 'down' | 'stable';
  minPrice: number;
  maxPrice: number;
  accuracy: number;
  eventChance: number;
}

/**
 * 完整游戏状态（用于保存/加载）
 * 包含游戏运行时所有必要的状态数据
 */
export interface SaveGameState {
  // ==================== 玩家基础信息 ====================
  playerName?: string;
  playerGender?: 'male' | 'female';
  runId: string | null;
  deviceId: string | null;

  // ==================== 核心数值 ====================
  stats: PlayerStats;
  score: number;

  // ==================== 游戏进度 ====================
  status: GameStatus;
  currentQuarter: number;
  maxActionsPerQuarter: number;
  phase: GamePhase;
  endReason?: EndReason;

  // ==================== 职级系统 ====================
  rank: Rank;
  actualSalary: number;
  gameStats: GameStats;

  // ==================== 材料系统 ====================
  inventory: Record<MaterialType, number>;
  materialPrices: Record<MaterialType, MaterialPrice>;
  materialPriceHistory: Record<MaterialType, number[]>;
  nextQuarterRealPrices: Record<MaterialType, number> | null;
  pricePredictions: Record<MaterialType, PricePrediction> | null;

  // ==================== 关系系统 ====================
  relationships: Record<RelationshipType, number>;
  maintenanceCount: number;
  materialTradeCount: number;
  maintainedRelationships: RelationshipType[];

  // ==================== 项目状态 ====================
  projectProgress: number;
  projectQuality: number;
  projectCompletedThisQuarter: boolean;

  // ==================== 团队系统 ====================
  team: TeamState;

  // ==================== 事件系统 ====================
  currentEvent: EventCard | null;
  eventHistory: EventCard[];
  pendingEvents: EventCard[];
  quarterEvents: DecisionEvent[];
  currentEventIndex: number;
  completedEventResults: EventResult[];
  allEventHistory: EventResult[];
  pendingEventResult: EventResult | null;
  showEventResult: boolean;

  // ==================== 行动系统 ====================
  actionPoints: number;
  maxActionPoints: number;
  actionsThisQuarter: number;
  actionsSinceLastEventCheck: number;
  currentQuarterActionCounts: Record<string, number>;

  // ==================== 训练系统 ====================
  trainingCooldowns: {
    basic_work: number;
    advanced_work: number;
    basic_luck: number;
    advanced_luck: number;
  };
  currentQuarterTrainingCounts: Record<string, number>;

  // ==================== 特殊效果 ====================
  pricePredictionBonus: number;
  storageFeeDiscount: number;
  qualityProjectJustCompleted: boolean;

  // ==================== 关键决策记录 ====================
  keyDecisions: Array<{
    event: string;
    choice: string;
    quarter: number;
    timestamp: Date;
  }>;

  // ==================== 季度行动记录 ====================
  quarterlyActions: Array<{
    quarter: number;
    actions: Array<{
      type: string;
      count: number;
    }>;
    training: Array<{
      type: string;
      count: number;
    }>;
  }>;

  // ==================== LLM 相关 ====================
  specialEventCount: number;
  isLLMEnhancing: boolean;

  // ==================== 当前季度结算数据 ====================
  currentSettlement: any | null;
}

/**
 * 存档槽位信息（用于列表展示）
 */
export interface SaveSlot {
  slotId: 1 | 2;
  hasSlot: boolean;
  runId?: string;
  playerName?: string;
  rank?: Rank;
  currentQuarter?: number;
  updatedAt?: string; // ISO 8601 日期字符串
  playtime?: number; // 游戏时长（秒）
}

/**
 * 保存游戏请求
 */
export interface SaveGameRequest {
  slotId: 1 | 2;
  gameState: SaveGameState;
}

/**
 * 保存游戏响应
 */
export interface SaveGameResponse {
  success: boolean;
  message?: string;
  saveSlot?: SaveSlot;
}

/**
 * 获取存档列表响应
 */
export interface GetSavesListResponse {
  slots: SaveSlot[];
}

/**
 * 加载游戏请求
 */
export interface LoadGameRequest {
  slotId: 1 | 2;
}

/**
 * 加载游戏响应
 */
export interface LoadGameResponse {
  success: boolean;
  message?: string;
  gameState?: SaveGameState;
}

/**
 * 删除存档请求
 */
export interface DeleteSaveRequest {
  slotId: 1 | 2;
}

/**
 * 删除存档响应
 */
export interface DeleteSaveResponse {
  success: boolean;
  message?: string;
}

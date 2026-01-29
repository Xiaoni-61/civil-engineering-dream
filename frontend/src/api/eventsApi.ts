/**
 * 事件相关 API 客户端
 * 负责与后端的事件 API 交互
 */

import { apiRequest } from './gameApi';

/**
 * 事件系统健康状态响应
 */
export interface EventsHealthResponse {
  status: string;
  todayGenerated: number;
  totalEvents: number;
  bySourceType: {
    news: number;
    creative: number;
  };
  schedulerStatus?: {
    isRunning: boolean;
    tasks: {
      dailyGeneration: { status: string };
      cleanup: { status: string };
      supplement: { status: string };
    };
  };
}

/**
 * 单个新闻事件
 */
export interface NewsItem {
  id: string;
  title: string;
  url: string | null;
  eventTitle: string;
  eventDescription: string;
  createdAt: string;
}

/**
 * 今日新闻响应
 */
export interface TodayNewsResponse {
  count: number;
  news: NewsItem[];
}

/**
 * 事件选项
 */
export interface EventOption {
  text: string;
  effects: Record<string, number>;
}

/**
 * 动态事件数据
 */
export interface DynamicEvent {
  id: string;
  title: string;
  description: string;
  options: EventOption[];
  minRank: string;
  maxRank: string;
}

/**
 * 动态事件响应
 */
export interface DynamicEventResponse {
  event: DynamicEvent;
  sourceType: 'news' | 'creative';
  decayWeight: number;
}

/**
 * 事件使用记录请求参数
 */
export interface RecordEventUsageParams {
  eventId: string;
  playerName?: string;
  playerRank?: string;
  choiceIndex?: number;
}

/**
 * 传记生成输入数据
 */
export interface BiographyInput {
  playerName: string;
  finalRank: string;
  endReason: string;
  quartersPlayed: number;
  finalStats: {
    cash: number;
    health: number;
    reputation: number;
    workAbility: number;
    luck: number;
  };
  gameStats: {
    completedProjects: number;
    qualityProjects: number;
  };
  keyDecisions: Array<{
    event: string;
    choice: string;
  }>;
  quarterlyActions?: Array<{
    quarter: number;
    actions: Array<{ type: string; count: number }>;
    training: Array<{ type: string; count: number }>;
  }>;
}

/**
 * API 错误响应
 */
export interface ApiError {
  code: string;
  message: string;
}

/**
 * 获取事件系统健康状态
 * GET /api/events/health
 */
export async function getEventsHealth(): Promise<EventsHealthResponse> {
  try {
    const response = await apiRequest('/api/events/health');
    return response.data;
  } catch (error) {
    console.error('获取事件系统健康状态失败:', error);
    throw error;
  }
}

/**
 * 获取今日新闻源列表
 * GET /api/events/news
 */
export async function getTodayNews(): Promise<TodayNewsResponse> {
  try {
    const response = await apiRequest('/api/events/news');
    return response.data;
  } catch (error) {
    console.error('获取今日新闻失败:', error);
    throw error;
  }
}

/**
 * 获取可用的动态事件（游戏时使用）
 * GET /api/events?playerRank=xxx
 */
export async function getDynamicEvent(playerRank?: string): Promise<DynamicEventResponse> {
  try {
    const queryParams = playerRank ? `?playerRank=${encodeURIComponent(playerRank)}` : '';
    const response = await apiRequest(`/api/events${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('获取动态事件失败:', error);
    throw error;
  }
}

/**
 * 记录事件使用情况
 * POST /api/events/:eventId/use
 */
export async function recordEventUsage(
  eventId: string,
  playerName?: string,
  playerRank?: string,
  choiceIndex?: number
): Promise<{ message: string; eventId: string; usageCount: number }> {
  try {
    const response = await apiRequest(`/api/events/${eventId}/use`, {
      method: 'POST',
      body: JSON.stringify({
        playerName,
        playerRank,
        choiceIndex,
      }),
    });
    return response.data;
  } catch (error) {
    console.error('记录事件使用失败:', error);
    throw error;
  }
}

/**
 * 生成职业传记
 * POST /api/run/:gameId/biography
 *
 * 注意：此 API 需要在后端实现（Task 12）
 * 目前此函数为占位符，实际使用时需要后端支持
 */
export async function generateBiography(
  gameId: string,
  gameData: BiographyInput
): Promise<string> {
  try {
    const response = await apiRequest(`/api/run/${gameId}/biography`, {
      method: 'POST',
      body: JSON.stringify(gameData),
    });
    return response.data.biography;
  } catch (error) {
    console.error('生成传记失败:', error);
    throw error;
  }
}

/**
 * 分享传记（生成可分享链接或短码）
 * POST /api/run/:gameId/biography/share
 *
 * 注意：此 API 需要在后端实现（Task 12）
 * 目前此函数为占位符，实际使用时需要后端支持
 */
export async function shareBiography(
  gameId: string
): Promise<{ shareUrl: string; shortCode: string }> {
  try {
    const response = await apiRequest(`/api/run/${gameId}/biography/share`, {
      method: 'POST',
    });
    return response.data;
  } catch (error) {
    console.error('分享传记失败:', error);
    throw error;
  }
}

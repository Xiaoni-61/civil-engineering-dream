/**
 * 事件相关 API 客户端
 * 负责与后端的事件 API 交互
 */

import { apiRequest } from './gameApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

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
 * 生成职业传记（流式）
 * POST /api/run/:gameId/biography
 *
 * 支持取消操作和实时进度回调
 */
export async function generateBiographyStream(
  gameId: string,
  gameData: BiographyInput,
  callbacks: {
    onChunk: (chunk: string) => void;
    onComplete: (content: string) => void;
    onError: (error: string, partialContent?: string) => void;
  },
  signal?: AbortSignal
): Promise<void> {
  const url = `${API_BASE_URL}/api/run/${gameId}/biography`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gameData),
      signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: '网络错误' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留不完整的行

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          try {
            const event = JSON.parse(data);

            switch (event.type) {
              case 'start':
                console.log('开始生成传记');
                break;
              case 'chunk':
                fullContent += event.content;
                callbacks.onChunk(event.content);
                break;
              case 'complete':
                callbacks.onComplete(event.content);
                break;
              case 'error':
                callbacks.onError(event.error, event.content);
                break;
              case 'timeout':
                callbacks.onError('生成超时', event.content);
                break;
            }
          } catch (e) {
            console.error('解析 SSE 数据失败:', e);
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      callbacks.onError('生成已取消');
    } else {
      callbacks.onError(error instanceof Error ? error.message : '未知错误');
    }
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

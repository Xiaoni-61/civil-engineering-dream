/**
 * LLM API 客户端
 * 调用后端的 LLM 增强接口（前端不直接调用 LLM API）
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * API 请求封装
 */
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('LLM API 请求失败:', error);
    throw error;
  }
}

/**
 * 增强事件描述
 * POST /api/llm/enhance
 */
export async function enhanceDescription(params: {
  baseEvent: {
    id: string;
    title: string;
    description: string;
  };
  stats: {
    cash: number;
    health: number;
    reputation: number;
    progress: number;
    quality: number;
  };
  round: number;
}): Promise<{ description: string } | null> {
  try {
    const response = await apiRequest('/api/llm/enhance', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (response.code === 'SUCCESS' && response.success) {
      return response.data;
    }

    // LLM 不可用或失败，返回降级数据
    if (response.fallback) {
      return { description: response.fallback };
    }

    return null;
  } catch (error) {
    console.warn('LLM 增强失败，使用原始描述');
    return null;
  }
}

/**
 * 生成特殊事件
 * POST /api/llm/special-event
 */
export async function generateSpecialEvent(params: {
  stats: {
    cash: number;
    health: number;
    reputation: number;
    progress: number;
    quality: number;
  };
  round: number;
}): Promise<any | null> {
  try {
    const response = await apiRequest('/api/llm/special-event', {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (response.code === 'SUCCESS' && response.success) {
      return response.data;
    }

    // LLM 不可用或失败，返回降级预设事件
    if (response.fallback) {
      return response.fallback;
    }

    return null;
  } catch (error) {
    console.warn('LLM 特殊事件生成失败');
    return null;
  }
}

/**
 * 检查 LLM 服务状态
 * GET /api/llm/status
 */
export async function getLLMStatus(): Promise<{
  available: boolean;
  provider: string;
  model: string;
} | null> {
  try {
    const response = await apiRequest('/api/llm/status', {
      method: 'GET',
    });

    if (response.code === 'SUCCESS') {
      return {
        available: response.available,
        provider: response.provider,
        model: response.model,
      };
    }

    return null;
  } catch (error) {
    console.warn('LLM 状态检查失败');
    return null;
  }
}

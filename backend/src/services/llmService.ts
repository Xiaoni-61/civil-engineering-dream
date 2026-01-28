/**
 * LLM 服务核心
 * 负责调用 LLM API、管理提供商、处理错误
 */

import { createLogger, PerformanceMonitor, MetricsCollector } from '../utils/logger.js';

const logger = createLogger('LLMService');
const perf = new PerformanceMonitor('LLMService');
const metrics = new MetricsCollector('LLMService');

interface LLMProvider {
  name: string;
  baseURL: string;
  apiKey: string;
  model: string;
}

interface LLMRequest {
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
}

interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
  };
}

/**
 * LLM 服务配置
 */
const llmConfig = {
  // 使用环境变量中的配置
  provider: process.env.LLM_PROVIDER || 'doubao', // 'openai' | 'deepseek' | 'anthropic' | 'doubao'
  apiKey: process.env.LLM_API_KEY || '',
  baseURL: process.env.LLM_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3',
  model: process.env.LLM_MODEL || 'doubao-seed-1-6-lite-251015',
  timeout: 30000, // 30秒超时
};

/**
 * 可用的 LLM 提供商配置
 */
const providers: Record<string, Partial<LLMProvider>> = {
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
  },
  deepseek: {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
  },
  anthropic: {
    name: 'Anthropic',
    baseURL: 'https://api.anthropic.com/v1',
    model: 'claude-3-haiku-20240307',
  },
  doubao: {
    name: '火山引擎豆包',
    baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
    model: 'doubao-seed-1-6-lite-251015',
  },
};

/**
 * 调用 LLM API
 */
export async function callLLM(request: LLMRequest): Promise<LLMResponse> {
  // 运行时读取环境变量，避免模块加载时机问题
  const providerName = process.env.LLM_PROVIDER || llmConfig.provider;
  const provider = providers[providerName];
  const baseURL = process.env.LLM_BASE_URL || llmConfig.baseURL || provider?.baseURL;
  const model = process.env.LLM_MODEL || llmConfig.model || provider?.model;
  const apiKey = process.env.LLM_API_KEY || llmConfig.apiKey;

  if (!apiKey) {
    logger.error('LLM_API_KEY not configured');
    throw new Error('LLM_API_KEY not configured');
  }

  // 根据提供商构建请求
  const isAnthropic = providerName === 'anthropic';
  const url = `${baseURL}/chat/completions`;

  const body = {
    model,
    messages: request.messages,
    max_tokens: request.max_tokens || 1000,
    temperature: request.temperature || 0.7,
  };

  logger.debug('调用 LLM API', {
    provider: providerName,
    model,
    maxTokens: body.max_tokens,
    temperature: body.temperature,
  });

  try {
    const startTime = Date.now();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(llmConfig.timeout),
    });

    const duration = Date.now() - startTime;
    metrics.record('llm_call_duration', duration);

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('LLM API error', {
        status: response.status,
        error: errorText,
        duration: `${duration}ms`,
      });
      throw new Error(`LLM API error: ${response.status} - ${errorText}`);
    }

    const data: any = await response.json();

    // 解析响应 (OpenAI/豆包格式)
    const content = data.choices?.[0]?.message?.content || '';
    const usage = data.usage;

    // 记录 token 使用情况
    if (usage) {
      metrics.record('llm_prompt_tokens', usage.prompt_tokens);
      metrics.record('llm_completion_tokens', usage.completion_tokens);
      logger.debug('LLM token usage', {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.prompt_tokens + usage.completion_tokens,
        duration: `${duration}ms`,
      });
    }

    logger.success('LLM API 调用成功', {
      duration: `${duration}ms`,
      contentLength: content.length,
    });

    return { content, usage };
  } catch (error) {
    metrics.record('llm_error', 1);
    logger.error('LLM API call failed', error as Error);
    throw error;
  }
}

/**
 * 增强事件描述
 */
export async function enhanceDescription(
  baseEvent: { id: string; title: string; description: string },
  stats: { cash: number; health: number; reputation: number; progress: number; quality: number },
  round: number
): Promise<string> {
  const { buildEnhancePrompt } = await import('../utils/promptTemplates.js');

  const prompt = buildEnhancePrompt({
    title: baseEvent.title,
    description: baseEvent.description,
    stats,
    round,
  });

  const response = await callLLM({
    messages: [
      { role: 'system', content: '你是土木工程游戏的内容编辑，擅长将平淡的事件描述改写得更生动有趣。' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
    max_tokens: 300,
  });

  // 清理返回的内容
  let enhanced = response.content.trim();
  // 移除可能的引号
  enhanced = enhanced.replace(/^["']|["']$/g, '');

  return enhanced;
}

/**
 * 生成特殊事件
 */
export async function generateSpecialEvent(
  stats: { cash: number; health: number; reputation: number; progress: number; quality: number },
  round: number
): Promise<any> {
  const { buildSpecialEventPrompt } = await import('../utils/promptTemplates.js');

  const prompt = buildSpecialEventPrompt({ stats, round });

  const response = await callLLM({
    messages: [
      { role: 'system', content: '你是土木工程游戏的资深策划，擅长设计平衡有趣的随机事件。' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.9,
    max_tokens: 1000,
  });

  // 解析 JSON
  let event: any;
  try {
    // 尝试提取 JSON（可能包含在 markdown 代码块中）
    let content = response.content.trim();
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      content = jsonMatch[1];
    }
    event = JSON.parse(content);
  } catch (e) {
    throw new Error('Failed to parse LLM response as JSON');
  }

  // 验证并修正事件结构
  if (!event.title || !event.description || !event.options || !Array.isArray(event.options)) {
    throw new Error('Invalid event structure from LLM');
  }

  // 确保 3 个选项
  if (event.options.length < 3) {
    throw new Error('Event must have at least 3 options');
  }

  // 修正数值范围
  event.options = event.options.slice(0, 3).map((opt: any, index: number) => ({
    id: opt.id || `llm_opt_${index + 1}`,
    text: opt.text || '未知选项',
    effects: {
      cash: Math.max(-30, Math.min(30, opt.effects?.cash || 0)),
      health: Math.max(-30, Math.min(30, opt.effects?.health || 0)),
      reputation: Math.max(-30, Math.min(30, opt.effects?.reputation || 0)),
      progress: Math.max(-30, Math.min(30, opt.effects?.progress || 0)),
      quality: Math.max(-30, Math.min(30, opt.effects?.quality || 0)),
    },
    feedback: opt.feedback || '已做出选择',
  }));

  // 添加标记
  event.id = `llm_special_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  event.llmEnhanced = true;
  event.isSpecialEvent = true;

  return event;
}

/**
 * 检查 LLM 是否可用
 * 运行时直接读取环境变量，避免模块加载时机问题
 */
export function isLLMAvailable(): boolean {
  return !!(process.env.LLM_API_KEY || llmConfig.apiKey);
}

export { llmConfig };

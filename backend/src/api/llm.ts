/**
 * LLM API 路由
 * 处理前端发起的 LLM 增强请求
 */

import { Router, Request, Response } from 'express';
import { llmCache } from '../services/llmCache.js';
import {
  enhanceDescription,
  generateSpecialEvent,
  isLLMAvailable,
} from '../services/llmService.js';
import {
  getFallbackDescription,
  getPresetSpecialEvent,
} from '../utils/promptTemplates.js';

export function createLLMRouter(): Router {
  const router = Router();

  /**
   * POST /api/llm/enhance
   * 增强事件描述
   */
  router.post('/enhance', async (req: Request, res: Response) => {
    try {
      const { baseEvent, stats, round } = req.body;

      if (!baseEvent || !stats) {
        return res.status(400).json({
          code: 'MISSING_PARAMS',
          message: '缺少必要参数',
        });
      }

      // 检查 LLM 是否可用
      if (!isLLMAvailable()) {
        console.log('LLM not configured, using fallback');
        return res.json({
          code: 'LLM_NOT_AVAILABLE',
          success: false,
          fallback: getFallbackDescription(baseEvent.id),
        });
      }

      // 检查缓存
      const cacheKey = llmCache.generateKey('enhance', {
        eventId: baseEvent.id,
        stats: JSON.stringify(stats),
        round,
      });
      const cached = llmCache.get(cacheKey);
      if (cached) {
        return res.json({
          code: 'SUCCESS',
          success: true,
          data: { description: cached },
          fromCache: true,
        });
      }

      // 调用 LLM
      const enhanced = await enhanceDescription(baseEvent, stats, round);

      // 缓存结果
      llmCache.set(cacheKey, enhanced);

      return res.json({
        code: 'SUCCESS',
        success: true,
        data: { description: enhanced },
      });
    } catch (error) {
      console.error('❌ /api/llm/enhance 错误：', error);

      // 降级处理
      const fallback = req.body?.baseEvent
        ? getFallbackDescription(req.body.baseEvent.id)
        : null;

      return res.json({
        code: 'ERROR',
        success: false,
        fallback,
        message: (error as Error).message,
      });
    }
  });

  /**
   * POST /api/llm/special-event
   * 生成特殊事件
   */
  router.post('/special-event', async (req: Request, res: Response) => {
    try {
      const { stats, round } = req.body;

      if (!stats || round === undefined) {
        return res.status(400).json({
          code: 'MISSING_PARAMS',
          message: '缺少必要参数',
        });
      }

      // 检查 LLM 是否可用
      if (!isLLMAvailable()) {
        console.log('LLM not configured, using preset event');
        return res.json({
          code: 'LLM_NOT_AVAILABLE',
          success: false,
          fallback: getPresetSpecialEvent(),
        });
      }

      // 调用 LLM 生成特殊事件
      const specialEvent = await generateSpecialEvent(stats, round);

      return res.json({
        code: 'SUCCESS',
        success: true,
        data: specialEvent,
      });
    } catch (error) {
      console.error('❌ /api/llm/special-event 错误：', error);

      // 降级处理
      return res.json({
        code: 'ERROR',
        success: false,
        fallback: getPresetSpecialEvent(),
        message: (error as Error).message,
      });
    }
  });

  /**
   * GET /api/llm/status
   * 检查 LLM 服务状态
   */
  router.get('/status', (req: Request, res: Response) => {
    res.json({
      code: 'SUCCESS',
      available: isLLMAvailable(),
      provider: process.env.LLM_PROVIDER || 'deepseek',
      model: process.env.LLM_MODEL || 'deepseek-chat',
    });
  });

  return router;
}

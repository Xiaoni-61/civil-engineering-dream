import { Router, Request, Response } from 'express';
import type { Database } from '../database/init.js';

// 事件类型定义
export type AnalyticsEventType =
  | 'visit'        // 访问首页
  | 'game_start'   // 开始新游戏
  | 'game_load'    // 加载存档
  | 'game_save'    // 保存游戏
  | 'game_end'     // 游戏结束
  | 'quarter_end'; // 季度结算

interface AnalyticsEvent {
  device_id: string;
  event_type: AnalyticsEventType;
  event_data?: Record<string, any>;
}

export function createAnalyticsRouter(db: Database): Router {
  const router = Router();

  /**
   * POST /api/analytics/event
   * 记录用户行为事件
   */
  router.post('/event', async (req: Request, res: Response) => {
    try {
      const { device_id, event_type, event_data } = req.body as AnalyticsEvent;

      if (!device_id || !event_type) {
        return res.status(400).json({ error: '缺少必要参数' });
      }

      await db.run(
        `INSERT INTO activity_logs (device_id, event_type, event_data) VALUES (?, ?, ?)`,
        [device_id, event_type, event_data ? JSON.stringify(event_data) : null]
      );

      res.json({ success: true });
    } catch (error) {
      console.error('记录事件失败:', error);
      res.status(500).json({ error: '记录事件失败' });
    }
  });

  /**
   * POST /api/analytics/batch
   * 批量记录用户行为事件
   */
  router.post('/batch', async (req: Request, res: Response) => {
    try {
      const events = req.body.events as AnalyticsEvent[];

      if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ error: '事件列表为空' });
      }

      for (const event of events) {
        if (event.device_id && event.event_type) {
          await db.run(
            `INSERT INTO activity_logs (device_id, event_type, event_data) VALUES (?, ?, ?)`,
            [
              event.device_id,
              event.event_type,
              event.event_data ? JSON.stringify(event.event_data) : null,
            ]
          );
        }
      }

      res.json({ success: true, count: events.length });
    } catch (error) {
      console.error('批量记录事件失败:', error);
      res.status(500).json({ error: '批量记录事件失败' });
    }
  });

  return router;
}

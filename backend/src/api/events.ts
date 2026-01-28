/**
 * 事件相关 API
 *
 * 负责处理动态事件的查询、抽取和使用记录
 */

import { Router, Request, Response } from 'express';
import { Database } from '../database/init.js';
import { getScheduler } from '../services/scheduler.js';
import { EVENT_POOL_CONFIG } from '../config/rss-sources.js';

/**
 * 动态事件数据库行接口
 */
interface DynamicEventRow {
  id: number;
  event_id: string;
  source_type: string;
  source_url: string | null;
  news_title: string | null;
  title: string;
  description: string;
  options: string; // JSON string
  min_rank: string;
  max_rank: string;
  base_weight: number;
  created_at: string;
  last_used_at: string | null;
  usage_count: number;
}

/**
 * 带衰减权重的事件
 */
interface EventWithDecayWeight {
  event: DynamicEventRow;
  decayWeight: number;
}

/**
 * 创建事件 API 路由
 */
export function createEventsRouter(db: Database): Router {
  const router = Router();

  /**
   * GET /api/events/health
   * 查看事件系统健康状态
   */
  router.get('/health', async (req: Request, res: Response) => {
    try {
      // 获取调度器状态
      const scheduler = getScheduler();
      const schedulerStatus = scheduler ? scheduler.getStatus() : null;

      // 统计今日生成的事件数
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEvents = await db.all<{ count: number }>(
        `SELECT COUNT(*) as count FROM dynamic_events
         WHERE datetime(created_at) >= datetime(?)`,
        [todayStart.toISOString()]
      );
      const todayGenerated = todayEvents[0]?.count || 0;

      // 统计总事件数
      const totalEventsResult = await db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM dynamic_events'
      );
      const totalEvents = totalEventsResult?.count || 0;

      // 按类型统计
      const newsEvents = await db.all<{ count: number }>(
        `SELECT COUNT(*) as count FROM dynamic_events WHERE source_type = 'news'`
      );
      const creativeEvents = await db.all<{ count: number }>(
        `SELECT COUNT(*) as count FROM dynamic_events WHERE source_type = 'creative'`
      );

      res.status(200).json({
        code: 'SUCCESS',
        data: {
          status: schedulerStatus?.isRunning ? 'healthy' : 'warning',
          todayGenerated,
          totalEvents,
          bySourceType: {
            news: newsEvents[0]?.count || 0,
            creative: creativeEvents[0]?.count || 0,
          },
          schedulerStatus: schedulerStatus || {
            isRunning: false,
            tasks: {
              dailyGeneration: { status: 'unknown' },
              cleanup: { status: 'unknown' },
              supplement: { status: 'unknown' },
            },
          },
        },
      });
    } catch (error) {
      console.error('❌ /events/health 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  /**
   * GET /api/events/news
   * 获取今日新闻源列表
   */
  router.get('/news', async (req: Request, res: Response) => {
    try {
      // 获取今天的起始时间
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // 查询今天生成的新闻事件
      const newsEvents = await db.all<DynamicEventRow>(
        `SELECT * FROM dynamic_events
         WHERE source_type = 'news'
         AND datetime(created_at) >= datetime(?)
         ORDER BY created_at DESC`,
        [todayStart.toISOString()]
      );

      // 格式化响应
      const formattedNews = newsEvents.map((event) => ({
        id: event.event_id,
        title: event.news_title || event.title,
        url: event.source_url,
        eventTitle: event.title,
        eventDescription: event.description,
        createdAt: event.created_at,
      }));

      res.status(200).json({
        code: 'SUCCESS',
        data: {
          count: formattedNews.length,
          news: formattedNews,
        },
      });
    } catch (error) {
      console.error('❌ /events/news 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  /**
   * GET /api/events
   * 获取可用的动态事件（玩家游戏时使用）
   * 查询参数：playerRank（可选）
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { playerRank } = req.query;
      const targetRank = playerRank as string | undefined;

      // 调用事件抽取逻辑
      const drawnEvent = await drawEvent(db, targetRank);

      if (!drawnEvent) {
        return res.status(404).json({
          code: 'NO_EVENTS_AVAILABLE',
          message: '当前没有可用的事件',
        });
      }

      // 解析 options JSON
      const options = JSON.parse(drawnEvent.event.options);

      res.status(200).json({
        code: 'SUCCESS',
        data: {
          event: {
            id: drawnEvent.event.event_id,
            title: drawnEvent.event.title,
            description: drawnEvent.event.description,
            options: options,
            minRank: drawnEvent.event.min_rank,
            maxRank: drawnEvent.event.max_rank,
          },
          sourceType: drawnEvent.event.source_type,
          decayWeight: drawnEvent.decayWeight,
        },
      });
    } catch (error) {
      console.error('❌ /events 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  /**
   * POST /api/events/:eventId/use
   * 记录事件使用情况
   */
  router.post('/:eventId/use', async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const { playerName, playerRank, choiceIndex } = req.body;

      // 验证事件是否存在
      const event = await db.get<DynamicEventRow>(
        'SELECT * FROM dynamic_events WHERE event_id = ?',
        [eventId]
      );

      if (!event) {
        return res.status(404).json({
          code: 'EVENT_NOT_FOUND',
          message: '事件不存在',
        });
      }

      // 插入使用日志
      await db.run(
        `INSERT INTO event_usage_log (event_id, player_name, player_rank, choice_index)
         VALUES (?, ?, ?, ?)`,
        [eventId, playerName || null, playerRank || null, choiceIndex || null]
      );

      // 更新事件的使用统计
      await db.run(
        `UPDATE dynamic_events
         SET usage_count = usage_count + 1,
             last_used_at = datetime('now')
         WHERE event_id = ?`,
        [eventId]
      );

      res.status(200).json({
        code: 'SUCCESS',
        data: {
          message: '事件使用记录已保存',
          eventId,
          usageCount: event.usage_count + 1,
        },
      });
    } catch (error) {
      console.error('❌ /events/:eventId/use 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  return router;
}

/**
 * 获取固定事件池（前端管理的固定事件）
 * TODO: 前端需要提供固定事件列表
 */
async function getFixedEvents(db: Database, playerRank?: string): Promise<DynamicEventRow[]> {
  // 固定事件由前端管理，这里返回空数组
  // 未来如果需要后端管理固定事件，可以从数据库查询
  return [];
}

/**
 * 获取新闻事件池
 */
async function getNewsEvents(db: Database, playerRank?: string): Promise<DynamicEventRow[]> {
  const maxAgeDate = new Date();
  maxAgeDate.setDate(maxAgeDate.getDate() - EVENT_POOL_CONFIG.decay.maxAgeDays);

  let query = `
    SELECT * FROM dynamic_events
    WHERE source_type = 'news'
    AND datetime(created_at) >= datetime(?)
  `;
  const params: any[] = [maxAgeDate.toISOString()];

  if (playerRank) {
    query += ` AND min_rank <= ? AND max_rank >= ?`;
    params.push(playerRank, playerRank);
  }

  query += ` ORDER BY base_weight DESC`;

  return await db.all<DynamicEventRow>(query, params);
}

/**
 * 获取创意事件池
 */
async function getCreativeEvents(db: Database, playerRank?: string): Promise<DynamicEventRow[]> {
  const maxAgeDate = new Date();
  maxAgeDate.setDate(maxAgeDate.getDate() - EVENT_POOL_CONFIG.decay.maxAgeDays);

  let query = `
    SELECT * FROM dynamic_events
    WHERE source_type = 'creative'
    AND datetime(created_at) >= datetime(?)
  `;
  const params: any[] = [maxAgeDate.toISOString()];

  if (playerRank) {
    query += ` AND min_rank <= ? AND max_rank >= ?`;
    params.push(playerRank, playerRank);
  }

  query += ` ORDER BY base_weight DESC`;

  return await db.all<DynamicEventRow>(query, params);
}

/**
 * 按权重选择池子
 */
function selectPoolByWeight(
  candidates: {
    fixed: DynamicEventRow[];
    news: DynamicEventRow[];
    creative: DynamicEventRow[];
  },
  weights: { fixed: number; news: number; creative: number }
): DynamicEventRow[] {
  // 过滤掉空的池子
  const availablePools: { pool: DynamicEventRow[]; weight: number; name: string }[] = [];

  if (candidates.fixed.length > 0) {
    availablePools.push({ pool: candidates.fixed, weight: weights.fixed, name: 'fixed' });
  }
  if (candidates.news.length > 0) {
    availablePools.push({ pool: candidates.news, weight: weights.news, name: 'news' });
  }
  if (candidates.creative.length > 0) {
    availablePools.push({ pool: candidates.creative, weight: weights.creative, name: 'creative' });
  }

  // 如果没有可用池子，返回空数组
  if (availablePools.length === 0) {
    return [];
  }

  // 计算总权重
  const totalWeight = availablePools.reduce((sum, p) => sum + p.weight, 0);

  // 随机选择
  let random = Math.random() * totalWeight;
  for (const entry of availablePools) {
    random -= entry.weight;
    if (random <= 0) {
      console.log(`📊 选择事件池: ${entry.name} (${entry.pool.length} 个事件)`);
      return entry.pool;
    }
  }

  // 默认返回第一个可用池子
  return availablePools[0].pool;
}

/**
 * 计算衰减权重
 */
function calculateDecayWeight(event: DynamicEventRow): number {
  const createdAt = new Date(event.created_at);
  const now = new Date();
  const ageInDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  const decaySchedule = EVENT_POOL_CONFIG.decay.decaySchedule;

  // 按衰减计划查找对应权重
  for (const entry of decaySchedule) {
    if (ageInDays <= entry.days) {
      return event.base_weight * entry.weight;
    }
  }

  // 超过最大天数，权重为 0
  return 0;
}

/**
 * 带衰减权重的随机选择
 */
function weightedSelect(events: DynamicEventRow[]): EventWithDecayWeight | null {
  if (events.length === 0) {
    return null;
  }

  // 计算衰减权重
  const eventsWithWeight: EventWithDecayWeight[] = events.map((event) => ({
    event,
    decayWeight: calculateDecayWeight(event),
  }));

  // 过滤掉权重为 0 的事件
  const validEvents = eventsWithWeight.filter((e) => e.decayWeight > 0);

  if (validEvents.length === 0) {
    console.log('⚠️ 所有事件权重已衰减为 0');
    return null;
  }

  // 计算总权重
  const totalWeight = validEvents.reduce((sum, e) => sum + e.decayWeight, 0);

  // 随机选择
  let random = Math.random() * totalWeight;
  for (const entry of validEvents) {
    random -= entry.decayWeight;
    if (random <= 0) {
      console.log(`🎲 抽取事件: ${entry.event.title} (权重: ${entry.decayWeight.toFixed(2)})`);
      return entry;
    }
  }

  // 默认返回第一个
  return validEvents[0];
}

/**
 * 事件抽取主函数
 */
async function drawEvent(
  db: Database,
  playerRank?: string
): Promise<EventWithDecayWeight | null> {
  try {
    // 1. 从三个池子获取候选
    const candidates = {
      fixed: await getFixedEvents(db, playerRank),
      news: await getNewsEvents(db, playerRank),
      creative: await getCreativeEvents(db, playerRank),
    };

    console.log(`📊 事件池统计 (playerRank: ${playerRank || '任意'}):`);
    console.log(`  - 固定事件: ${candidates.fixed.length} 个`);
    console.log(`  - 新闻事件: ${candidates.news.length} 个`);
    console.log(`  - 创意事件: ${candidates.creative.length} 个`);

    // 2. 按权重随机选择池子
    const selectedPool = selectPoolByWeight(candidates, EVENT_POOL_CONFIG.weights);

    if (selectedPool.length === 0) {
      console.log('⚠️ 没有可用的事件池');
      return null;
    }

    // 3. 从池子按衰减权重抽取
    return weightedSelect(selectedPool);
  } catch (error) {
    console.error('❌ 事件抽取失败:', error);
    return null;
  }
}

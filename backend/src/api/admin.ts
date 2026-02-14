import { Router, Request, Response } from 'express';
import type { Database } from '../database/init.js';

// 管理员密码从环境变量获取
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// 简单的 token 存储（生产环境应使用 JWT 或 Redis）
const adminTokens = new Set<string>();

export function createAdminRouter(db: Database): Router {
  const router = Router();

  /**
   * POST /api/admin/login
   * 管理员登录
   */
  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { password } = req.body;

      if (password === ADMIN_PASSWORD) {
        // 生成简单 token
        const token = Buffer.from(`${Date.now()}:${Math.random()}`).toString('base64');
        adminTokens.add(token);

        // 24小时后过期
        setTimeout(() => adminTokens.delete(token), 24 * 60 * 60 * 1000);

        res.json({ success: true, token });
      } else {
        res.status(401).json({ error: '密码错误' });
      }
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({ error: '登录失败' });
    }
  });

  /**
   * 验证中间件
   */
  const authMiddleware = (req: Request, res: Response, next: Function) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token || !adminTokens.has(token)) {
      return res.status(401).json({ error: '未授权' });
    }

    next();
  };

  /**
   * GET /api/admin/stats
   * 获取统计数据
   */
  router.get('/stats', authMiddleware, async (req: Request, res: Response) => {
    try {
      // 获取日期范围
      const days = parseInt(req.query.days as string) || 7;

      // 1. DAU 统计（最近 N 天）
      const dauQuery = `
        SELECT
          DATE(created_at) as date,
          COUNT(DISTINCT device_id) as count
        FROM activity_logs
        WHERE created_at >= DATE('now', '-${days} days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      const dauData = await db.all<{ date: string; count: number }>(dauQuery);

      // 2. 今日 DAU
      const todayDauQuery = `
        SELECT COUNT(DISTINCT device_id) as count
        FROM activity_logs
        WHERE DATE(created_at) = DATE('now')
      `;
      const todayDau = await db.get<{ count: number }>(todayDauQuery);

      // 3. 本周 WAU
      const wauQuery = `
        SELECT COUNT(DISTINCT device_id) as count
        FROM activity_logs
        WHERE created_at >= DATE('now', '-7 days')
      `;
      const wau = await db.get<{ count: number }>(wauQuery);

      // 4. 本月 MAU
      const mauQuery = `
        SELECT COUNT(DISTINCT device_id) as count
        FROM activity_logs
        WHERE created_at >= DATE('now', '-30 days')
      `;
      const mau = await db.get<{ count: number }>(mauQuery);

      // 5. 事件统计
      const eventStatsQuery = `
        SELECT
          event_type,
          COUNT(*) as count
        FROM activity_logs
        WHERE DATE(created_at) = DATE('now')
        GROUP BY event_type
      `;
      const eventStats = await db.all<{ event_type: string; count: number }>(eventStatsQuery);

      // 6. 游戏局数（game_end 事件）
      const gamesQuery = `
        SELECT
          DATE(created_at) as date,
          COUNT(*) as count
        FROM activity_logs
        WHERE event_type = 'game_end'
        AND created_at >= DATE('now', '-${days} days')
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;
      const gamesData = await db.all<{ date: string; count: number }>(gamesQuery);

      // 7. 职级分布（从存档表获取）
      const rankDistributionQuery = `
        SELECT
          rank,
          COUNT(DISTINCT device_id) as count
        FROM game_saves
        GROUP BY rank
      `;
      const rankDistribution = await db.all<{ rank: string; count: number }>(rankDistributionQuery);

      // 8. 存档总数
      const savesCountQuery = `SELECT COUNT(*) as count FROM game_saves`;
      const savesCount = await db.get<{ count: number }>(savesCountQuery);

      // 9. 排行榜 Top 10
      const leaderboardQuery = `
        SELECT playerName, bestScore, updatedAt
        FROM leaderboard
        ORDER BY bestScore DESC
        LIMIT 10
      `;
      const leaderboard = await db.all(leaderboardQuery);

      // 10. 新用户统计（首次出现的设备）
      const newUsersQuery = `
        SELECT
          DATE(first_appearance) as date,
          COUNT(*) as count
        FROM (
          SELECT device_id, MIN(created_at) as first_appearance
          FROM activity_logs
          WHERE created_at >= DATE('now', '-${days} days')
          GROUP BY device_id
        )
        GROUP BY DATE(first_appearance)
        ORDER BY date DESC
      `;
      const newUsersData = await db.all<{ date: string; count: number }>(newUsersQuery);

      res.json({
        overview: {
          todayDau: todayDau?.count || 0,
          wau: wau?.count || 0,
          mau: mau?.count || 0,
          totalSaves: savesCount?.count || 0,
        },
        trends: {
          dau: dauData,
          games: gamesData,
          newUsers: newUsersData,
        },
        distribution: {
          ranks: rankDistribution,
        },
        events: eventStats,
        leaderboard,
      });
    } catch (error) {
      console.error('获取统计数据失败:', error);
      res.status(500).json({ error: '获取统计数据失败' });
    }
  });

  /**
   * GET /api/admin/health
   * 系统健康检查
   */
  router.get('/health', authMiddleware, async (req: Request, res: Response) => {
    try {
      // 各表记录数
      const tablesQuery = `
        SELECT
          (SELECT COUNT(*) FROM activity_logs) as activity_logs,
          (SELECT COUNT(*) FROM game_saves) as game_saves,
          (SELECT COUNT(*) FROM leaderboard) as leaderboard,
          (SELECT COUNT(*) FROM dynamic_events) as dynamic_events
      `;
      const tableCounts = await db.get(tablesQuery);

      // 最近活动
      const recentActivity = await db.all(`
        SELECT * FROM activity_logs
        ORDER BY created_at DESC
        LIMIT 10
      `);

      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        tables: tableCounts,
        recentActivity,
      });
    } catch (error) {
      console.error('健康检查失败:', error);
      res.status(500).json({ error: '健康检查失败' });
    }
  });

  /**
   * GET /api/admin/retention
   * 留存率分析
   */
  router.get('/retention', authMiddleware, async (req: Request, res: Response) => {
    try {
      // 次日留存
      const day1RetentionQuery = `
        SELECT
          COUNT(DISTINCT y.device_id) as retained,
          COUNT(DISTINCT t.device_id) as total
        FROM (
          SELECT device_id
          FROM activity_logs
          WHERE DATE(created_at) = DATE('now', '-1 day')
        ) y
        LEFT JOIN (
          SELECT device_id
          FROM activity_logs
          WHERE DATE(created_at) = DATE('now')
        ) t ON y.device_id = t.device_id
      `;

      // 7日留存
      const day7RetentionQuery = `
        SELECT
          COUNT(DISTINCT w.device_id) as retained,
          COUNT(DISTINCT t.device_id) as total
        FROM (
          SELECT device_id
          FROM activity_logs
          WHERE DATE(created_at) = DATE('now', '-7 days')
        ) w
        LEFT JOIN (
          SELECT device_id
          FROM activity_logs
          WHERE DATE(created_at) = DATE('now')
        ) t ON w.device_id = t.device_id
      `;

      const day1 = await db.get<{ retained: number; total: number }>(day1RetentionQuery);
      const day7 = await db.get<{ retained: number; total: number }>(day7RetentionQuery);

      const calculateRate = (data: { retained: number; total: number } | undefined) => {
        if (!data || data.total === 0) return 0;
        return Math.round((data.retained / data.total) * 100);
      };

      res.json({
        day1: calculateRate(day1),
        day7: calculateRate(day7),
        day1Data: day1,
        day7Data: day7,
      });
    } catch (error) {
      console.error('获取留存数据失败:', error);
      res.status(500).json({ error: '获取留存数据失败' });
    }
  });

  return router;
}

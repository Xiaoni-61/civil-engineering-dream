import { Router, Request, Response } from 'express';
import { Database } from '../database/init.js';

export function createLeaderboardRouter(db: Database): Router {
  const router = Router();

  /**
   * GET /api/leaderboard
   * 查询排行榜
   * 查询参数:
   *   - type: 'overall' | 'cash' | 'games' (默认: 'overall')
   *   - limit: 数量限制 (默认: 50)
   *   - offset: 分页偏移 (默认: 0)
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const type = (req.query.type as string) || 'overall';
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      let query = '';
      let params: any[] = [];

      switch (type) {
        case 'cash':
          // 按总现金排行
          query = `
            SELECT
              ROW_NUMBER() OVER (ORDER BY totalCash DESC) as rank,
              deviceId,
              bestScore,
              totalCash as value,
              totalGames
            FROM leaderboard
            ORDER BY totalCash DESC
            LIMIT ? OFFSET ?
          `;
          params = [limit, offset];
          break;

        case 'games':
          // 按游戏次数排行
          query = `
            SELECT
              ROW_NUMBER() OVER (ORDER BY totalGames DESC) as rank,
              deviceId,
              bestScore,
              totalGames as value,
              totalCash
            FROM leaderboard
            ORDER BY totalGames DESC
            LIMIT ? OFFSET ?
          `;
          params = [limit, offset];
          break;

        case 'overall':
        default:
          // 按最佳成绩排行
          query = `
            SELECT
              ROW_NUMBER() OVER (ORDER BY bestScore DESC) as rank,
              deviceId,
              bestScore as value,
              totalGames,
              totalCash
            FROM leaderboard
            ORDER BY bestScore DESC
            LIMIT ? OFFSET ?
          `;
          params = [limit, offset];
      }

      const leaderboard = await db.all(query, params);

      // 获取总数
      const totalResult = await db.get<{ total: number }>(
        'SELECT COUNT(*) as total FROM leaderboard'
      );
      const total = totalResult?.total || 0;

      res.status(200).json({
        code: 'SUCCESS',
        data: {
          type,
          leaderboard,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total,
          },
        },
      });
    } catch (error) {
      console.error('❌ /leaderboard 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  /**
   * GET /api/leaderboard/me
   * 查询当前设备的排名
   * 查询参数:
   *   - deviceId: 设备ID
   */
  router.get('/me', async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.query;

      if (!deviceId) {
        return res.status(400).json({
          code: 'MISSING_DEVICE_ID',
          message: '缺少设备ID',
        });
      }

      // 获取玩家信息
      const player = await db.get(
        'SELECT * FROM leaderboard WHERE deviceId = ?',
        [deviceId]
      );

      if (!player) {
        return res.status(404).json({
          code: 'PLAYER_NOT_FOUND',
          message: '玩家尚未有成绩记录',
        });
      }

      // 获取排名
      const ranking = await db.get<{ rank: number }>(
        `SELECT COUNT(*) + 1 as rank FROM leaderboard
         WHERE bestScore > ? OR (bestScore = ? AND deviceId < ?)`,
        [player.bestScore, player.bestScore, deviceId]
      );

      const rank = ranking?.rank || 1;

      // 获取总玩家数
      const totalResult = await db.get<{ total: number }>(
        'SELECT COUNT(*) as total FROM leaderboard'
      );
      const total = totalResult?.total || 0;

      res.status(200).json({
        code: 'SUCCESS',
        data: {
          rank,
          total,
          percentile: ((total - rank + 1) / total * 100).toFixed(1),
          player: {
            deviceId: player.deviceId,
            bestScore: player.bestScore,
            totalGames: player.totalGames,
            totalCash: player.totalCash,
          },
        },
      });
    } catch (error) {
      console.error('❌ /leaderboard/me 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  /**
   * GET /api/leaderboard/stats
   * 获取全局统计数据
   */
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const stats = await db.get(
        `SELECT
          COUNT(DISTINCT deviceId) as totalPlayers,
          COUNT(*) as totalGames,
          AVG(bestScore) as avgScore,
          MAX(bestScore) as maxScore,
          MIN(bestScore) as minScore,
          SUM(totalCash) as totalCash
         FROM leaderboard`
      );

      res.status(200).json({
        code: 'SUCCESS',
        data: stats || {
          totalPlayers: 0,
          totalGames: 0,
          avgScore: 0,
          maxScore: 0,
          minScore: 0,
          totalCash: 0,
        },
      });
    } catch (error) {
      console.error('❌ /leaderboard/stats 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  return router;
}

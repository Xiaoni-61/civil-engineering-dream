import { Router, Request, Response } from 'express';
import { Database } from '../database/init.js';

export function createLeaderboardRouter(db: Database): Router {
  const router = Router();

  /**
   * GET /api/leaderboard
   * 查询单局游戏排行榜
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
          // 按最终现金排行
          query = `
            SELECT
              ROW_NUMBER() OVER (ORDER BY finalCash DESC) as rank,
              runId,
              playerName,
              score,
              finalCash as value,
              roundsPlayed,
              endReason,
              finalRank,
              createdAt
            FROM game_stats
            ORDER BY finalCash DESC
            LIMIT ? OFFSET ?
          `;
          params = [limit, offset];
          break;

        case 'games':
          // 按季度数排行
          query = `
            SELECT
              ROW_NUMBER() OVER (ORDER BY roundsPlayed DESC) as rank,
              runId,
              playerName,
              score,
              roundsPlayed as value,
              finalCash,
              endReason,
              finalRank,
              createdAt
            FROM game_stats
            ORDER BY roundsPlayed DESC
            LIMIT ? OFFSET ?
          `;
          params = [limit, offset];
          break;

        case 'overall':
        default:
          // 按分数排行（默认）
          query = `
            SELECT
              ROW_NUMBER() OVER (ORDER BY score DESC) as rank,
              runId,
              playerName,
              score as value,
              roundsPlayed,
              finalCash,
              endReason,
              finalRank,
              createdAt
            FROM game_stats
            ORDER BY score DESC
            LIMIT ? OFFSET ?
          `;
          params = [limit, offset];
      }

      const leaderboard = await db.all(query, params);

      // 获取总游戏局数
      const totalResult = await db.get<{ total: number }>(
        'SELECT COUNT(*) as total FROM game_stats'
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
   * 查询当前设备玩家的最佳记录
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

      // 获取该设备的最佳记录
      const bestGame = await db.get(
        `SELECT * FROM game_stats WHERE deviceId = ? ORDER BY score DESC LIMIT 1`,
        [deviceId]
      );

      if (!bestGame) {
        return res.status(404).json({
          code: 'PLAYER_NOT_FOUND',
          message: '尚未有游戏记录',
        });
      }

      // 获取该记录在所有游戏中的排名
      const allGames = await db.all(
        'SELECT score FROM game_stats ORDER BY score DESC'
      );
      const rank = allGames.findIndex((g: any) => g.score < bestGame.score) + 1;
      const totalGames = allGames.length;

      // 计算超过的百分比
      const percentile = totalGames > 0
        ? ((totalGames - rank + 1) / totalGames * 100).toFixed(1)
        : '0.0';

      // 获取该设备的总局数
      const playerStats = await db.get(
        `SELECT COUNT(*) as totalGames, MAX(score) as bestScore, SUM(finalCash) as totalCash
         FROM game_stats WHERE deviceId = ?`,
        [deviceId]
      );

      res.status(200).json({
        code: 'SUCCESS',
        data: {
          rank,
          total: totalGames,
          percentile: parseFloat(percentile),
          runId: bestGame.runId,
          playerName: bestGame.playerName,
          bestScore: bestGame.score,
          totalGames: playerStats?.totalGames || 1,
          totalCash: playerStats?.totalCash || bestGame.finalCash,
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
          COUNT(*) as totalGames,
          COUNT(DISTINCT deviceId) as totalPlayers,
          AVG(score) as avgScore,
          MAX(score) as maxScore,
          MIN(score) as minScore,
          SUM(finalCash) as totalCash
         FROM game_stats`
      );

      res.status(200).json({
        code: 'SUCCESS',
        data: stats || {
          totalGames: 0,
          totalPlayers: 0,
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

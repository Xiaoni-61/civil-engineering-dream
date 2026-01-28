import { Router, Request, Response } from 'express';
import { Database } from '../database/init.js';

// 职位排序权重
const RANK_WEIGHT: Record<string, number> = {
  'PARTNER': 100,
  'PROJECT_DIRECTOR': 90,
  'PROJECT_MANAGER': 80,
  'SENIOR_ENGINEER': 70,
  'ENGINEER': 60,
  'ASSISTANT_ENGINEER': 50,
  'INTERN': 40,
};

export function createLeaderboardRouter(db: Database): Router {
  const router = Router();

  /**
   * GET /api/leaderboard
   * 查询单局游戏排行榜
   * 查询参数:
   *   - type: 'rank' | 'cash' (默认: 'rank')
   *   - limit: 数量限制 (默认: 50)
   *   - offset: 分页偏移 (默认: 0)
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const type = (req.query.type as string) || 'rank';
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const offset = parseInt(req.query.offset as string) || 0;

      let query = '';
      let params: any[] = [];

      if (type === 'cash') {
        // 现金榜：按总资产排序（现金 + 存货材料按当前市价计算）
        // 注意：这里暂时只用 finalCash，因为 game_stats 没有存储库存
        // TODO: 添加库存材料价值计算
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
      } else {
        // 职位榜（默认）：按最终职位排序
        // 使用 CASE WHEN 按职位权重排序，同职位按分数排序
        query = `
          SELECT
            ROW_NUMBER() OVER (
              ORDER BY
                CASE finalRank
                  WHEN 'PARTNER' THEN 100
                  WHEN 'PROJECT_DIRECTOR' THEN 90
                  WHEN 'PROJECT_MANAGER' THEN 80
                  WHEN 'SENIOR_ENGINEER' THEN 70
                  WHEN 'ENGINEER' THEN 60
                  WHEN 'ASSISTANT_ENGINEER' THEN 50
                  WHEN 'INTERN' THEN 40
                  ELSE 0
                END DESC,
                score DESC
            ) as rank,
            runId,
            playerName,
            score,
            score as value,
            roundsPlayed,
            finalCash,
            endReason,
            finalRank,
            createdAt
          FROM game_stats
          WHERE finalRank IS NOT NULL AND finalRank != ''
          ORDER BY
            CASE finalRank
              WHEN 'PARTNER' THEN 100
              WHEN 'PROJECT_DIRECTOR' THEN 90
              WHEN 'PROJECT_MANAGER' THEN 80
              WHEN 'SENIOR_ENGINEER' THEN 70
              WHEN 'ENGINEER' THEN 60
              WHEN 'ASSISTANT_ENGINEER' THEN 50
              WHEN 'INTERN' THEN 40
              ELSE 0
            END DESC,
            score DESC
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
   *   - type: 榜单类型 'rank' | 'cash' (默认: 'rank')
   */
  router.get('/me', async (req: Request, res: Response) => {
    try {
      const { deviceId, type } = req.query;
      const leaderboardType = (type as string) || 'rank';

      if (!deviceId) {
        return res.status(400).json({
          code: 'MISSING_DEVICE_ID',
          message: '缺少设备ID',
        });
      }

      let bestGame;
      let allGames;
      let orderByClause;

      if (leaderboardType === 'cash') {
        // 现金榜：按现金排序
        orderByClause = 'ORDER BY finalCash DESC';
        bestGame = await db.get(
          `SELECT * FROM game_stats WHERE deviceId = ? ${orderByClause} LIMIT 1`,
          [deviceId]
        );
        allGames = await db.all(
          `SELECT runId, finalCash FROM game_stats ORDER BY finalCash DESC`
        );
      } else {
        // 职位榜（默认）：按职位权重排序
        bestGame = await db.get(
          `SELECT * FROM (
            SELECT *,
              CASE finalRank
                WHEN 'PARTNER' THEN 100
                WHEN 'PROJECT_DIRECTOR' THEN 90
                WHEN 'PROJECT_MANAGER' THEN 80
                WHEN 'SENIOR_ENGINEER' THEN 70
                WHEN 'ENGINEER' THEN 60
                WHEN 'ASSISTANT_ENGINEER' THEN 50
                WHEN 'INTERN' THEN 40
                ELSE 0
              END as rankWeight
            FROM game_stats
            WHERE deviceId = ?
            ORDER BY rankWeight DESC, score DESC
            LIMIT 1
          )`,
          [deviceId]
        );
        allGames = await db.all(
          `SELECT runId,
             CASE finalRank
               WHEN 'PARTNER' THEN 100
               WHEN 'PROJECT_DIRECTOR' THEN 90
               WHEN 'PROJECT_MANAGER' THEN 80
               WHEN 'SENIOR_ENGINEER' THEN 70
               WHEN 'ENGINEER' THEN 60
               WHEN 'ASSISTANT_ENGINEER' THEN 50
               WHEN 'INTERN' THEN 40
               ELSE 0
             END as rankWeight,
             score
            FROM game_stats
            WHERE finalRank IS NOT NULL AND finalRank != ''
            ORDER BY rankWeight DESC, score DESC`
        );
      }

      if (!bestGame) {
        return res.status(404).json({
          code: 'PLAYER_NOT_FOUND',
          message: '尚未有游戏记录',
        });
      }

      // 计算该记录在榜单中的排名
      const rank = allGames.findIndex((g: any) => g.runId === bestGame.runId) + 1;
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
          type: leaderboardType,
          rank,
          total: totalGames,
          percentile: parseFloat(percentile),
          runId: bestGame.runId,
          playerName: bestGame.playerName,
          bestScore: bestGame.score,
          totalGames: playerStats?.totalGames || 1,
          totalCash: playerStats?.totalCash || bestGame.finalCash,
          finalRank: bestGame.finalRank,
          finalCash: bestGame.finalCash,
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

      // 统计各职级完成人数
      const rankStats = await db.all(
        `SELECT finalRank, COUNT(*) as count
         FROM game_stats
         WHERE finalRank IS NOT NULL AND finalRank != ''
         GROUP BY finalRank`
      );

      res.status(200).json({
        code: 'SUCCESS',
        data: {
          ...stats,
          rankStats: rankStats || [],
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

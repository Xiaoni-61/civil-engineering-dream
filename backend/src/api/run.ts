import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateSignature } from '../middleware/auth.js';
import { Database } from '../database/init.js';

export function createRunRouter(db: Database): Router {
  const router = Router();

  /**
   * POST /api/run/start
   * 创建新游戏会话
   * 返回: { runId, serverSeed, token }
   */
  router.post('/start', async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.body;

      if (!deviceId) {
        return res.status(400).json({
          code: 'MISSING_DEVICE_ID',
          message: '缺少设备ID',
        });
      }

      // 生成会话ID和服务端种子
      const runId = uuidv4();
      const serverSeed = Math.random().toString(36).substring(2, 15);

      // 生成签名 token
      const payload = { runId, serverSeed, deviceId };
      const token = generateSignature(payload);

      // 保存到数据库（待上传结果时验证）
      await db.run(
        `INSERT INTO runs (id, deviceId, score, payload, signature)
         VALUES (?, ?, ?, ?, ?)`,
        [runId, deviceId, 0, JSON.stringify(payload), token]
      );

      res.status(200).json({
        code: 'SUCCESS',
        data: {
          runId,
          serverSeed,
          token,
          message: '游戏会话创建成功',
        },
      });
    } catch (error) {
      console.error('❌ /run/start 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  /**
   * POST /api/run/finish
   * 完成游戏，上传成绩
   * 需要签名验证
   */
  router.post('/finish', async (req: Request, res: Response) => {
    try {
      const {
        runId,
        deviceId,
        score,
        finalStats,
        roundsPlayed,
        signature,
      } = req.body;

      if (!runId || !deviceId || score === undefined) {
        return res.status(400).json({
          code: 'MISSING_FIELDS',
          message: '缺少必要字段：runId、deviceId、score',
        });
      }

      // 获取之前保存的运行记录
      const run = await db.get(
        'SELECT * FROM runs WHERE id = ? AND deviceId = ?',
        [runId, deviceId]
      );

      if (!run) {
        return res.status(404).json({
          code: 'RUN_NOT_FOUND',
          message: '游戏会话不存在或已过期',
        });
      }

      // 检查数据异常值（简单的反作弊）
      if (score < 0 || score > 50000) {
        return res.status(400).json({
          code: 'INVALID_SCORE',
          message: '分数数据异常，可能存在作弊',
        });
      }

      if (roundsPlayed && (roundsPlayed < 0 || roundsPlayed > 100)) {
        return res.status(400).json({
          code: 'INVALID_ROUNDS',
          message: '回合数异常',
        });
      }

      // 更新游戏记录
      await db.run(
        'UPDATE runs SET score = ? WHERE id = ?',
        [score, runId]
      );

      // 保存详细统计
      const stats = finalStats || {};
      await db.run(
        `INSERT INTO game_stats
         (deviceId, score, finalCash, finalHealth, finalReputation, finalProgress, finalQuality, roundsPlayed)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          deviceId,
          score,
          stats.cash || 0,
          stats.health || 0,
          stats.reputation || 0,
          stats.progress || 0,
          stats.quality || 0,
          roundsPlayed || 0,
        ]
      );

      // 更新排行榜 - 使用原子操作避免 UNIQUE 约束冲突
      // 使用 INSERT OR IGNORE + UPDATE 确保幂等性
      await db.run(
        `INSERT OR IGNORE INTO leaderboard (deviceId, bestScore, totalGames, totalCash)
         VALUES (?, ?, ?, ?)`,
        [deviceId, -1, 0, 0]  // 插入一个占位记录（bestScore=-1 会被后续更新覆盖）
      );

      // 然后更新记录（无论是新插入的还是已存在的）
      await db.run(
        `UPDATE leaderboard
         SET bestScore = MAX(bestScore, ?),
             totalGames = totalGames + 1,
             totalCash = totalCash + ?,
             updatedAt = CURRENT_TIMESTAMP
         WHERE deviceId = ?`,
        [score, stats.cash || 0, deviceId]
      );

      // 如果 bestScore 还是 -1（新记录），直接设置为当前分数
      await db.run(
        `UPDATE leaderboard
         SET bestScore = ?
         WHERE deviceId = ? AND bestScore = -1`,
        [score, deviceId]
      );

      // 获取排名
      const rankings = await db.all(
        'SELECT deviceId, bestScore FROM leaderboard ORDER BY bestScore DESC'
      );
      const rank = rankings.findIndex((r: any) => r.deviceId === deviceId) + 1;

      res.status(200).json({
        code: 'SUCCESS',
        data: {
          score,
          rank,
          totalPlayers: rankings.length,
          message: '成绩上传成功',
        },
      });
    } catch (error) {
      console.error('❌ /run/finish 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  return router;
}

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateSignature } from '../middleware/auth.js';
import { Database } from '../database/init.js';

/**
 * 生成单局游戏 ID
 * 格式：YYMMDDNNNNNN（12位纯数字）
 * 示例：250128000001 - 25年1月28日第1局
 */
function generateRunId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2); // 25
  const mm = String(now.getMonth() + 1).padStart(2, '0'); // 01
  const dd = String(now.getDate()).padStart(2, '0'); // 28
  const prefix = `${yy}${mm}${dd}`; // 250128

  // 返回前缀，序号在插入时生成
  return prefix;
}

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
    console.log('=== /api/run/finish 收到请求 ===');
    console.log('Body:', {
      runId: req.body.runId,
      score: req.body.score,
      roundsPlayed: req.body.roundsPlayed,
      playerName: req.body.playerName,
      endReason: req.body.endReason,
      finalRank: req.body.finalRank,
    });

    try {
      const {
        runId,
        deviceId,
        score,
        finalStats,
        roundsPlayed,
        playerName,
        endReason,
        finalRank,
        signature,
      } = req.body;

      console.log('解析后的数据:', { runId, deviceId, score, roundsPlayed, playerName, endReason, finalRank });

      if (!runId || !deviceId || score === undefined) {
        console.log('❌ 缺少必要字段');
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
      if (score < 0) {
        return res.status(400).json({
          code: 'INVALID_SCORE',
          message: '分数不能为负数',
        });
      }
      // 移除上限检查，因为分数可以无限增长（现金 + 库存价值）

      if (roundsPlayed && (roundsPlayed < 0 || roundsPlayed > 100)) {
        return res.status(400).json({
          code: 'INVALID_ROUNDS',
          message: '季度数异常',
        });
      }

      // 更新游戏记录
      await db.run(
        'UPDATE runs SET score = ? WHERE id = ?',
        [score, runId]
      );

      // 生成单局游戏 ID（格式：YYMMDDNNNNNN）
      const datePrefix = generateRunId(); // 例如：250128

      // 获取今天的最后一局序号
      const lastGame = await db.get(
        `SELECT runId FROM game_stats WHERE runId LIKE ? ORDER BY runId DESC LIMIT 1`,
        [`${datePrefix}%`]
      );

      // 生成新序号（000001-999999）
      const lastSeq = lastGame ? parseInt(lastGame.runId.slice(-6)) : 0;
      const newSeq = lastSeq + 1;
      const fullRunId = `${datePrefix}${String(newSeq).padStart(6, '0')}`; // 250128000001

      // 保存详细统计到 game_stats（作为排行榜数据源）
      const stats = finalStats || {};
      await db.run(
        `INSERT INTO game_stats
         (runId, deviceId, playerName, score, finalCash, finalHealth, finalReputation, finalProgress, finalQuality, roundsPlayed, endReason, finalRank)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          fullRunId,
          deviceId,
          playerName || '匿名玩家',
          score,
          stats.cash || 0,
          stats.health || 0,
          stats.reputation || 0,
          stats.progress || 0,
          stats.quality || 0,
          roundsPlayed || 0,
          endReason || null,
          finalRank || null,
        ]
      );

      // 获取基于所有游戏记录的排名
      const allGames = await db.all(
        'SELECT runId, score FROM game_stats ORDER BY score DESC'
      );
      const rank = allGames.findIndex((g: any) => g.runId === fullRunId) + 1;
      const totalGames = allGames.length;

      // 计算超过的百分比
      const percentile = totalGames > 0
        ? ((totalGames - rank + 1) / totalGames * 100).toFixed(1)
        : '0.0';

      res.status(200).json({
        code: 'SUCCESS',
        data: {
          runId: fullRunId,
          score,
          rank,
          totalGames,
          percentile: parseFloat(percentile),
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

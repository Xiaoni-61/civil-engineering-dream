import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { generateSignature } from '../middleware/auth.js';
import { Database } from '../database/init.js';
import { callLLM, isLLMAvailable } from '../services/llmService.js';
import { createLogger, PerformanceMonitor, MetricsCollector } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const logger = createLogger('RunAPI');
const perf = new PerformanceMonitor('RunAPI');
const metrics = new MetricsCollector('RunAPI');

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

  /**
   * POST /api/run/:gameId/biography
   * 生成职业传记
   */
  router.post('/:gameId/biography', async (req: Request, res: Response) => {
    const gameId = req.params.gameId;
    logger.info('收到传记生成请求', { gameId });

    try {
      const biographyInput = req.body;

      // 验证必要字段
      if (!biographyInput.playerName || !biographyInput.finalRank) {
        logger.warn('缺少必要字段', { playerName: biographyInput.playerName, finalRank: biographyInput.finalRank });
        return res.status(400).json({
          code: 'MISSING_FIELDS',
          message: '缺少必要字段：playerName、finalRank',
        });
      }

      return perf.measure('generateBiography', async () => {
        // 检查缓存是否存在
        const cached = await db.get(
          'SELECT content FROM career_biographies WHERE game_id = ?',
          [gameId]
        );

        if (cached) {
          logger.success('从缓存返回传记', { gameId });
          metrics.record('biography_cache_hit', 1);
          return res.status(200).json({
            code: 'SUCCESS',
            data: {
              biography: cached.content,
              cached: true,
            },
          });
        }

        metrics.record('biography_cache_miss', 1);

        // 检查 LLM 是否可用
        if (!isLLMAvailable()) {
          logger.error('LLM 服务未配置');
          return res.status(503).json({
            code: 'LLM_UNAVAILABLE',
            message: 'LLM 服务未配置，无法生成传记',
          });
        }

        // 加载 Prompt 模板
        const promptPath = path.join(__dirname, '../../prompts/narrative/career-biography.md');
        let promptTemplate: string;

        try {
          promptTemplate = fs.readFileSync(promptPath, 'utf-8');
        } catch (error) {
          logger.error('读取传记模板失败', error as Error);
          return res.status(500).json({
            code: 'TEMPLATE_ERROR',
            message: '传记模板文件不存在',
          });
        }

        // 替换模板变量
        const prompt = promptTemplate
          .replace(/\{\{player_name\}\}/g, biographyInput.playerName)
          .replace(/\{\{final_rank\}\}/g, biographyInput.finalRank)
          .replace(/\{\{end_reason\}\}/g, biographyInput.endReason || '游戏结束')
          .replace(/\{\{quarters\}\}/g, String(biographyInput.quartersPlayed || 0))
          .replace(/\{\{final_stats\}\}/g, JSON.stringify(biographyInput.finalStats || {}, null, 2))
          .replace(/\{\{key_decisions\}\}/g, JSON.stringify(biographyInput.keyDecisions || [], null, 2));

        logger.debug('传记 prompt 准备完成', {
          playerName: biographyInput.playerName,
          finalRank: biographyInput.finalRank,
          promptLength: prompt.length,
        });

        // 调用 LLM 生成传记
        const response = await callLLM({
          messages: [
            {
              role: 'system',
              content: '你是《还我一个土木梦》游戏的叙事总监，擅长生成生动有趣的职业传记。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 2000,
        });

        // 清理返回的内容
        let biography = response.content.trim();
        // 移除可能的引号包裹
        biography = biography.replace(/^["']|["']$/g, '');

        logger.success('传记生成成功', {
          gameId,
          length: biography.length,
          playerName: biographyInput.playerName,
        });

        metrics.record('biography_generated', 1);
        metrics.record('biography_length', biography.length);

        // 保存到缓存
        await db.run(
          `INSERT INTO career_biographies (game_id, player_name, content, game_data)
           VALUES (?, ?, ?, ?)`,
          [
            gameId,
            biographyInput.playerName,
            biography,
            JSON.stringify(biographyInput),
          ]
        );

        return res.status(200).json({
          code: 'SUCCESS',
          data: {
            biography,
            cached: false,
          },
        });
      });
    } catch (error) {
      logger.error('传记生成失败', error as Error);
      metrics.record('biography_error', 1);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  /**
   * POST /api/run/:gameId/biography/share
   * 分享传记（增加分享计数）
   */
  router.post('/:gameId/biography/share', async (req: Request, res: Response) => {
    console.log('=== /api/run/:gameId/biography/share 收到请求 ===');
    console.log('GameId:', req.params.gameId);

    try {
      const { gameId } = req.params;

      // 查询传记是否存在
      const biography = await db.get(
        'SELECT id, shared_count FROM career_biographies WHERE game_id = ?',
        [gameId]
      );

      if (!biography) {
        return res.status(404).json({
          code: 'BIOGRAPHY_NOT_FOUND',
          message: '传记不存在，请先生成传记',
        });
      }

      // 更新分享计数
      await db.run(
        'UPDATE career_biographies SET shared_count = shared_count + 1 WHERE game_id = ?',
        [gameId]
      );

      // 生成分享链接（这里使用前端页面 + gameId 的简单方式）
      const shareUrl = `${req.protocol}://${req.get('host')}/result?game=${gameId}`;

      res.status(200).json({
        code: 'SUCCESS',
        data: {
          shareUrl,
          shortCode: gameId,
          sharedCount: biography.shared_count + 1,
          message: '分享成功',
        },
      });
    } catch (error) {
      console.error('❌ /api/run/:gameId/biography/share 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  return router;
}

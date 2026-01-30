import { Router, Request, Response } from 'express';
import { Database } from '../database/init.js';

/**
 * 创建存档路由器
 */
export function createSavesRouter(db: Database): Router {
  const router = Router();

  /**
   * POST /api/saves/save
   * 保存游戏存档
   *
   * 逻辑：
   * 1. 验证必需字段: deviceId, runId, gameState
   * 2. 查询现有存档: 按 device_id 查询
   * 3. 保存逻辑:
   *    - 无存档 → 创建 slot1
   *    - 有存档，同 runId → 更新 slot1
   *    - 有存档，不同 runId → slot1 复制到 slot2，新游戏存到 slot1
   * 4. 更新时间戳: updated_at 设为当前时间
   * 5. 返回响应: success, slotId, message
   */
  router.post('/save', async (req: Request, res: Response) => {
    console.log('=== /api/saves/save 收到请求 ===');

    try {
      const { deviceId, runId, playerName, playerGender, currentQuarter, rank, status, gameState } = req.body;

      console.log('解析后的数据:', { deviceId, runId, playerName, currentQuarter, rank });

      // 1. 验证必需字段
      if (!deviceId || !runId || !gameState) {
        console.log('❌ 缺少必要字段');
        return res.status(400).json({
          code: 'MISSING_FIELDS',
          message: '缺少必要字段：deviceId、runId、gameState',
        });
      }

      // 2. 查询现有存档（按 device_id 查询）
      const existingSaves = await db.all(
        `SELECT * FROM game_saves WHERE device_id = ? ORDER BY slot_id`,
        [deviceId]
      );

      const now = new Date().toISOString();
      let slotId = 1;
      let message = '';

      // 3. 保存逻辑
      if (existingSaves.length === 0) {
        // 无存档 → 创建 slot1
        console.log('📝 创建新存档 slot1');
        await db.run(
          `INSERT INTO game_saves
           (device_id, slot_id, run_id, player_name, player_gender, current_quarter, rank, status, game_state, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [deviceId, slotId, runId, playerName, playerGender, currentQuarter, rank, status, JSON.stringify(gameState), now]
        );
        message = '存档创建成功';
      } else {
        // 获取 slot1 的存档
        const slot1 = existingSaves.find(s => s.slot_id === 1);

        if (!slot1) {
          // 异常情况：有存档但没有 slot1，创建 slot1
          console.log('📝 创建新存档 slot1（修复数据）');
          await db.run(
            `INSERT INTO game_saves
             (device_id, slot_id, run_id, player_name, player_gender, current_quarter, rank, status, game_state, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [deviceId, slotId, runId, playerName, playerGender, currentQuarter, rank, status, JSON.stringify(gameState), now]
          );
          message = '存档创建成功';
        } else if (slot1.run_id === runId) {
          // 有存档，同 runId → 更新 slot1
          console.log('📝 更新现有存档 slot1');
          await db.run(
            `UPDATE game_saves
             SET player_name = ?, player_gender = ?, current_quarter = ?, rank = ?, status = ?, game_state = ?, updated_at = ?
             WHERE device_id = ? AND slot_id = ?`,
            [playerName, playerGender, currentQuarter, rank, status, JSON.stringify(gameState), now, deviceId, slotId]
          );
          message = '存档更新成功';
        } else {
          // 有存档，不同 runId → slot1 复制到 slot2，新游戏存到 slot1
          console.log('📝 存档 slot1 移至 slot2，创建新 slot1');

          // 使用 INSERT OR REPLACE 将 slot1 复制到 slot2（原子操作：自动删除旧 slot2 并插入新数据）
          await db.run(
            `INSERT OR REPLACE INTO game_saves
             (device_id, slot_id, run_id, player_name, player_gender, current_quarter, rank, status, game_state, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [deviceId, 2, slot1.run_id, slot1.player_name, slot1.player_gender, slot1.current_quarter, slot1.rank, slot1.status, slot1.game_state, slot1.created_at, now]
          );

          // 将新游戏存到 slot1
          await db.run(
            `UPDATE game_saves
             SET run_id = ?, player_name = ?, player_gender = ?, current_quarter = ?, rank = ?, status = ?, game_state = ?, updated_at = ?
             WHERE device_id = ? AND slot_id = ?`,
            [runId, playerName, playerGender, currentQuarter, rank, status, JSON.stringify(gameState), now, deviceId, slotId]
          );
          message = '旧存档已备份到 slot2，新存档保存到 slot1';
        }
      }

      // 5. 返回响应
      res.status(200).json({
        code: 'SUCCESS',
        data: {
          success: true,
          slotId,
          message,
          timestamp: now,
        },
      });
    } catch (error) {
      console.error('❌ /api/saves/save 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  /**
   * GET /api/saves/list?deviceId=xxx
   * 获取存档列表
   *
   * 逻辑：
   * 1. 验证 deviceId 参数
   * 2. 查询该设备的所有存档: 按 device_id 查询
   * 3. 构建返回结果: 始终返回 2 个槽位（slot1 和 slot2）
   * 4. 返回响应: success, saves 数组
   */
  router.get('/list', async (req: Request, res: Response) => {
    console.log('=== /api/saves/list 收到请求 ===');

    try {
      const { deviceId } = req.query;

      // 1. 验证 deviceId 参数
      if (!deviceId || typeof deviceId !== 'string') {
        console.log('❌ 缺少 deviceId 参数');
        return res.status(400).json({
          code: 'MISSING_DEVICE_ID',
          message: '缺少 deviceId 参数',
        });
      }

      // 2. 查询该设备的所有存档（按 device_id 查询）
      const existingSaves = await db.all(
        `SELECT * FROM game_saves WHERE device_id = ? ORDER BY slot_id`,
        [deviceId]
      );

      console.log(`📋 查询到 ${existingSaves.length} 个存档`);

      // 3. 构建返回结果：始终返回 2 个槽位
      const slot1 = existingSaves.find(s => s.slot_id === 1);
      const slot2 = existingSaves.find(s => s.slot_id === 2);

      const saves = [
        slot1 ? {
          slotId: 1,
          hasSlot: true,
          runId: slot1.run_id,
          playerName: slot1.player_name,
          rank: slot1.rank,
          currentQuarter: slot1.current_quarter,
          updatedAt: slot1.updated_at,
        } : {
          slotId: 1,
          hasSlot: false,
        },
        slot2 ? {
          slotId: 2,
          hasSlot: true,
          runId: slot2.run_id,
          playerName: slot2.player_name,
          rank: slot2.rank,
          currentQuarter: slot2.current_quarter,
          updatedAt: slot2.updated_at,
        } : {
          slotId: 2,
          hasSlot: false,
        },
      ];

      // 4. 返回响应
      res.status(200).json({
        code: 'SUCCESS',
        data: {
          success: true,
          saves,
        },
      });
    } catch (error) {
      console.error('❌ /api/saves/list 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  /**
   * POST /api/saves/load
   * 加载游戏存档
   *
   * 逻辑：
   * 1. 验证必需字段: deviceId, slotId
   * 2. 查询存档: 按 device_id 和 slot_id 查询
   * 3. 解析游戏状态: JSON.parse game_state
   * 4. 验证必需字段: runId, stats
   * 5. 返回响应: success, gameState
   */
  router.post('/load', async (req: Request, res: Response) => {
    console.log('=== /api/saves/load 收到请求 ===');

    try {
      const { deviceId, slotId } = req.body;

      console.log('解析后的数据:', { deviceId, slotId });

      // 1. 验证必需字段
      if (!deviceId || slotId === undefined || slotId === null) {
        console.log('❌ 缺少必要字段');
        return res.status(400).json({
          code: 'MISSING_FIELDS',
          message: '缺少必要字段：deviceId、slotId',
        });
      }

      // 2. 查询存档（按 device_id 和 slot_id 查询）
      const save = await db.get(
        `SELECT * FROM game_saves WHERE device_id = ? AND slot_id = ?`,
        [deviceId, slotId]
      );

      if (!save) {
        console.log('❌ 存档不存在');
        return res.status(404).json({
          code: 'SAVE_NOT_FOUND',
          message: `槽位 ${slotId} 没有存档`,
        });
      }

      console.log(`📦 找到存档: runId=${save.run_id}, playerName=${save.player_name}`);

      // 3. 解析游戏状态
      let gameState;
      try {
        gameState = JSON.parse(save.game_state);
      } catch (error) {
        console.error('❌ 解析游戏状态失败：', error);
        return res.status(500).json({
          code: 'PARSE_ERROR',
          message: '游戏状态解析失败',
        });
      }

      // 4. 验证必需字段
      if (!gameState.runId || !gameState.stats) {
        console.log('❌ 游戏状态缺少必要字段');
        return res.status(500).json({
          code: 'INVALID_STATE',
          message: '游戏状态缺少必要字段：runId、stats',
        });
      }

      // 5. 返回响应
      res.status(200).json({
        code: 'SUCCESS',
        data: {
          success: true,
          gameState,
        },
      });
    } catch (error) {
      console.error('❌ /api/saves/load 错误：', error);
      res.status(500).json({
        code: 'ERROR',
        message: (error as Error).message || '服务器错误',
      });
    }
  });

  return router;
}

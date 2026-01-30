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

          // 先删除旧的 slot2（如果存在）
          await db.run(
            `DELETE FROM game_saves WHERE device_id = ? AND slot_id = ?`,
            [deviceId, 2]
          );

          // 将 slot1 复制到 slot2
          await db.run(
            `INSERT INTO game_saves
             (device_id, slot_id, run_id, player_name, player_gender, current_quarter, rank, status, game_state, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [deviceId, 2, slot1.run_id, slot1.player_name, slot1.player_gender, slot1.current_quarter, slot1.rank, slot1.status, slot1.game_state, now]
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

  return router;
}

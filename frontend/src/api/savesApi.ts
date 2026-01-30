/**
 * 存档 API 客户端
 * 与后端存档 API 交互
 */

import { apiRequest, generateDeviceId } from './gameApi';
import type {
  SaveGameRequest,
  SaveGameResponse,
  LoadGameRequest,
  LoadGameResponse,
  SaveSlot,
} from '@shared/types/save';

/**
 * 保存游戏存档
 * POST /api/saves/save
 *
 * 注意：后端 API 需要的参数格式与 SaveGameRequest 类型定义不同
 * 后端期望: { deviceId, runId, playerName, playerGender, currentQuarter, rank, status, gameState }
 */
export async function saveGame(params: SaveGameRequest): Promise<SaveGameResponse> {
  // 从 gameState 中提取字段以匹配后端 API 接口
  const { slotId, gameState } = params;

  const requestBody = {
    slotId,
    deviceId: gameState.deviceId,
    runId: gameState.runId,
    playerName: gameState.playerName,
    playerGender: gameState.playerGender,
    currentQuarter: gameState.currentQuarter,
    rank: gameState.rank,
    status: gameState.status,
    gameState,
  };

  const response = await apiRequest('/api/saves/save', {
    method: 'POST',
    body: JSON.stringify(requestBody),
  });

  return response.data;
}

/**
 * 加载游戏存档
 * POST /api/saves/load
 *
 * 后端需要 deviceId 和 slotId 参数
 */
export async function loadGame(params: LoadGameRequest): Promise<LoadGameResponse> {
  const deviceId = generateDeviceId();

  const response = await apiRequest('/api/saves/load', {
    method: 'POST',
    body: JSON.stringify({
      deviceId,
      ...params,
    }),
  });

  return response.data;
}

/**
 * 获取存档列表
 * GET /api/saves/list?deviceId=xxx
 */
export async function getSavesList(deviceId: string): Promise<SaveSlot[]> {
  const response = await apiRequest(`/api/saves/list?deviceId=${encodeURIComponent(deviceId)}`);

  // 后端返回 { code: "SUCCESS", data: { success: true, saves: [...] } }
  // 直接返回 saves 数组
  return response.data.saves || [];
}

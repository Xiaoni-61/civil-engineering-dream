/**
 * 游戏 API 客户端
 * 与后端 API 交互
 */

// 使用相对路径让 Vite proxy 工作
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * 获取角色名（永久保存）
 */
export function getPlayerName(): string | null {
  return localStorage.getItem('civil-engineering-player-name');
}

/**
 * 保存角色名到 localStorage（永久保存）
 */
export function savePlayerName(name: string): void {
  localStorage.setItem('civil-engineering-player-name', name);
}

/**
 * 生成设备ID（用于唯一标识玩家设备）
 * 注意：角色名用于排行榜显示，deviceId 用于唯一标识设备
 */
export function generateDeviceId(): string {
  let deviceId = localStorage.getItem('civil-engineering-device-id');
  if (!deviceId) {
    // 生成随机设备ID
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem('civil-engineering-device-id', deviceId);
  }
  return deviceId;
}

/**
 * 递归排序对象的所有键（用于生成签名）
 */
function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObjectKeys(obj[key]);
        return result;
      }, {} as any);
  }
  return obj;
}

/**
 * 生成签名（简单的 HMAC-SHA256 实现）
 */
async function generateSignature(data: Record<string, any>): Promise<string> {
  const sortedData = sortObjectKeys(data);
  const jsonString = JSON.stringify(sortedData);
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode('civil-engineering-dream-secret-key'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(jsonString)
  );
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * API 请求封装
 * @internal 仅供内部 API 模块使用，不建议外部直接调用
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API 请求失败:', error);
    throw error;
  }
}

/**
 * 创建游戏会话
 * POST /api/run/start
 */
export async function startGame() {
  const deviceId = generateDeviceId();

  const response = await apiRequest('/api/run/start', {
    method: 'POST',
    body: JSON.stringify({ deviceId }),
  });

  return response.data;
}

/**
 * 完成游戏，上传成绩
 * POST /api/run/finish
 */
export async function finishGame(params: {
  runId: string;
  score: number;
  finalStats: {
    cash: number;
    health: number;
    reputation: number;
    workAbility: number;
    luck: number;
  };
  roundsPlayed: number;
  playerName?: string;
  endReason?: string;
  finalRank?: string;
}) {
  const deviceId = generateDeviceId();

  // 生成签名
  const dataToSign = {
    runId: params.runId,
    deviceId,
    score: params.score,
    finalStats: params.finalStats,
    roundsPlayed: params.roundsPlayed,
    playerName: params.playerName,
    endReason: params.endReason,
    finalRank: params.finalRank,
  };

  const signature = await generateSignature(dataToSign);

  const response = await apiRequest('/api/run/finish', {
    method: 'POST',
    body: JSON.stringify({
      ...dataToSign,
      signature,
    }),
  });

  return response.data;
}

/**
 * 查询排行榜
 * GET /api/leaderboard?type=rank&limit=50&offset=0
 */
export async function getLeaderboard(params: {
  type?: 'rank' | 'cash';
  limit?: number;
  offset?: number;
} = {}) {
  const queryParams = new URLSearchParams();
  if (params.type) queryParams.set('type', params.type);
  if (params.limit) queryParams.set('limit', params.limit.toString());
  if (params.offset) queryParams.set('offset', params.offset.toString());

  const response = await apiRequest(`/api/leaderboard?${queryParams.toString()}`);

  return response.data;
}

/**
 * 查询当前玩家排名
 * GET /api/leaderboard/me?deviceId=xxx&type=rank
 */
export async function getMyRank(type: 'rank' | 'cash' = 'rank') {
  const deviceId = generateDeviceId();
  const response = await apiRequest(`/api/leaderboard/me?deviceId=${encodeURIComponent(deviceId)}&type=${type}`);

  return response.data;
}

/**
 * 获取全局统计
 * GET /api/leaderboard/stats
 */
export async function getGlobalStats() {
  const response = await apiRequest('/api/leaderboard/stats');

  return response.data;
}

/**
 * 健康检查
 * GET /health
 */
export async function healthCheck() {
  const response = await apiRequest('/health');

  return response;
}

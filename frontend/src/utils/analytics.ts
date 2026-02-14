/**
 * 用户行为分析工具
 * 用于记录用户活跃事件到后端
 */

type AnalyticsEventType =
  | 'visit'        // 访问首页
  | 'game_start'   // 开始新游戏
  | 'game_load'    // 加载存档
  | 'game_save'    // 保存游戏
  | 'game_end'     // 游戏结束
  | 'quarter_end'; // 季度结算

// 获取或创建设备 ID
function getDeviceId(): string {
  const STORAGE_KEY = 'civil_engineering_device_id';
  let deviceId = localStorage.getItem(STORAGE_KEY);

  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }

  return deviceId;
}

/**
 * 记录单个事件
 */
export async function trackEvent(
  eventType: AnalyticsEventType,
  eventData?: Record<string, any>
): Promise<void> {
  const deviceId = getDeviceId();

  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_id: deviceId,
        event_type: eventType,
        event_data: eventData,
      }),
      keepalive: true, // 确保页面关闭时也能发送
    });
  } catch (error) {
    // 静默失败，不影响用户体验
    console.debug('Analytics event failed:', error);
  }
}

/**
 * 批量记录事件
 */
export async function trackBatchEvents(
  events: Array<{ eventType: AnalyticsEventType; eventData?: Record<string, any> }>
): Promise<void> {
  const deviceId = getDeviceId();

  const formattedEvents = events.map((e) => ({
    device_id: deviceId,
    event_type: e.eventType,
    event_data: e.eventData,
  }));

  try {
    await fetch('/api/analytics/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events: formattedEvents }),
      keepalive: true,
    });
  } catch (error) {
    console.debug('Batch analytics failed:', error);
  }
}

// 导出便捷方法
export const analytics = {
  visit: () => trackEvent('visit'),
  gameStart: (data?: { playerName?: string; gender?: string }) =>
    trackEvent('game_start', data),
  gameLoad: (data?: { slotId?: number }) =>
    trackEvent('game_load', data),
  gameSave: (data?: { quarter?: number; rank?: string }) =>
    trackEvent('game_save', data),
  gameEnd: (data?: { quarter?: number; rank?: string; reason?: string; score?: number }) =>
    trackEvent('game_end', data),
  quarterEnd: (data?: { quarter?: number }) =>
    trackEvent('quarter_end', data),
};

export { getDeviceId };

/**
 * 定时任务调度器
 *
 * 负责管理游戏的定时任务：
 * - 每日凌晨 3:00：新闻抓取 + 事件生成
 * - 每日凌晨 4:00：清理过期事件
 * - 每 2 小时：检查事件数量，不足则补充
 */

import * as cron from 'node-cron';
import { initDatabase, type Database } from '../database/init.js';
import { getRSSFetcher } from './rssFetcher.js';
import { getEventGenerator, getEventRepository, type GeneratedEvent, type EventSourceInfo } from './eventGenerator.js';

/**
 * 任务状态接口
 */
interface TaskStatus {
  lastRun?: Date;
  nextRun?: Date;
  status: 'idle' | 'running' | 'success' | 'error';
  lastError?: string;
}

/**
 * 调度器状态接口
 */
export interface SchedulerStatus {
  isRunning: boolean;
  tasks: {
    dailyGeneration: TaskStatus;
    cleanup: TaskStatus;
    supplement: TaskStatus;
  };
}

/**
 * 任务配置
 */
const SCHEDULER_CONFIG = {
  // Cron 表达式
  dailyGenerationCron: '0 3 * * *',  // 每日凌晨 3:00
  cleanupCron: '0 4 * * *',           // 每日凌晨 4:00
  supplementCron: '0 */2 * * *',      // 每 2 小时

  // 事件数量阈值
  minEventCount: 20,                   // 最少保留事件数
  supplementCount: 10,                 // 补充事件数

  // 清理配置
  eventExpiryDays: 7,                  // 事件过期天数
  logExpiryDays: 30,                   // 日志过期天数
} as const;

/**
 * 定时任务调度器类
 */
export class TaskScheduler {
  private db: Database | null = null;
  private dailyGenerationTask: cron.ScheduledTask | null = null;
  private cleanupTask: cron.ScheduledTask | null = null;
  private supplementTask: cron.ScheduledTask | null = null;
  private isRunning: boolean = false;

  private taskStatus: SchedulerStatus = {
    isRunning: false,
    tasks: {
      dailyGeneration: { status: 'idle' },
      cleanup: { status: 'idle' },
      supplement: { status: 'idle' },
    },
  };

  /**
   * 启动所有定时任务
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  调度器已在运行中');
      return;
    }

    console.log('🕐 启动定时任务调度器...');

    try {
      // 初始化数据库
      this.db = await initDatabase();

      // 启动每日新闻生成任务
      this.dailyGenerationTask = cron.schedule(
        SCHEDULER_CONFIG.dailyGenerationCron,
        () => this.dailyNewsGeneration().catch(console.error),
        { timezone: 'Asia/Shanghai' }
      );
      console.log(`✅ 每日新闻生成任务已启动: ${SCHEDULER_CONFIG.dailyGenerationCron}`);

      // 启动清理过期事件任务
      this.cleanupTask = cron.schedule(
        SCHEDULER_CONFIG.cleanupCron,
        () => this.cleanupExpiredEvents().catch(console.error),
        { timezone: 'Asia/Shanghai' }
      );
      console.log(`✅ 清理过期事件任务已启动: ${SCHEDULER_CONFIG.cleanupCron}`);

      // 启动补充事件任务
      this.supplementTask = cron.schedule(
        SCHEDULER_CONFIG.supplementCron,
        () => this.supplementEvents().catch(console.error),
        { timezone: 'Asia/Shanghai' }
      );
      console.log(`✅ 补充事件任务已启动: ${SCHEDULER_CONFIG.supplementCron}`);

      this.isRunning = true;
      this.taskStatus.isRunning = true;

      console.log('🎉 定时任务调度器启动完成');
    } catch (error) {
      console.error('❌ 启动调度器失败:', error);
      throw error;
    }
  }

  /**
   * 停止所有定时任务
   */
  stop(): void {
    console.log('🛑 停止定时任务调度器...');

    if (this.dailyGenerationTask) {
      this.dailyGenerationTask.stop();
      this.dailyGenerationTask = null;
    }

    if (this.cleanupTask) {
      this.cleanupTask.stop();
      this.cleanupTask = null;
    }

    if (this.supplementTask) {
      this.supplementTask.stop();
      this.supplementTask = null;
    }

    this.isRunning = false;
    this.taskStatus.isRunning = false;

    // 重置任务状态
    Object.values(this.taskStatus.tasks).forEach(task => {
      task.status = 'idle';
    });

    console.log('✅ 定时任务调度器已停止');
  }

  /**
   * 每日新闻生成任务
   * 1. 抓取新闻
   * 2. 生成事件
   * 3. 保存到数据库
   */
  private async dailyNewsGeneration(): Promise<void> {
    const task = this.taskStatus.tasks.dailyGeneration;
    const startTime = Date.now();

    console.log('📰 开始每日新闻生成任务...');
    task.status = 'running';
    task.lastRun = new Date();

    try {
      if (!this.db) {
        throw new Error('数据库未初始化');
      }

      // 1. 抓取新闻
      console.log('📡 抓取 RSS 新闻...');
      const fetcher = getRSSFetcher();
      const newsItems = await fetcher.fetchAll();

      if (newsItems.length === 0) {
        console.log('⚠️  未抓取到任何新闻');
        task.status = 'success';
        return;
      }

      console.log(`✅ 成功抓取 ${newsItems.length} 条新闻`);

      // 2. 生成事件
      console.log('🤖 调用 LLM 生成事件...');
      const generator = getEventGenerator(this.db);
      const events = await generator.batchGenerate(newsItems);

      if (events.length === 0) {
        console.log('⚠️  未生成任何事件');
        task.status = 'success';
        return;
      }

      console.log(`✅ 成功生成 ${events.length} 个事件`);

      // 3. 保存到数据库
      console.log('💾 保存事件到数据库...');
      const repository = getEventRepository(this.db);

      const eventsWithSource: Array<{ event: GeneratedEvent; sourceInfo: EventSourceInfo }> = events.map(event => {
        // 查找对应的新闻源
        const newsItem = newsItems.find(n => n.title === event.title);
        const sourceInfo: EventSourceInfo = {
          sourceType: 'news',
          sourceUrl: newsItem?.url,
          newsTitle: newsItem?.title,
        };
        return { event, sourceInfo };
      });

      const savedIds = await repository.saveEvents(eventsWithSource);

      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ 每日新闻生成任务完成: 保存 ${savedIds.length} 个事件 (耗时 ${elapsedTime}s)`);

      task.status = 'success';
      task.lastError = undefined;
    } catch (error: any) {
      console.error('❌ 每日新闻生成任务失败:', error);
      task.status = 'error';
      task.lastError = error.message;
    }
  }

  /**
   * 清理过期事件任务
   * 1. 删除创建时间超过 7 天的事件
   * 2. 清理使用日志超过 30 天的事件
   */
  private async cleanupExpiredEvents(): Promise<void> {
    const task = this.taskStatus.tasks.cleanup;
    const startTime = Date.now();

    console.log('🧹 开始清理过期事件...');
    task.status = 'running';
    task.lastRun = new Date();

    try {
      if (!this.db) {
        throw new Error('数据库未初始化');
      }

      let deletedCount = 0;

      // 1. 删除创建时间超过 7 天的事件
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() - SCHEDULER_CONFIG.eventExpiryDays);

      const result1 = await this.db.run(
        `DELETE FROM dynamic_events WHERE datetime(created_at) < datetime(?)`,
        [expiryDate.toISOString()]
      );
      deletedCount += result1.changes || 0;
      console.log(`🗑️  删除了 ${result1.changes || 0} 个过期事件 (创建时间超过 ${SCHEDULER_CONFIG.eventExpiryDays} 天)`);

      // 2. 清理使用日志（可选）
      const logExpiryDate = new Date();
      logExpiryDate.setDate(logExpiryDate.getDate() - SCHEDULER_CONFIG.logExpiryDays);

      const result2 = await this.db.run(
        `DELETE FROM event_usage_log WHERE datetime(played_at) < datetime(?)`,
        [logExpiryDate.toISOString()]
      );
      console.log(`🗑️  删除了 ${result2.changes || 0} 条过期日志 (使用时间超过 ${SCHEDULER_CONFIG.logExpiryDays} 天)`);

      // 3. 清理 RSS 抓取器的缓存和不可用源标记
      const fetcher = getRSSFetcher();
      fetcher.cleanupCache();
      fetcher.cleanupUnavailableSources();

      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ 清理过期事件任务完成: 总计删除 ${deletedCount} 个事件 (耗时 ${elapsedTime}s)`);

      task.status = 'success';
      task.lastError = undefined;
    } catch (error: any) {
      console.error('❌ 清理过期事件任务失败:', error);
      task.status = 'error';
      task.lastError = error.message;
    }
  }

  /**
   * 补充事件任务
   * 1. 检查当前事件数量
   * 2. 如果少于阈值，生成创意事件补充
   */
  private async supplementEvents(): Promise<void> {
    const task = this.taskStatus.tasks.supplement;
    const startTime = Date.now();

    console.log('🔍 开始补充事件检查...');
    task.status = 'running';
    task.lastRun = new Date();

    try {
      if (!this.db) {
        throw new Error('数据库未初始化');
      }

      // 1. 检查当前事件数量
      const countResult = await this.db.get<{ count: number }>(
        'SELECT COUNT(*) as count FROM dynamic_events'
      );
      const currentCount = countResult?.count || 0;

      console.log(`📊 当前事件数量: ${currentCount}`);

      if (currentCount >= SCHEDULER_CONFIG.minEventCount) {
        console.log(`✅ 事件数量充足 (${currentCount} >= ${SCHEDULER_CONFIG.minEventCount})，无需补充`);
        task.status = 'success';
        return;
      }

      // 2. 计算需要补充的事件数量
      const supplementCount = Math.min(
        SCHEDULER_CONFIG.supplementCount,
        SCHEDULER_CONFIG.minEventCount - currentCount
      );

      console.log(`📝 需要补充 ${supplementCount} 个事件...`);

      // 3. 生成创意事件
      const generator = getEventGenerator(this.db);
      const repository = getEventRepository(this.db);

      const events: GeneratedEvent[] = [];
      for (let i = 0; i < supplementCount; i++) {
        const event = await generator.generateCreative();
        if (event) {
          events.push(event);
        }
      }

      if (events.length === 0) {
        console.log('⚠️  未生成任何事件');
        task.status = 'success';
        return;
      }

      // 4. 保存到数据库
      const eventsWithSource: Array<{ event: GeneratedEvent; sourceInfo: EventSourceInfo }> = events.map(event => ({
        event,
        sourceInfo: { sourceType: 'creative' },
      }));

      const savedIds = await repository.saveEvents(eventsWithSource);

      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ 补充事件任务完成: 新增 ${savedIds.length} 个事件 (耗时 ${elapsedTime}s)`);

      task.status = 'success';
      task.lastError = undefined;
    } catch (error: any) {
      console.error('❌ 补充事件任务失败:', error);
      task.status = 'error';
      task.lastError = error.message;
    }
  }

  /**
   * 获取调度器状态
   */
  getStatus(): SchedulerStatus {
    return {
      isRunning: this.isRunning,
      tasks: {
        dailyGeneration: { ...this.taskStatus.tasks.dailyGeneration },
        cleanup: { ...this.taskStatus.tasks.cleanup },
        supplement: { ...this.taskStatus.tasks.supplement },
      },
    };
  }

  /**
   * 手动触发每日新闻生成任务（用于测试）
   */
  async triggerDailyGeneration(): Promise<void> {
    console.log('🔧 手动触发每日新闻生成任务...');
    await this.dailyNewsGeneration();
  }

  /**
   * 手动触发清理过期事件任务（用于测试）
   */
  async triggerCleanup(): Promise<void> {
    console.log('🔧 手动触发清理过期事件任务...');
    await this.cleanupExpiredEvents();
  }

  /**
   * 手动触发补充事件任务（用于测试）
   */
  async triggerSupplement(): Promise<void> {
    console.log('🔧 手动触发补充事件任务...');
    await this.supplementEvents();
  }
}

/**
 * 单例实例
 */
let schedulerInstance: TaskScheduler | null = null;

/**
 * 启动定时任务调度器
 */
export async function startScheduler(): Promise<TaskScheduler> {
  if (!schedulerInstance) {
    schedulerInstance = new TaskScheduler();
  }

  await schedulerInstance.start();
  return schedulerInstance;
}

/**
 * 获取调度器实例
 */
export function getScheduler(): TaskScheduler | null {
  return schedulerInstance;
}

/**
 * 停止定时任务调度器
 */
export function stopScheduler(): void {
  if (schedulerInstance) {
    schedulerInstance.stop();
  }
}

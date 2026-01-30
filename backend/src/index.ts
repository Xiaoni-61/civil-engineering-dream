import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database/init.js';
import {
  signatureMiddleware,
  rateLimitMiddleware,
  errorHandler,
} from './middleware/auth.js';
import { createRunRouter } from './api/run.js';
import { createLeaderboardRouter } from './api/leaderboard.js';
import { createLLMRouter } from './api/llm.js';
import { createEventsRouter } from './api/events.js';
import { createSavesRouter } from './api/saves.js';
import { startScheduler, stopScheduler } from './services/scheduler.js';

// 加载环境变量
dotenv.config();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';

/**
 * 启动服务器
 */
async function startServer() {
  try {
    // 初始化数据库
    console.log('📦 初始化数据库...');
    const db = await initDatabase();
    console.log('✅ 数据库初始化完成');

    // 创建 Express 应用
    const app: Express = express();

    // 中间件
    app.use(cors());
    app.use(express.json());
    app.use(rateLimitMiddleware);
    app.use(signatureMiddleware);

    // 健康检查
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API 路由
    app.use('/api/run', createRunRouter(db));
    app.use('/api/leaderboard', createLeaderboardRouter(db));
    app.use('/api/llm', createLLMRouter());
    app.use('/api/events', createEventsRouter(db));
    app.use('/api/saves', createSavesRouter(db));

    // 错误处理
    app.use(errorHandler);

    // 启动定时任务调度器
    try {
      await startScheduler();
    } catch (error) {
      console.error('⚠️  定时任务调度器启动失败:', error);
      console.log('⚠️  服务器将继续运行，但定时任务不可用');
    }

    // 启动服务器
    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════╗
║  还我一个土木梦 - 后端 API 服务启动     ║
╚════════════════════════════════════════╝

🌐 服务器地址: http://${HOST}:${PORT}
📚 API 文档:
  - 健康检查: GET  /health
  - 创建游戏: POST /api/run/start
  - 完成游戏: POST /api/run/finish
  - 查询排行: GET  /api/leaderboard
  - 玩家排名: GET  /api/leaderboard/me?deviceId=xxx
  - 全球统计: GET  /api/leaderboard/stats
  - LLM状态: GET  /api/llm/status
  - 增强描述: POST /api/llm/enhance
  - 特殊事件: POST /api/llm/special-event
  - 事件健康: GET  /api/events/health
  - 今日新闻: GET  /api/events/news
  - 获取事件: GET  /api/events?playerRank=xxx
  - 记录使用: POST /api/events/:eventId/use
  - 保存存档: POST /api/saves/save

⏰ 定时任务:
  - 每日新闻生成: 每日凌晨 3:00
  - 清理过期事件: 每日凌晨 4:00
  - 补充事件检查: 每 2 小时

⚙️  环境配置:
  - NODE_ENV: ${process.env.NODE_ENV || 'development'}
  - LLM_PROVIDER: ${process.env.LLM_PROVIDER || 'deepseek'}
  - LLM_API_KEY: ${process.env.LLM_API_KEY ? '已配置' : '未配置'}

✅ 准备就绪！
      `);
    });

    // 优雅关闭
    process.on('SIGINT', async () => {
      console.log('\n📴 正在关闭服务器...');
      stopScheduler();
      await db.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  }
}

// 启动应用
startServer();

/**
 * 测试新闻事件生成
 * 运行: npx tsx test-news-generation.ts
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 backend/.env
dotenv.config({ path: resolve(__dirname, '.env') });

import { initDatabase } from './src/database/init.js';
import { getRSSFetcher } from './src/services/rssFetcher.js';
import { getEventGenerator, getEventRepository } from './src/services/eventGenerator.js';

async function testNewsGeneration() {
  console.log('🧪 测试新闻事件生成...\n');

  const startTime = Date.now();

  try {
    // 初始化数据库
    const db = await initDatabase();
    console.log('✅ 数据库初始化成功');

    // 检查当前事件数量
    const countResult = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM dynamic_events WHERE source_type = \'news\''
    );
    console.log(`📊 当前新闻事件数量: ${countResult?.count || 0}\n`);

    // 1. 抓取 RSS 新闻
    console.log('📰 步骤 1: 抓取 RSS 新闻...');
    const fetcher = getRSSFetcher();
    const newsItems = await fetcher.fetchAll();
    console.log(`   获取到 ${newsItems.length} 条新闻\n`);

    if (newsItems.length === 0) {
      console.log('⚠️ 没有获取到新闻，跳过生成');
      process.exit(0);
    }

    // 显示前 5 条新闻
    console.log('📋 新闻样例:');
    newsItems.slice(0, 5).forEach((news, i) => {
      console.log(`   ${i + 1}. [${news.source}] ${news.title}`);
    });
    console.log('');

    // 2. 通过 LLM 转换为游戏事件
    console.log('🤖 步骤 2: 通过 LLM 转换为游戏事件...');
    const generator = getEventGenerator();
    const events = await generator.batchGenerate(newsItems);
    console.log(`   生成 ${events.length} 个游戏事件\n`);

    if (events.length === 0) {
      console.log('⚠️ 没有生成事件');
      process.exit(0);
    }

    // 3. 保存到数据库
    console.log('💾 步骤 3: 保存到数据库...');
    const repository = getEventRepository(db);

    const eventsWithSource = events.map(event => {
      const newsItem = newsItems.find(n => n.title === event.title);
      return {
        event,
        sourceInfo: {
          sourceType: 'news' as const,
          sourceUrl: newsItem?.url,
          newsTitle: newsItem?.title,
        }
      };
    });

    const savedIds = await repository.saveEvents(eventsWithSource);
    console.log(`   保存 ${savedIds.length} 个事件\n`);

    // 4. 显示结果
    const newCountResult = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM dynamic_events WHERE source_type = \'news\''
    );
    console.log(`📊 生成后新闻事件数量: ${newCountResult?.count || 0}`);

    const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️  总耗时: ${elapsedTime} 秒`);

    // 列出最新的事件
    const recentEvents = await db.all<{ event_id: string; title: string; source_type: string }>(
      'SELECT event_id, title, source_type FROM dynamic_events ORDER BY created_at DESC LIMIT 5'
    );
    console.log('\n📋 最新事件:');
    recentEvents.forEach((e, i) => {
      console.log(`   ${i + 1}. [${e.source_type}] ${e.title}`);
    });

    console.log('\n✅ 测试完成!');
    process.exit(0);
  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

testNewsGeneration();

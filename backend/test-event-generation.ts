/**
 * 测试事件生成
 * 运行: npx tsx test-event-generation.ts
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 backend/.env
dotenv.config({ path: resolve(__dirname, '.env') });

import { initDatabase } from './src/database/init.js';
import { getEventGenerator, getEventRepository } from './src/services/eventGenerator.js';

async function testEventGeneration() {
  console.log('🧪 测试事件生成...\n');

  try {
    // 初始化数据库
    const db = await initDatabase();
    console.log('✅ 数据库初始化成功');

    // 检查当前事件数量
    const countResult = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM dynamic_events'
    );
    console.log(`📊 当前事件数量: ${countResult?.count || 0}\n`);

    // 获取事件生成器
    const generator = getEventGenerator();

    // 测试创意事件生成
    console.log('📝 生成 1 个创意事件...');
    const creativeEvent = await generator.generateCreative();

    if (creativeEvent) {
      console.log('\n✅ 创意事件生成成功:');
      console.log(`   标题: ${creativeEvent.title}`);
      console.log(`   描述: ${creativeEvent.description.substring(0, 100)}...`);
      console.log(`   选项数: ${creativeEvent.options.length}`);
      console.log(`   职级范围: ${creativeEvent.minRank} - ${creativeEvent.maxRank}`);

      // 保存到数据库
      const repository = getEventRepository(db);
      const savedIds = await repository.saveEvents([
        { event: creativeEvent, sourceInfo: { sourceType: 'creative' } }
      ]);
      console.log(`\n💾 已保存到数据库，ID: ${savedIds[0]}`);
    } else {
      console.log('❌ 创意事件生成失败');
    }

    // 检查生成后的事件数量
    const newCountResult = await db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM dynamic_events'
    );
    console.log(`\n📊 生成后事件数量: ${newCountResult?.count || 0}`);

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

testEventGeneration();

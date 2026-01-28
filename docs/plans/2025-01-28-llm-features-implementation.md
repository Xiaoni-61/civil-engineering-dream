# LLM Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为游戏引入 LLM 驱动的智能事件生成系统和动态叙事系统，提升可玩性和代入感

**Architecture:**
- 后台任务每日凌晨通过 RSS 抓取新闻，调用 LLM 批量生成事件存入数据库
- 游戏结束时可选择生成个性化职业传记（异步调用 LLM）
- 所有 LLM 调用采用预生成模式，玩家体验零延迟

**Tech Stack:**
- RSS: rss-parser (npm 包)
- 定时任务: node-cron
- LLM: 复用现有 llmService.ts
- Markdown 渲染: react-markdown

---

## Phase 1: 配置与基础设施

### Task 1: 创建 RSS 配置文件

**Files:**
- Create: `backend/src/config/rss-sources.ts`

**Step 1: 创建配置文件**

```typescript
export interface RSSSource {
  url: string;
  name: string;
  weight: number;
  category: 'professional' | 'general' | 'financial' | 'tech';
}

export const RSS_SOURCES: RSSSource[] = [
  // 专业类（高权重）
  {
    url: 'http://www.cns.com.cn/rss/',
    name: '建筑时报',
    weight: 1.5,
    category: 'professional'
  },
  {
    url: 'https://www.cenews.com.cn/rss/',
    name: '中国建筑新闻网',
    weight: 1.5,
    category: 'professional'
  },

  // 综合类（中权重）
  {
    url: 'https://news.qq.com/newsv/rss_quotation.xml',
    name: '腾讯新闻',
    weight: 1.0,
    category: 'general'
  },
  {
    url: 'http://www.xinhuanet.com/rss/news.xml',
    name: '新华网',
    weight: 1.0,
    category: 'general'
  },
  {
    url: 'https://news.ifeng.com/rss/index.xml',
    name: '凤凰网资讯',
    weight: 1.0,
    category: 'general'
  },

  // 财经类
  {
    url: 'https://www.caijing.com.cn/rss/estate.xml',
    name: '财经网房产',
    weight: 1.2,
    category: 'financial'
  },

  // 科技类
  {
    url: 'https://www.stdaily.com/rss/keji.xml',
    name: '科技日报',
    weight: 0.8,
    category: 'tech'
  }
];

// 过滤关键词
export const FILTER_KEYWORDS = [
  // 建筑工程类
  '建筑', '工程', '土木', '基建', '房地产', '施工',
  '建筑公司', '房产', '城市规划', '建材', '水泥',
  '钢筋', '混凝土', '工地', '楼盘', '住建',

  // 宏观经济类
  '金融', '利率', '关税', '通胀', '货币政策',
  '降息', '加息', '降准', 'GDP', '经济数据',
  '人民币', '汇率', '股市', '债券', '央行',

  // 行业相关
  '固定资产投资', '基建投资', '房地产开发投资',
  '建材价格', '原材料价格', '供应链', '物流',

  // 政策法规
  '限购', '调控', '楼市新政', '房产税',
  '土地政策', '环保政策', '安全生产',

  // 企业相关
  '建筑企业', '房企', '上市公司', '财报',
  '营收', '利润', '债务', '融资',

  // 其他相关
  '保障房', '棚改', '旧改', '城市更新',
  '绿色建筑', '装配式建筑', '智能建造'
];

// 黑名单关键词
export const BLACKLIST_KEYWORDS = [
  '娱乐', '八卦', '体育', '游戏',
  '医疗', '教育', '军事'
];

// 强相关关键词（可覆盖黑名单）
export const STRONG_KEYWORDS = [
  '建筑', '工程', '房地产', '基建'
];

// 事件池配置
export const EVENT_POOL_CONFIG = {
  weights: {
    fixed: 0.35,    // 固定事件 35%
    news: 0.50,     // 新闻事件 50%
    creative: 0.15  // 创意事件 15%
  },
  // 权重衰减配置
  decay: {
    maxAgeDays: 7,
    decaySchedule: [
      { days: 0, weight: 1.0 },
      { days: 1, weight: 0.8 },
      { days: 2, weight: 0.6 },
      { days: 3, weight: 0.3 },
      { days: 4, weight: 0.1 },
      { days: 5, weight: 0.05 }
    ]
  }
};

// LLM 配置
export const LLM_CONFIG = {
  batchSize: 10,              // 每次处理新闻数量
  concurrency: 3,             // 并发 LLM 调用数
  timeout: 30000,             // 30 秒超时
  maxRetries: 2               // 最大重试次数
};
```

**Step 2: 提交配置文件**

```bash
cd /Users/jax/projects/civil-engineering-dream/backend
git add src/config/rss-sources.ts
git commit -m "feat: add RSS sources and keywords configuration

- 配置 7 个 RSS 数据源（专业/综合/财经/科技）
- 添加白名单/黑名单/强相关关键词
- 添加事件池权重配置
- 添加 LLM 调用配置"
```

---

### Task 2: 创建数据库表

**Files:**
- Modify: `backend/src/database/init.ts`

**Step 1: 在现有数据库初始化代码后添加新表**

找到 `export function initDatabase()` 函数，在现有表创建后添加：

```typescript
// 动态事件表
db.run(`
  CREATE TABLE IF NOT EXISTS dynamic_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT UNIQUE NOT NULL,
    source_type TEXT NOT NULL,
    source_url TEXT,
    news_title TEXT,
    news_date TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    options TEXT NOT NULL,
    min_rank TEXT NOT NULL,
    max_rank TEXT NOT NULL,
    base_weight REAL DEFAULT 1.0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_used_at TEXT,
    usage_count INTEGER DEFAULT 0,
    is_validated BOOLEAN DEFAULT 0,
    quality_score REAL DEFAULT 0.5
  )
`);

// 职业传记缓存表
db.run(`
  CREATE TABLE IF NOT EXISTS career_biographies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT UNIQUE NOT NULL,
    player_name TEXT NOT NULL,
    content TEXT NOT NULL,
    game_data TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    shared_count INTEGER DEFAULT 0
  )
`);

// 事件使用日志表
db.run(`
  CREATE TABLE IF NOT EXISTS event_usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    player_name TEXT,
    player_rank TEXT,
    choice_index INTEGER,
    played_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);
```

**Step 2: 创建索引**

```typescript
// 为动态事件创建索引
db.run(`CREATE INDEX IF NOT EXISTS idx_dynamic_events_rank
        ON dynamic_events (min_rank, max_rank)`);

db.run(`CREATE INDEX IF NOT EXISTS idx_dynamic_events_created
        ON dynamic_events (created_at DESC)`);

db.run(`CREATE INDEX IF NOT EXISTS idx_dynamic_events_weight
        ON dynamic_events (base_weight DESC)`);
```

**Step 3: 提交数据库变更**

```bash
cd /Users/jax/projects/civil-engineering-dream/backend
git add src/database/init.ts
git commit -m "feat: add tables for dynamic events and biographies

- dynamic_events: 存储 LLM 生成的事件
- career_biographies: 缓存生成的职业传记
- event_usage_log: 记录事件使用情况用于优化
- 添加索引优化查询性能"
```

---

## Phase 2: RSS 抓取器

### Task 3: 安装依赖

**Files:**
- Modify: `backend/package.json`

**Step 1: 添加依赖**

```bash
cd /Users/jax/projects/civil-engineering-dream/backend
npm install rss-parser node-cron
npm install --save-dev @types/node-cron
```

**Step 2: 提交 package-lock.json**

```bash
git add package.json package-lock.json
git commit -m "feat: add rss-parser and node-cron dependencies"
```

---

### Task 4: 实现 RSS 抓取器

**Files:**
- Create: `backend/src/services/rssFetcher.ts`

**Step 1: 创建 RSS 抓取器**

```typescript
import Parser from 'rss-parser';
import { RSS_SOURCES, FILTER_KEYWORDS, BLACKLIST_KEYWORDS, STRONG_KEYWORDS } from '../config/rss-sources.js';

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate?: Date;
  source: string;
}

export class RSSFetcher {
  private parser: Parser;
  private unavailableSources: Map<string, number> = new Map();

  constructor() {
    this.parser = new Parser({
      timeout: 5000,
      customFields: {
        item: ['description', 'pubDate']
      }
    });
  }

  async fetchAll(): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];

    for (const source of RSS_SOURCES) {
      // 检查是否在不可用列表中
      if (this.isUnavailable(source.url)) {
        console.log(`⏭️ 跳过不可用源: ${source.name}`);
        continue;
      }

      try {
        console.log(`📡 抓取: ${source.name}`);
        const feed = await this.parser.parseURL(source.url);

        if (feed.items) {
          const filtered = feed.items
            .map(item => ({
              title: item.title || '',
              description: item.description || item.contentSnippet || '',
              link: item.link || '',
              pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
              source: source.name
            }))
            .filter(item => this.isRelevant(item.title, item.description));

          allNews.push(...filtered);
          console.log(`✅ ${source.name}: ${filtered.length} 条相关新闻`);
        }

      } catch (error: any) {
        this.handleFetchError(source, error);
      }
    }

    console.log(`📰 总计抓取 ${allNews.length} 条相关新闻`);
    return allNews;
  }

  private isRelevant(title: string, description: string): boolean {
    const content = `${title} ${description}`.toLowerCase();

    // 必须包含白名单关键词
    const hasWhitelist = FILTER_KEYWORDS.some(kw =>
      content.includes(kw.toLowerCase())
    );

    if (!hasWhitelist) return false;

    // 检查黑名单
    const hasBlacklist = BLACKLIST_KEYWORDS.some(kw =>
      content.includes(kw.toLowerCase())
    );

    if (hasBlacklist) {
      // 检查是否有强相关词
      return STRONG_KEYWORDS.some(kw => content.includes(kw.toLowerCase()));
    }

    return true;
  }

  private handleFetchError(source: any, error: any) {
    console.error(`❌ ${source.name} 抓取失败:`, error.message);

    if (error.code === 'ENOTFOUND') {
      this.markUnavailable(source.url, 24);
    } else if (error.code === 'ECONNRESET') {
      this.markUnavailable(source.url, 1);
    }
  }

  private markUnavailable(url: string, hours: number): void {
    const until = Date.now() + hours * 60 * 60 * 1000;
    this.unavailableSources.set(url, until);
  }

  private isUnavailable(url: string): boolean {
    const until = this.unavailableSources.get(url);
    if (!until) return false;

    if (Date.now() > until) {
      this.unavailableSources.delete(url);
      return false;
    }

    return true;
  }
}
```

**Step 2: 提交 RSS 抓取器**

```bash
git add src/services/rssFetcher.ts
git commit -m "feat: implement RSS fetcher with multi-source support

- 支持 7 个 RSS 数据源
- 关键词过滤（白名单/黑名单/强相关）
- 源不可用标记机制（避免重复失败请求）
- 超时控制（5秒）"
```

---

## Phase 3: LLM 事件生成服务

### Task 5: 创建 Prompt 模板

**Files:**
- Create: `backend/prompts/event-generation/news-based-event.md`

**Step 1: 创建新闻事件生成 Prompt 模板**

```markdown
# 基于新闻生成游戏事件

你是一个专业的游戏事件设计师，为《还我一个土木梦》游戏设计事件。

## 游戏背景
这是一个模拟土木工程项目经理职业生涯的游戏，玩家从实习生开始，通过处理各种工程事件，最终晋升为合伙人。

## 核心资源
- 现金 (cash)：项目资金
- 健康 (health)：玩家身体状态
- 声誉 (reputation)：行业口碑

## 输入信息
- 新闻标题：{{news_title}}
- 新闻摘要：{{news_summary}}
- 目标职级：{{target_rank}}

## 要求
1. 事件必须与土木工程行业相关
2. 数值影响控制在 ±10% 以内
3. 提供 2-3 个选项，每个选项有明确后果
4. 标题简短有力（10字以内）
5. 描述生动具体（50字以内）
6. 选项要体现权衡，不能有明显的最优解

## 输出格式（必须是有效的 JSON）
```json
{
  "title": "事件标题",
  "description": "事件描述",
  "options": [
    {
      "text": "选项描述",
      "effects": {
        "cash": 数值变化,
        "health": 数值变化,
        "reputation": 数值变化
      }
    }
  ]
}
```

## 示例
输入：
- 新闻：央行宣布降息0.25个百分点
- 目标职级：项目经理

输出：
```json
{
  "title": "融资窗口期",
  "description": "央行降息后，银行放款意愿增强。你的项目有机会获得更低利率的贷款，但需要支付额外评估费用。",
  "options": [
    {
      "text": "申请贷款",
      "effects": {
        "cash": 15,
        "reputation": 0
      }
    },
    {
      "text": "维持现状",
      "effects": {
        "cash": 0,
        "reputation": 5
      }
    }
  ]
}
```
```

**Step 2: 创建创意事件生成 Prompt**

```markdown
# 纯创意事件生成

你是一个专业的游戏事件设计师，为《还我一个土木梦》游戏设计纯创意事件。

## 主题方向
- 工地日常趣事
- 行业现象讽刺
- 职场困境
- 技术难题
- 客户奇葩要求

## 要求
1. 不需要基于真实新闻，完全创意发挥
2. 贴近土木工程行业现实
3. 可以幽默、讽刺，但要有代入感
4. 数值影响控制在 ±15% 以内
5. 其他要求同新闻事件

## 输出格式
同新闻事件
```

**Step 3: 创建职业传记生成 Prompt**

```markdown
# 职业传记生成

你是一个专业的游戏叙事设计师，为《还我一个土木梦》游戏玩家生成个性化的职业传记。

## 输入数据
- 玩家名：{{player_name}}
- 游戏时长：{{quarters_played}} 季度
- 最终职级：{{final_rank}}
- 结束原因：{{end_reason}}
- 最终数值：现金、健康、声誉
- 关键决策：{{key_decisions}}
- 特殊成就：{{special_achievements}}

## 传记结构
```markdown
# 《{{player_name}}的土木工程之路》

## 第一章：初入职场
描述玩家开局属性评价、早期关键事件回顾、第一个转折点

## 第二章：成长之路
描述职业晋升历程、重要决策分析、风险事件回顾

## 第三章：{{结局标题}}
描述最终成就、关键数据总结、个性化评语

---
**统计数据**
- 季度数：X
- 完成项目：X 个（优质 X 个）
- 最高现金：X
- 结局评价：XXX
```

## 要求
1. 语言生动有趣，有代入感
2. 突出玩家的关键决策和成就
3. 根据结局给出恰当的评价（可以是幽默、鼓励或惋惜）
4. 总字数 500-800 字
```

**Step 4: 提交 Prompt 模板**

```bash
git add backend/prompts/
git commit -m "feat: add LLM prompt templates

- news-based-event.md: 基于新闻生成事件
- creative-event.md: 纯创意事件生成
- career-biography.md: 职业传记生成"
```

---

### Task 6: 实现 LLM 事件生成服务

**Files:**
- Create: `backend/src/services/eventGenerator.ts`

**Step 1: 创建事件生成服务**

```typescript
import fs from 'fs/promises';
import path from 'path';
import { enhanceDescription } from './llmService.js';

interface NewsItem {
  title: string;
  description: string;
  link: string;
  source: string;
}

interface GeneratedEvent {
  event_id: string;
  source_type: 'news' | 'creative';
  source_url?: string;
  news_title?: string;
  news_date?: string;
  title: string;
  description: string;
  options: string;
  min_rank: string;
  max_rank: string;
  base_weight: number;
}

export class EventGenerator {
  private promptDir: string;

  constructor() {
    this.promptDir = path.join(process.cwd(), 'prompts');
  }

  async generateFromNews(news: NewsItem[]): Promise<GeneratedEvent[]> {
    const events: GeneratedEvent[] = [];
    const prompt = await this.loadPrompt('event-generation/news-based-event.md');

    // 按批次处理（避免过载）
    const batchSize = 10;
    for (let i = 0; i < news.length; i += batchSize) {
      const batch = news.slice(i, i + batchSize);
      const batchEvents = await Promise.all(
        batch.map(item => this.generateEvent(item, prompt))
      );
      events.push(...batchEvents.filter(e => e !== null));
    }

    return events;
  }

  async generateCreative(count: number = 5): Promise<GeneratedEvent[]> {
    const prompt = await this.loadPrompt('event-generation/creative-event.md');
    const events: GeneratedEvent[] = [];

    for (let i = 0; i < count; i++) {
      const event = await this.generateEvent(null, prompt);
      if (event) events.push(event);
    }

    return events;
  }

  private async generateEvent(news: NewsItem | null, promptTemplate: string): Promise<GeneratedEvent | null> {
    try {
      // 构建完整 prompt
      const fullPrompt = promptTemplate
        .replace('{{news_title}}', news?.title || '（创意事件）')
        .replace('{{news_summary}}', news?.description || '（创意生成）')
        .replace('{{target_rank}}', 'ENGINEER'); // 默认中等级

      // 调用 LLM
      const response = await enhanceDescription(fullPrompt);

      // 解析 JSON 响应
      const eventData = JSON.parse(response);

      // 生成唯一 ID
      const eventId = news
        ? `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        : `creative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      return {
        event_id: eventId,
        source_type: news ? 'news' : 'creative',
        source_url: news?.link,
        news_title: news?.title,
        news_date: news?.pubDate?.toISOString().split('T')[0],
        title: eventData.title,
        description: eventData.description,
        options: JSON.stringify(eventData.options),
        min_rank: 'INTERN',
        max_rank: 'PROJECT_DIRECTOR',
        base_weight: 1.0
      };

    } catch (error) {
      console.error('事件生成失败:', error);
      return null;
    }
  }

  private async loadPrompt(relativePath: string): Promise<string> {
    const fullPath = path.join(this.promptDir, relativePath);
    return await fs.readFile(fullPath, 'utf-8');
  }
}
```

**Step 2: 提交事件生成服务**

```bash
git add src/services/eventGenerator.ts
git commit -m "feat: implement LLM event generator service

- generateFromNews: 批量从新闻生成事件
- generateCreative: 生成纯创意事件
- 复用现有 enhanceDescription LLM 调用
- JSON 解析和错误处理"
```

---

## Phase 4: 后台任务调度

### Task 7: 实现定时任务

**Files:**
- Create: `backend/src/scheduler.ts`

**Step 1: 创建调度器**

```typescript
import cron from 'node-cron';
import { Database } from './database/init.js';
import { RSSFetcher } from './services/rssFetcher.js';
import { EventGenerator } from './services/eventGenerator.js';

export class TaskScheduler {
  private rssFetcher: RSSFetcher;
  private eventGenerator: EventGenerator;

  constructor(private db: Database) {
    this.rssFetcher = new RSSFetcher();
    this.eventGenerator = new EventGenerator();
  }

  start() {
    console.log('🕐 启动后台任务调度器...');

    // 每日凌晨 3:00：新闻抓取 + 事件生成
    cron.schedule('0 3 * * *', () => this.dailyNewsGeneration());

    // 每日凌晨 4:00：清理过期事件
    cron.schedule('0 4 * * *', () => this.cleanupExpiredEvents());

    // 每 2 小时：检查事件数量，不足则补充
    cron.schedule('0 */2 * * *', () => this.supplementEvents());
  }

  private async dailyNewsGeneration() {
    console.log('🌅 开始每日新闻抓取任务');
    const startTime = Date.now();

    try {
      // 1. 抓取新闻
      const news = await this.rssFetcher.fetchAll();
      console.log(`📰 抓取到 ${news.length} 条相关新闻`);

      if (news.length === 0) {
        console.log('⚠️ 未获取到新闻，使用备用方案');
        return;
      }

      // 2. 生成新闻事件
      const newsEvents = await this.eventGenerator.generateFromNews(news);
      await this.saveEvents(newsEvents);
      console.log(`✅ 成功生成 ${newsEvents.length} 个新闻事件`);

      // 3. 生成创意事件（5 个）
      const creativeEvents = await this.eventGenerator.generateCreative(5);
      await this.saveEvents(creativeEvents);
      console.log(`✅ 成功生成 ${creativeEvents.length} 个创意事件`);

    } catch (error) {
      console.error('❌ 每日任务失败:', error);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`⏱️ 任务完成，耗时 ${duration} 秒`);
  }

  private async cleanupExpiredEvents() {
    const result = await this.db.run(`
      DELETE FROM dynamic_events
      WHERE created_at < datetime('now', '-7 days')
    `);
    console.log(`🗑️ 清理了 ${result.changes} 个过期事件`);
  }

  private async supplementEvents() {
    // 检查今日事件数量
    const todayCount = await this.db.get(`
      SELECT COUNT(*) as count FROM dynamic_events
      WHERE DATE(created_at) = DATE('now')
    `);

    if (todayCount.count < 10) {
      console.log('⚠️ 今日事件不足，补充生成创意事件');
      const events = await this.eventGenerator.generateCreative(10);
      await this.saveEvents(events);
    }
  }

  private async saveEvents(events: any[]) {
    const stmt = await this.db.prepare(`
      INSERT INTO dynamic_events
      (event_id, source_type, source_url, news_title, news_date,
       title, description, options, min_rank, max_rank, base_weight)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const event of events) {
      await stmt.run(
        event.event_id,
        event.source_type,
        event.source_url || null,
        event.news_title || null,
        event.news_date || null,
        event.title,
        event.description,
        event.options,
        event.min_rank,
        event.max_rank,
        event.base_weight
      );
    }

    await stmt.finalize();
  }
}
```

**Step 2: 在主服务中启动调度器**

修改 `backend/src/index.ts`：

```typescript
import { TaskScheduler } from './scheduler.js';

// 在 app.listen 之后添加
const db = getDatabase(); // 获取数据库实例
const scheduler = new TaskScheduler(db);
scheduler.start();
console.log('🕐 后台任务调度器已启动');
```

**Step 3: 提交调度器**

```bash
git add src/scheduler.ts src/index.ts
git commit -m "feat: implement cron-based task scheduler

- 每日 3AM: 新闻抓取 + 事件生成
- 每日 4AM: 清理过期事件
- 每2小时: 检查并补充事件
- 支持失败重试和日志记录"
```

---

## Phase 5: API 实现

### Task 8: 实现事件相关 API

**Files:**
- Create: `backend/src/api/events.ts`

**Step 1: 创建 API 路由**

```typescript
import { Router } from 'express';
import { Database } from '../database/init.js';

export function createEventsRouter(db: Database): Router {
  const router = Router();

  /**
   * GET /api/events/health
   * 查看今日事件生成状态
   */
  router.get('/health', async (req, res) => {
    try {
      const todayEvents = await db.all(`
        SELECT source_type, COUNT(*) as count
        FROM dynamic_events
        WHERE DATE(created_at) = DATE('now')
        GROUP BY source_type
      `);

      const total = await db.get(`
        SELECT COUNT(*) as count FROM dynamic_events
        WHERE DATE(created_at) = DATE('now')
      `);

      res.json({
        code: 'SUCCESS',
        data: {
          date: new Date().toISOString().split('T')[0],
          total: total?.count || 0,
          bySource: todayEvents
        }
      });
    } catch (error) {
      console.error('获取事件状态失败:', error);
      res.status(500).json({
        code: 'ERROR',
        message: '服务器错误'
      });
    }
  });

  /**
   * GET /api/events/news
   * 获取今日新闻源列表
   */
  router.get('/news', async (req, res) => {
    try {
      const news = await db.all(`
        SELECT news_title, news_date, source_url, created_at
        FROM dynamic_events
        WHERE source_type = 'news'
        ORDER BY created_at DESC
        LIMIT 20
      `);

      res.json({
        code: 'SUCCESS',
        data: news
      });
    } catch (error) {
      res.status(500).json({
        code: 'ERROR',
        message: '服务器错误'
      });
    }
  });

  return router;
}
```

**Step 2: 注册路由**

修改 `backend/src/index.ts`：

```typescript
import { createEventsRouter } from './api/events.js';

// 在现有路由后添加
app.use('/api/events', createEventsRouter(db));
```

**Step 3: 提交 API**

```bash
git add src/api/events.ts src/index.ts
git commit -m "feat: add events API endpoints

- GET /api/events/health: 查看今日事件状态
- GET /api/events/news: 获取今日新闻列表"
```

---

## Phase 6: 前端集成

### Task 9: 安装前端依赖

**Files:**
- Modify: `frontend/package.json`

**Step 1: 添加依赖**

```bash
cd /Users/jax/projects/civil-engineering-dream/frontend
npm install react-markdown
```

**Step 2: 提交**

```bash
git add package.json package-lock.json
git commit -m "feat: add react-markdown dependency"
```

---

### Task 10: 创建前端 API

**Files:**
- Create: `frontend/src/api/eventsApi.ts`

**Step 1: 创建 API 客户端**

```typescript
import { apiRequest } from './index';

export async function getEventsHealth() {
  const response = await apiRequest('/api/events/health');
  return response.data;
}

export async function getTodayNews() {
  const response = await apiRequest('/api/events/news');
  return response.data;
}

export async function generateBiography(gameId: string) {
  const response = await apiRequest(`/api/events/biography/${gameId}`, {
    method: 'POST'
  });
  return response.data;
}

export async function shareBiography(gameId: string) {
  const response = await apiRequest(`/api/events/biography/${gameId}/share`, {
    method: 'POST'
  });
  return response.data;
}
```

**Step 2: 导出**

修改 `frontend/src/api/index.ts`：

```typescript
export * from './eventsApi';
```

**Step 3: 提交**

```bash
git add src/api/eventsApi.ts src/api/index.ts
git commit -m "feat: add events API client functions"
```

---

### Task 11: 修改 Result 页面

**Files:**
- Modify: `frontend/src/pages/Result.tsx`

**Step 1: 添加传记功能**

在现有 `Result` 组件中添加：

```typescript
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { generateBiography, shareBiography } from '@/api/eventsApi';
import { useGameStoreNew } from '@/store/gameStoreNew';

// 在组件内添加状态
const [biography, setBiography] = useState<string | null>(null);
const [isGenerating, setIsGenerating] = useState(false);
const [showBiography, setShowBiography] = useState(false);

// 获取 runId
const runId = useGameStoreNew((state) => state.runId);

// 生成传记函数
const handleGenerateBiography = async () => {
  if (!runId) {
    alert('游戏数据不完整');
    return;
  }

  setIsGenerating(true);
  try {
    const result = await generateBiography(runId);
    setBiography(result.content);
    setShowBiography(true);
  } catch (error) {
    console.error('生成传记失败:', error);
    alert('生成传记失败，请稍后重试');
  } finally {
    setIsGenerating(false);
  }
};

// 分享函数
const handleShareBiography = async () => {
  if (!runId) return;
  try {
    await shareBiography(runId);
    alert('分享成功！');
  } catch (error) {
    console.error('分享失败:', error);
  }
};

// 复制到剪贴板
const handleCopyBiography = () => {
  navigator.clipboard.writeText(biography || '');
  alert('已复制到剪贴板');
};
```

**Step 2: 在按钮区域添加传记按钮**

在现有按钮后添加：

```typescript
{/* 生成职业传记按钮 */}
<button
  onClick={handleGenerateBiography}
  disabled={isGenerating || !runId}
  className="w-full py-4 px-6 rounded-feishu font-bold text-white
             bg-gradient-to-r from-purple-600 to-indigo-700
             hover:from-purple-500 hover:to-indigo-600
             shadow-lg hover:shadow-xl transition-all
             disabled:opacity-50 disabled:cursor-not-allowed
             mt-3"
>
  {isGenerating ? (
    <span className="flex items-center justify-center">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
           xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      AI 正在书写你的故事...
    </span>
  ) : (
    <span className="flex items-center justify-center">
      <span className="mr-2">📖</span>
      生成职业传记
    </span>
  )}
</button>

{/* 传记展示 */}
{showBiography && biography && (
  <div className="mt-6 bg-white rounded-feishu-lg shadow-feishu-xl p-6
              border border-purple-100 animate-fade-in">
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown>{biography}</ReactMarkdown>
    </div>

    <div className="mt-4 flex gap-3">
      <button
        onClick={handleShareBiography}
        className="flex-1 py-2 px-4 rounded-feishu font-medium
                   bg-emerald-500 hover:bg-emerald-600 text-white
                   transition-colors"
      >
        📤 分享我的故事
      </button>
      <button
        onClick={handleCopyBiography}
        className="flex-1 py-2 px-4 rounded-feishu font-medium
                   bg-slate-100 hover:bg-slate-200 text-slate-700
                   transition-colors"
      >
        📋 复制文本
      </button>
    </div>
  </div>
)}
```

**Step 3: 提交**

```bash
git add src/pages/Result.tsx
git commit -m "feat: add biography generation feature to Result page

- 添加生成职业传记按钮
- 显示 loading 状态
- Markdown 渲染传记内容
- 分享和复制功能"
```

---

## Phase 7: 职业传记后端实现

### Task 12: 实现传记生成 API

**Files:**
- Modify: `backend/src/api/events.ts`

**Step 1: 添加传记生成端点**

```typescript
/**
 * POST /api/events/biography/:gameId
 * 生成职业传记
 */
router.post('/biography/:gameId', async (req, res) => {
  const { gameId } = req.params;

  try {
    // 1. 检查缓存
    const existing = await db.get(
      'SELECT content FROM career_biographies WHERE game_id = ?',
      [gameId]
    );

    if (existing) {
      return res.json({
        code: 'SUCCESS',
        data: {
          content: existing.content,
          cached: true
        }
      });
    }

    // 2. 获取游戏数据
    const gameData = await db.get(
      'SELECT runId, playerName, finalRank, endReason, currentQuarter,
              finalCash, finalHealth, finalReputation, gameStats
       FROM game_stats WHERE runId = ?',
      [gameId]
    );

    if (!gameData) {
      return res.status(404).json({
        code: 'GAME_NOT_FOUND',
        message: '游戏记录不存在'
      });
    }

    // 3. 构建输入数据
    const input = {
      player_name: gameData.playerName,
      quarters_played: gameData.currentQuarter,
      final_rank: gameData.finalRank,
      end_reason: gameData.endReason,
      final_cash: gameData.finalCash,
      final_health: gameData.finalHealth,
      final_reputation: gameData.finalReputation,
      key_decisions: [], // TODO: 从决策历史获取
      special_achievements: [] // TODO: 计算特殊成就
    };

    // 4. 调用 LLM 生成传记
    const prompt = await loadPrompt('narrative/career-biography.md');
    const fullPrompt = buildPrompt(prompt, input);

    // 复用现有 LLM 服务
    const { enhanceDescription } = await import('../services/llmService.js');
    const biography = await enhanceDescription(fullPrompt);

    // 5. 缓存结果
    await db.run(
      'INSERT INTO career_biographies (game_id, player_name, content, game_data) VALUES (?, ?, ?, ?)',
      [gameId, gameData.playerName, biography, JSON.stringify(input)]
    );

    res.json({
      code: 'SUCCESS',
      data: {
        content: biography,
        cached: false
      }
    });

  } catch (error) {
    console.error('生成传记失败:', error);
    res.status(500).json({
      code: 'ERROR',
      message: '生成传记失败'
    });
  }
});

/**
 * POST /api/events/biography/:gameId/share
 * 分享传记
 */
router.post('/biography/:gameId/share', async (req, res) => {
  try {
    await db.run(
      'UPDATE career_biographies SET shared_count = shared_count + 1 WHERE game_id = ?',
      [req.params.gameId]
    );

    res.json({ code: 'SUCCESS' });
  } catch (error) {
    res.status(500).json({
      code: 'ERROR',
      message: '分享失败'
    });
  }
});
```

**Step 2: 提交**

```bash
git add src/api/events.ts
git commit -m "feat: add biography generation endpoints

- POST /api/events/biography/:gameId: 生成职业传记
- POST /api/events/biography/:gameId/share: 分享计数
- 缓存机制避免重复生成"
```

---

## Phase 8: 测试与优化

### Task 13: 添加日志和监控

**Files:**
- Modify: `backend/src/scheduler.ts`

**Step 1: 添加详细日志**

在关键位置添加日志：

```typescript
// 在 dailyNewsGeneration 开始
console.log(`[DailyTask] 开始日期: ${new Date().toISOString()}`);

// 在事件保存后
console.log(`[DailyTask] 新闻事件: ${newsEvents.length}, 创意事件: ${creativeEvents.length}`);

// 在 cleanupExpiredEvents
console.log(`[Cleanup] 清理过期事件: ${result.changes} 个`);
```

**Step 2: 提交**

```bash
git add src/scheduler.ts
git commit -m "feat: add detailed logging for task monitoring"
```

---

### Task 14: 测试 RSS 抓取

**Step 1: 手动测试脚本**

创建 `backend/test/test-rss.mjs`：

```javascript
import { RSSFetcher } from '../src/services/rssFetcher.js';

async function test() {
  const fetcher = new RSSFetcher();
  const news = await fetcher.fetchAll();
  console.log(`\n抓取到 ${news.length} 条新闻:\n`);

  news.slice(0, 5).forEach((n, i) => {
    console.log(`${i + 1}. [${n.source}] ${n.title}`);
  });
}

test().catch(console.error);
```

**Step 2: 运行测试**

```bash
cd /Users/jax/projects/civil-engineering-dream/backend
node test/test-rss.mjs
```

**Step 3: 提交测试脚本**

```bash
git add test/test-rss.mjs
git commit -m "test: add RSS fetcher test script"
```

---

### Task 15: 验证整体功能

**Step 1: 启动后端**

```bash
cd /Users/jax/projects/civil-engineering-dream/backend
npm run dev
```

**Step 2: 检查 API**

```bash
# 健康检查
curl http://localhost:3001/api/events/health

# 获取新闻
curl http://localhost:3001/api/events/news
```

**Step 3: 启动前端测试**

```bash
cd /Users/jax/projects/civil-engineering-dream/frontend
npm run dev
```

**Step 4: 游戏测试流程**

1. 创建角色开始游戏
2. 玩到游戏结束
3. 点击"生成职业传记"
4. 验证传记生成和分享功能

**Step 5: 记录测试结果**

如果测试通过，继续；如果发现问题，记录并修复。

---

## 完成检查清单

- [ ] RSS 配置文件创建
- [ ] 数据库表创建
- [ ] RSS 抓取器实现
- [ ] LLM 事件生成服务实现
- [ ] 定时任务调度器实现
- [ ] 事件相关 API 实现
- [ ] 前端 API 客户端创建
- [ ] Result 页面传记功能集成
- [ ] 传记生成 API 实现
- [ ] 日志和监控添加
- [ ] 整体功能测试通过

---

## 预期成果

完成后，游戏将具备以下新功能：

1. **每日自动生成事件**：后台任务每日凌晨抓取新闻并生成 20-30 个新事件
2. **智能事件池**：游戏时自动混合固定事件、新闻事件、创意事件
3. **职业传记**：游戏结束可生成个性化传记，支持分享和复制
4. **零延迟体验**：所有 LLM 调用后台完成，玩家无感知
5. **可维护配置**：关键词和配置独立文件，方便调整

---

## 后续优化方向

- [ ] 添加事件质量评分系统
- [ ] 实现事件 A/B 测试
- [ ] 添加更多 Prompt 模板变体
- [ ] 支持玩家自定义事件
- [ ] 添加事件推荐算法

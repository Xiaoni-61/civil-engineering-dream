# LLM 驱动功能设计文档

**日期**: 2025-01-28
**状态**: 设计阶段
**作者**: Claude AI

---

## 概述

为《还我一个土木梦》游戏引入 LLM 驱动的智能功能，提升游戏可玩性和代入感。

**核心功能**：
1. 智能事件生成系统 - 基于实时新闻生成游戏事件
2. 动态叙事系统 - 游戏结束时生成个性化职业传记

**设计原则**：
- ⚡ 零延迟：所有 LLM 调用后台预生成，玩家无感知
- ⚖️ 平衡性：数值影响控制在 ±10% 以内，不破坏游戏平衡
- 🎯 可维护：Prompt 模板独立维护，便于调整优化

---

## 功能一：智能事件生成系统

### 1.1 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│  每日凌晨 3:00 后台任务                                      │
├─────────────────────────────────────────────────────────────┤
│  1. 新闻爬取模块                                            │
│     - RSS 订阅多源抓取                                      │
│     - 关键词过滤（建筑/金融/政策等）                        │
│     - 去重、清洗、分类                                      │
│                                                             │
│  2. LLM 事件生成模块                                        │
│     - 输入：新闻 + 游戏上下文                               │
│     - 输出：结构化事件（JSON）                              │
│     - 批量生成（并发控制：同时 3 个）                        │
│                                                             │
│  3. 事件入库与权重管理                                     │
│     - 存储到数据库                                          │
│     - 时间衰减权重（新事件权重高，旧事件逐渐降低）           │
└─────────────────────────────────────────────────────────────┘

玩家游戏时：
- 事件池 = 固定事件 35% + 新闻事件 50% + LLM 创意事件 15%
- 根据玩家职级筛选合适事件
- 0 延迟读取
```

### 1.2 RSS 数据源配置

**文件位置**: `backend/src/config/rss-sources.ts`

```typescript
export const RSS_SOURCES: RSSSource[] = [
  // 专业类（权重 1.5）
  { url: 'http://www.cns.com.cn/rss/', name: '建筑时报', category: 'professional' },
  { url: 'https://www.cenews.com.cn/rss/', name: '中国建筑新闻网', category: 'professional' },

  // 综合类（权重 1.0）
  { url: 'https://news.qq.com/newsv/rss_quotation.xml', name: '腾讯新闻', category: 'general' },
  { url: 'http://www.xinhuanet.com/rss/news.xml', name: '新华网', category: 'general' },
  { url: 'https://news.ifeng.com/rss/index.xml', name: '凤凰网资讯', category: 'general' },

  // 财经类（权重 1.2）
  { url: 'https://www.caijing.com.cn/rss/estate.xml', name: '财经网房产', category: 'financial' },

  // 科技类（权重 0.8）
  { url: 'https://www.stdaily.com/rss/keji.xml', name: '科技日报', category: 'tech' }
];
```

### 1.3 关键词配置

**文件位置**: `backend/src/config/rss-sources.ts`

```typescript
// 白名单关键词
export const FILTER_KEYWORDS = [
  // 建筑工程类
  '建筑', '工程', '土木', '基建', '房地产', '施工',

  // 宏观经济类
  '金融', '利率', '关税', '通胀', '货币政策',
  '降息', '加息', '人民币', '汇率',

  // 行业相关
  '固定资产投资', '建材价格', '原材料价格',

  // 政策法规
  '限购', '调控', '房产税', '土地政策',

  // 其他
  '保障房', '绿色建筑', '装配式建筑'
];

// 黑名单关键词
export const BLACKLIST_KEYWORDS = [
  '娱乐', '八卦', '体育', '游戏', '医疗', '教育', '军事'
];

// 强相关关键词（可覆盖黑名单）
export const STRONG_KEYWORDS = [
  '建筑', '工程', '房地产', '基建'
];
```

### 1.4 权重衰减机制

```typescript
export const EVENT_POOL_CONFIG = {
  weights: {
    fixed: 0.35,    // 固定事件 35%
    news: 0.50,     // 新闻事件 50%
    creative: 0.15  // 创意事件 15%
  },
  decay: {
    maxAgeDays: 7,
    decaySchedule: [
      { days: 0, weight: 1.0 },   // 当天
      { days: 1, weight: 0.8 },   // 第 2 天
      { days: 2, weight: 0.6 },   // 第 3 天
      { days: 3, weight: 0.3 },   // 第 4 天
      { days: 4, weight: 0.1 },   // 第 5 天
      { days: 5, weight: 0.05 }   // 第 6 天
    ]
  }
};
```

### 1.5 异常处理

```typescript
class RSSFetcher {
  handleFetchError(source, error) {
    if (error.code === 'ENOTFOUND') {
      // RSS 源不存在，标记 24 小时内不再尝试
      this.markUnavailable(source.url, 24);
    } else if (error.code === 'ETIMEDOUT') {
      // 超时不标记，稍后重试
    } else if (error.code === 'ECONNRESET') {
      // 连接被重置，标记 1 小时内不再尝试
      this.markUnavailable(source.url, 1);
    }
  }

  // 备用方案
  async getFallbackNews() {
    // 1. 尝试缓存
    const cached = await this.getCachedNews();
    if (cached) return cached;

    // 2. 使用预设经典事件
    return this.getClassicEvents();
  }
}
```

### 1.6 事件抽取逻辑

```typescript
function drawEvent(playerRank) {
  // 1. 从三个池子获取候选
  const candidates = {
    fixed: getFixedEvents(playerRank),
    news: getNewsEvents(playerRank),
    creative: getCreativeEvents(playerRank)
  };

  // 2. 按权重随机选择池子
  const pool = selectPoolByWeight(candidates, EVENT_POOL_CONFIG.weights);

  // 3. 从池子按衰减权重抽取
  return weightedSelect(pool);
}
```

---

## 功能二：动态叙事系统

### 2.1 职业传记结构

```markdown
# 《{玩家名}的土木工程之路》

## 第一章：初入职场
- 开局属性评价
- 早期关键事件回顾
- 第一个转折点

## 第二章：成长之路
- 职业晋升历程
- 重要决策分析
- 风险事件回顾

## 第三章：{结局标题}
- 最终成就描述
- 关键数据总结
- 个性化评语

---
统计数据：季度数、完成项目、最高现金、结局评价
```

### 2.2 生成时机

- 触发条件：游戏结束时（胜利/失败）
- 异步生成：玩家点击"生成职业传记"按钮
- 超时控制：5 秒
- 缓存机制：已生成的传记存入数据库，再次请求直接返回

### 2.3 输入数据

```typescript
interface BiographyInput {
  playerName: string;
  finalRank: string;
  endReason: string;
  quartersPlayed: number;
  finalStats: PlayerStats;
  gameStats: GameStats;
  keyDecisions: Decision[];
  specialAchievements: string[];
}
```

---

## 数据库设计

### 动态事件表

```sql
CREATE TABLE IF NOT EXISTS dynamic_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT UNIQUE NOT NULL,
  source_type TEXT NOT NULL,             -- 'news' | 'creative'
  source_url TEXT,
  news_title TEXT,
  news_date DATE,

  -- 事件内容（JSON）
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  options TEXT NOT NULL,

  -- 游戏属性
  min_rank TEXT NOT NULL,
  max_rank TEXT NOT NULL,
  base_weight REAL DEFAULT 1.0,

  -- 元数据
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME,
  usage_count INTEGER DEFAULT 0,
  is_validated BOOLEAN DEFAULT 0,
  quality_score REAL DEFAULT 0.5
);
```

### 传记缓存表

```sql
CREATE TABLE IF NOT EXISTS career_biographies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id TEXT UNIQUE NOT NULL,
  player_name TEXT NOT NULL,
  content TEXT NOT NULL,
  game_data TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  shared_count INTEGER DEFAULT 0
);
```

### 事件使用日志表

```sql
CREATE TABLE IF NOT EXISTS event_usage_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  player_name TEXT,
  player_rank TEXT,
  choice_index INTEGER,
  played_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API 设计

### 后端新增端点

```typescript
// GET /api/events/health
// 查看今日事件生成状态

// GET /api/events/news
// 获取今日新闻源列表（前端展示）

// POST /api/events/biography/:gameId
// 生成职业传记

// POST /api/events/biography/:gameId/share
// 分享传记（增加计数）
```

### 前端 API

```typescript
// frontend/src/api/eventsApi.ts

export async function getEventsHealth() {
  // 获取事件系统状态
}

export async function getTodayNews() {
  // 获取今日新闻列表
}

export async function generateBiography(gameId: string) {
  // 生成职业传记
}

export async function shareBiography(gameId: string) {
  // 分享传记
}
```

---

## 后台任务调度

使用 `node-cron` 实现定时任务：

```javascript
// 每日凌晨 3:00：新闻抓取 + 事件生成
cron.schedule('0 3 * * *', dailyNewsGeneration);

// 每日凌晨 4:00：清理过期事件（超过 7 天）
cron.schedule('0 4 * * *', cleanupExpiredEvents);

// 每 2 小时：检查事件数量，不足则补充
cron.schedule('0 */2 * * *', supplementEvents);
```

---

## Prompt 模板管理

### 目录结构

```
backend/prompts/
├── README.md
├── event-generation/
│   ├── news-based-event.md
│   ├── creative-event.md
│   └── examples/
├── narrative/
│   ├── career-biography.md
│   └── templates/
└── config/
    ├── models.md
    └── quality-check.md
```

### 新闻事件生成 Prompt

```
角色：你是《还我一个土木梦》游戏的事件设计师
任务：基于新闻生成游戏事件

输入：
- 新闻标题：{{news_title}}
- 新闻摘要：{{news_summary}}
- 目标职级：{{target_rank}}

要求：
1. 事件必须与土木工程相关
2. 数值影响控制在 ±10% 以内
3. 提供 2-3 个选项，每个选项有明确后果
4. 标题简短（10字内），描述生动（50字内）

输出格式（JSON）：
{
  "title": "事件标题",
  "description": "事件描述",
  "options": [
    {"text": "选项1", "effects": {"cash": -5, "health": 0, ...}},
    {"text": "选项2", "effects": {"cash": 3, "reputation": 5, ...}}
  ]
}
```

---

## 前端集成

### 游戏结束页增强

```typescript
// 新增：生成职业传记按钮
<button onClick={generateBiography} disabled={isGenerating}>
  {isGenerating ? 'AI 正在书写你的故事...' : '📖 生成职业传记'}
</button>

// 传记展示区域
{showBiography && biography && (
  <div className="biography-container">
    <ReactMarkdown>{biography}</ReactMarkdown>
    <button onClick={() => shareBiography(runId)}>📤 分享我的故事</button>
    <button onClick={() => copyToClipboard(biography)}>📋 复制文本</button>
  </div>
)}
```

---

## 实现计划

### Phase 1: 基础架构
- [ ] 创建配置文件 `rss-sources.ts`
- [ ] 创建数据库表
- [ ] 实现 RSS 抓取器
- [ ] 实现关键词过滤

### Phase 2: LLM 集成
- [ ] 创建 Prompt 模板文件
- [ ] 实现 LLM 调用服务
- [ ] 实现批量事件生成
- [ ] 实现权重衰减逻辑

### Phase 3: 后台任务
- [ ] 集成 node-cron
- [ ] 实现定时任务
- [ ] 实现异常处理和备用方案
- [ ] 添加任务日志

### Phase 4: API 开发
- [ ] 实现 `/api/events/health`
- [ ] 实现 `/api/events/news`
- [ ] 实现 `/api/events/biography/:gameId`
- [ ] 实现分享功能

### Phase 5: 前端集成
- [ ] 创建 `eventsApi.ts`
- [ ] 修改 Result 页面
- [ ] 添加传记展示组件
- [ ] 添加加载状态

### Phase 6: 测试优化
- [ ] 单元测试
- [ ] 集成测试
- [ ] 性能优化
- [ ] Prompt 调优

---

## 风险与应对

| 风险 | 应对措施 |
|------|---------|
| RSS 源不稳定 | 多源备份 + 缓存机制 + 经典事件兜底 |
| LLM 响应慢 | 后台预生成，玩家零延迟 |
| 数值影响过大 | 严格限制 ±10%，人工验证首批事件 |
| 成本过高 | 控制每日调用量，使用缓存 |
| 事件质量差 | 玩家评分机制，低分事件逐步淘汰 |

---

## 成功指标

- 每日成功生成 20-30 个新事件
- 新闻事件占事件池 40-50%
- 玩家传记生成成功率 > 95%
- 传记分享率 > 20%

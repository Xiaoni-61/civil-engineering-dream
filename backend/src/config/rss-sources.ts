/**
 * RSS 数据源和关键词过滤配置
 *
 * 用于抓取建筑、工程、房地产相关新闻，并生成游戏事件
 */

export interface RSSSource {
  url: string;
  name: string;
  weight: number;
  category: 'professional' | 'general' | 'financial' | 'tech';
}

/**
 * RSS 数据源配置
 * 权重说明：专业类 1.5（高优先级），综合类 1.0，财经类 1.2，科技类 0.8
 */
export const RSS_SOURCES: readonly RSSSource[] = [
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
] as const;

/**
 * 白名单关键词
 * 包含建筑工程、宏观经济、行业相关、政策法规、企业相关等领域
 */
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
] as const;

/**
 * 黑名单关键词
 * 排除不相关的新闻类别
 */
export const BLACKLIST_KEYWORDS = [
  '娱乐', '八卦', '体育', '游戏',
  '医疗', '教育', '军事'
] as const;

/**
 * 强相关关键词
 * 即使标题包含黑名单关键词，只要包含强相关关键词仍会被保留
 */
export const STRONG_KEYWORDS = [
  '建筑', '工程', '房地产', '基建'
] as const;

/**
 * 事件池配置
 * 控制固定事件、新闻事件、创意事件的比例和权重衰减
 */
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
} as const;

/**
 * LLM 调用配置
 * 控制批量处理、并发、超时和重试策略
 */
export const LLM_CONFIG = {
  batchSize: 10,              // 每次处理新闻数量
  concurrency: 3,             // 并发 LLM 调用数
  timeout: 30000,             // 30 秒超时
  maxRetries: 2               // 最大重试次数
} as const;

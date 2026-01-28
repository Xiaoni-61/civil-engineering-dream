/**
 * RSS 抓取器服务
 *
 * 负责从多个 RSS 源抓取新闻，进行关键词过滤、去重和清洗
 * 支持异常处理和备用方案
 */

import Parser from 'rss-parser';
import { RSS_SOURCES, FILTER_KEYWORDS, BLACKLIST_KEYWORDS, STRONG_KEYWORDS, type RSSSource } from '../config/rss-sources.js';

/**
 * 新闻条目接口
 */
export interface NewsItem {
  title: string;
  description: string; // 新闻内容摘要（与设计文档保持一致）
  pubDate?: Date;
  url: string;
  sourceName: string;
  sourceCategory: string;
  sourceWeight: number;
}

/**
 * RSS 抓取器配置
 */
const RSS_FETCHER_CONFIG = {
  timeout: 10000, // 10 秒超时
  userAgent: 'Mozilla/5.0 (compatible; CivilEngineeringDream/1.0; +https://github.com)',
  maxItemsPerSource: 20, // 每个源最多抓取 20 条
  cacheExpiryMs: 3600000, // 缓存 1 小时
} as const;

/**
 * 不可用源记录
 */
interface UnavailableSource {
  url: string;
  markedAt: Date;
  retryAfter: Date;
}

/**
 * RSS 抓取器类
 */
export class RSSFetcher {
  private parser: Parser;
  private unavailableSources: Map<string, UnavailableSource>;
  private cachedNews: Map<string, { items: NewsItem[]; cachedAt: Date }>;

  constructor() {
    this.parser = new Parser({
      timeout: RSS_FETCHER_CONFIG.timeout,
      headers: {
        'User-Agent': RSS_FETCHER_CONFIG.userAgent,
      },
    });
    this.unavailableSources = new Map();
    this.cachedNews = new Map();
  }

  /**
   * 抓取所有 RSS 源
   */
  async fetchAll(): Promise<NewsItem[]> {
    console.log(`📡 开始抓取 ${RSS_SOURCES.length} 个 RSS 源...`);

    // 过滤掉当前不可用的源
    const availableSources = RSS_SOURCES.filter((source) =>
      this.isSourceAvailable(source.url)
    );

    if (availableSources.length < RSS_SOURCES.length) {
      const unavailableCount = RSS_SOURCES.length - availableSources.length;
      console.log(`⚠️ ${unavailableCount} 个源暂时不可用，已跳过`);
    }

    // 并发抓取所有可用源
    const fetchPromises = availableSources.map((source) =>
      this.fetchSingle(source)
    );

    const results = await Promise.allSettled(fetchPromises);

    // 收集成功的结果
    const allItems: NewsItem[] = [];
    let successCount = 0;
    let failCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.length > 0) {
        allItems.push(...result.value);
        successCount++;
      } else {
        if (result.status === 'rejected') {
          this.handleFetchError(availableSources[index], result.reason);
        }
        failCount++;
      }
    });

    console.log(`✅ 成功抓取 ${successCount} 个源，失败 ${failCount} 个源，共 ${allItems.length} 条新闻`);

    // 如果没有抓取到任何新闻，使用备用方案
    if (allItems.length === 0) {
      console.warn('⚠️ 未能抓取到任何新闻，使用备用方案');
      return this.getFallbackNews();
    }

    // 去重
    const dedupedItems = this.dedupe(allItems);
    console.log(`🔍 去重后剩余 ${dedupedItems.length} 条新闻`);

    // 更新缓存
    this.updateCache(dedupedItems);

    return dedupedItems;
  }

  /**
   * 抓取单个 RSS 源
   */
  private async fetchSingle(source: RSSSource): Promise<NewsItem[]> {
    try {
      console.log(`📡 抓取 ${source.name}...`);
      const feed = await this.parser.parseURL(source.url);

      if (!feed.items || feed.items.length === 0) {
        console.log(`⚠️ ${source.name} 没有可用的内容`);
        return [];
      }

      // 限制每个源最多抓取的条数
      const items = feed.items.slice(0, RSS_FETCHER_CONFIG.maxItemsPerSource);

      // 转换为 NewsItem 格式并过滤
      const newsItems: NewsItem[] = [];
      for (const item of items) {
        if (!item.title || !item.link) continue;

        const newsItem: NewsItem = {
          title: item.title,
          description: item.contentSnippet || item.content || '',
          pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
          url: item.link,
          sourceName: source.name,
          sourceCategory: source.category,
          sourceWeight: source.weight,
        };

        // 关键词过滤
        if (this.filterByKeywords(newsItem)) {
          newsItems.push(newsItem);
        }
      }

      console.log(`✅ ${source.name}：抓取 ${items.length} 条，过滤后 ${newsItems.length} 条`);
      return newsItems;
    } catch (error: any) {
      console.error(`❌ ${source.name} 抓取失败:`, error.message);
      throw error;
    }
  }

  /**
   * 关键词过滤
   * - 必须包含白名单关键词
   * - 不能包含黑名单关键词（除非有强相关关键词）
   */
  private filterByKeywords(item: NewsItem): boolean {
    const text = `${item.title} ${item.description}`.toLowerCase();

    // 检查是否包含强相关关键词
    const hasStrongKeyword = STRONG_KEYWORDS.some((keyword) =>
      text.includes(keyword.toLowerCase())
    );

    // 检查是否包含黑名单关键词
    const hasBlacklistKeyword = BLACKLIST_KEYWORDS.some((keyword) =>
      text.includes(keyword.toLowerCase())
    );

    // 如果有黑名单关键词但没有强相关关键词，则过滤掉
    if (hasBlacklistKeyword && !hasStrongKeyword) {
      return false;
    }

    // 检查是否包含白名单关键词
    const hasWhitelistKeyword = FILTER_KEYWORDS.some((keyword) =>
      text.includes(keyword.toLowerCase())
    );

    return hasWhitelistKeyword;
  }

  /**
   * 去重（基于 URL 或标题）
   */
  private dedupe(items: NewsItem[]): NewsItem[] {
    const seen = new Set<string>();
    const deduped: NewsItem[] = [];

    for (const item of items) {
      // 使用 URL 或标题作为去重依据
      const key = item.url || item.title;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(item);
      }
    }

    return deduped;
  }

  /**
   * 处理抓取错误
   */
  private handleFetchError(source: RSSSource, error: any): void {
    console.error(`❌ ${source.name} 错误:`, error.message);

    if (error.code === 'ENOTFOUND') {
      // RSS 源不存在，标记 24 小时内不再尝试
      this.markUnavailable(source.url, 24);
      console.log(`🚫 ${source.name} 不存在，24 小时内不再尝试`);
    } else if (error.code === 'ETIMEDOUT') {
      // 超时不标记，稍后重试
      console.log(`⏱️ ${source.name} 超时，下次重试`);
    } else if (error.code === 'ECONNRESET') {
      // 连接被重置，标记 1 小时内不再尝试
      this.markUnavailable(source.url, 1);
      console.log(`🔄 ${source.name} 连接被重置，1 小时内不再尝试`);
    } else {
      // 其他错误，标记 4 小时内不再尝试
      this.markUnavailable(source.url, 4);
      console.log(`⚠️ ${source.name} 未知错误，4 小时内不再尝试`);
    }
  }

  /**
   * 标记源为不可用
   */
  private markUnavailable(url: string, hours: number): void {
    const markedAt = new Date();
    const retryAfter = new Date(markedAt.getTime() + hours * 60 * 60 * 1000);

    this.unavailableSources.set(url, {
      url,
      markedAt,
      retryAfter,
    });
  }

  /**
   * 检查源是否可用
   */
  private isSourceAvailable(url: string): boolean {
    const record = this.unavailableSources.get(url);
    if (!record) return true;

    const now = new Date();
    if (now > record.retryAfter) {
      // 超过重试时间，移除标记
      this.unavailableSources.delete(url);
      return true;
    }

    return false;
  }

  /**
   * 更新缓存
   */
  private updateCache(items: NewsItem[]): void {
    const cacheKey = 'all';
    this.cachedNews.set(cacheKey, {
      items,
      cachedAt: new Date(),
    });
  }

  /**
   * 获取缓存的新闻
   */
  private getCachedNews(): NewsItem[] | null {
    const cacheKey = 'all';
    const cached = this.cachedNews.get(cacheKey);

    if (!cached) return null;

    const now = new Date();
    const age = now.getTime() - cached.cachedAt.getTime();

    if (age > RSS_FETCHER_CONFIG.cacheExpiryMs) {
      // 缓存过期
      this.cachedNews.delete(cacheKey);
      return null;
    }

    return cached.items;
  }

  /**
   * 获取备用新闻（预设的经典事件）
   */
  private getClassicEvents(): NewsItem[] {
    return [
      {
        title: '建筑行业迎来政策利好',
        description: '国家加大基础设施投资力度，建筑行业迎来新一轮发展机遇。',
        url: 'fallback://1',
        sourceName: '系统预设',
        sourceCategory: 'professional',
        sourceWeight: 1.0,
      },
      {
        title: '建材价格波动明显',
        description: '受原材料供应影响，水泥、钢筋等建材价格出现较大波动。',
        url: 'fallback://2',
        sourceName: '系统预设',
        sourceCategory: 'financial',
        sourceWeight: 1.0,
      },
      {
        title: '绿色建筑成为新趋势',
        description: '环保政策推动下，绿色建筑、装配式建筑成为行业发展新方向。',
        url: 'fallback://3',
        sourceName: '系统预设',
        sourceCategory: 'professional',
        sourceWeight: 1.0,
      },
      {
        title: '央行降准释放流动性',
        description: '央行宣布降准，释放长期资金，有利于降低企业融资成本。',
        url: 'fallback://4',
        sourceName: '系统预设',
        sourceCategory: 'financial',
        sourceWeight: 1.0,
      },
      {
        title: '房地产调控政策调整',
        description: '多地出台房地产调控新政，市场观望情绪浓厚。',
        url: 'fallback://5',
        sourceName: '系统预设',
        sourceCategory: 'financial',
        sourceWeight: 1.0,
      },
    ];
  }

  /**
   * 获取备用新闻
   * 1. 尝试缓存
   * 2. 使用预设经典事件
   */
  private getFallbackNews(): NewsItem[] {
    // 尝试缓存
    const cached = this.getCachedNews();
    if (cached && cached.length > 0) {
      console.log(`📦 使用缓存的 ${cached.length} 条新闻`);
      return cached;
    }

    // 使用预设经典事件
    console.log('🔄 使用预设的经典事件');
    return this.getClassicEvents();
  }

  /**
   * 清理过期的不可用源标记
   */
  cleanupUnavailableSources(): void {
    const now = new Date();
    const urls: string[] = [];

    for (const [url, record] of this.unavailableSources.entries()) {
      if (now > record.retryAfter) {
        urls.push(url);
      }
    }

    urls.forEach((url) => this.unavailableSources.delete(url));

    if (urls.length > 0) {
      console.log(`🧹 清理了 ${urls.length} 个过期的不可用源标记`);
    }
  }

  /**
   * 清理过期的缓存
   */
  cleanupCache(): void {
    const now = new Date();
    const keys: string[] = [];

    for (const [key, cached] of this.cachedNews.entries()) {
      const age = now.getTime() - cached.cachedAt.getTime();
      if (age > RSS_FETCHER_CONFIG.cacheExpiryMs) {
        keys.push(key);
      }
    }

    keys.forEach((key) => this.cachedNews.delete(key));

    if (keys.length > 0) {
      console.log(`🧹 清理了 ${keys.length} 个过期缓存`);
    }
  }

  /**
   * 获取抓取器状态
   */
  getStatus(): {
    totalSources: number;
    availableSources: number;
    unavailableSources: number;
    cachedNewsCount: number;
  } {
    const availableSources = RSS_SOURCES.filter((source) =>
      this.isSourceAvailable(source.url)
    ).length;

    const cached = this.cachedNews.get('all');
    const cachedNewsCount = cached?.items.length || 0;

    return {
      totalSources: RSS_SOURCES.length,
      availableSources,
      unavailableSources: this.unavailableSources.size,
      cachedNewsCount,
    };
  }
}

/**
 * 单例实例
 */
let rssFetcherInstance: RSSFetcher | null = null;

/**
 * 获取 RSS 抓取器实例
 */
export function getRSSFetcher(): RSSFetcher {
  if (!rssFetcherInstance) {
    rssFetcherInstance = new RSSFetcher();
  }
  return rssFetcherInstance;
}

/**
 * 抓取所有新闻（便捷函数）
 */
export async function fetchAllNews(): Promise<NewsItem[]> {
  const fetcher = getRSSFetcher();
  return fetcher.fetchAll();
}

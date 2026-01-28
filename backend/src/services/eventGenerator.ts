/**
 * LLM 事件生成服务
 *
 * 负责：
 * 1. 读取 Prompt 模板并替换变量
 * 2. 调用 LLM API 生成事件
 * 3. 解析和验证 JSON 响应
 * 4. 计算质量分数
 * 5. 保存到数据库
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { callLLM } from './llmService.js';
import type { NewsItem } from './rssFetcher.js';
import { RSS_LLM_CONFIG } from '../config/rss-sources.js';
import type { Database } from '../database/init.js';
import { createLogger, PerformanceMonitor, MetricsCollector } from '../utils/logger.js';

const logger = createLogger('EventGenerator');
const perf = new PerformanceMonitor('EventGenerator');
const metrics = new MetricsCollector('EventGenerator');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROMPTS_DIR = path.join(__dirname, '../../prompts');

/**
 * 生成的事件接口
 */
export interface GeneratedEvent {
  title: string;
  description: string;
  options: Array<{
    text: string;
    effects: Record<string, number>;
  }>;
  min_rank: string;
  max_rank: string;
}

/**
 * 验证错误接口
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * 事件源信息
 */
export interface EventSourceInfo {
  sourceType: 'news' | 'creative';
  sourceUrl?: string;
  newsTitle?: string;
}

/**
 * 职级列表（用于验证）
 */
const VALID_RANKS = [
  '实习生',
  '助理工程师',
  '工程师',
  '高级工程师',
  '项目经理',
  '项目总监',
  '合伙人',
];

/**
 * 从文件系统加载 Prompt 模板
 */
export async function loadPromptTemplate(templatePath: string): Promise<string> {
  const fullPath = path.join(PROMPTS_DIR, templatePath);
  try {
    const content = await fs.promises.readFile(fullPath, 'utf-8');
    return content;
  } catch (error) {
    throw new Error(`Failed to load prompt template: ${fullPath}`);
  }
}

/**
 * 替换模板中的变量占位符
 */
export function replaceVariables(
  template: string,
  variables: Record<string, any>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    const regex = new RegExp(placeholder, 'g');
    result = result.replace(regex, String(value));
  }
  return result;
}

/**
 * 事件质量验证器
 */
export class EventValidator {
  /**
   * 验证生成的事件是否符合要求
   */
  validate(event: GeneratedEvent): ValidationError[] {
    const errors: ValidationError[] = [];

    // 验证标题
    if (!event.title || typeof event.title !== 'string') {
      errors.push({ field: 'title', message: '标题不能为空' });
    } else if (event.title.length > 10) {
      errors.push({ field: 'title', message: `标题过长 (${event.title.length}/10)` });
    }

    // 验证描述
    if (!event.description || typeof event.description !== 'string') {
      errors.push({ field: 'description', message: '描述不能为空' });
    } else if (event.description.length > 50) {
      errors.push({ field: 'description', message: `描述过长 (${event.description.length}/50)` });
    }

    // 验证选项
    if (!Array.isArray(event.options) || event.options.length < 2) {
      errors.push({ field: 'options', message: '至少需要 2 个选项' });
    } else {
      event.options.forEach((opt, idx) => {
        if (!opt.text || typeof opt.text !== 'string') {
          errors.push({ field: `options[${idx}]`, message: '选项文本不能为空' });
        } else if (opt.text.length > 15) {
          errors.push({
            field: `options[${idx}]`,
            message: `选项文本过长 (${opt.text.length}/15)`,
          });
        }

        if (!opt.effects || typeof opt.effects !== 'object') {
          errors.push({ field: `options[${idx}].effects`, message: '选项必须有 effects' });
        }
      });
    }

    // 验证职级
    if (!event.min_rank || !VALID_RANKS.includes(event.min_rank)) {
      errors.push({ field: 'min_rank', message: `无效的 min_rank: ${event.min_rank}` });
    }
    if (!event.max_rank || !VALID_RANKS.includes(event.max_rank)) {
      errors.push({ field: 'max_rank', message: `无效的 max_rank: ${event.max_rank}` });
    }

    // 验证职级范围（min_rank 应该 <= max_rank）
    if (
      event.min_rank &&
      event.max_rank &&
      VALID_RANKS.includes(event.min_rank) &&
      VALID_RANKS.includes(event.max_rank)
    ) {
      const minIndex = VALID_RANKS.indexOf(event.min_rank);
      const maxIndex = VALID_RANKS.indexOf(event.max_rank);
      if (minIndex > maxIndex) {
        errors.push({
          field: 'rank_range',
          message: 'min_rank 不能高于 max_rank',
        });
      }
    }

    return errors;
  }

  /**
   * 计算质量分数（0-1）
   *
   * 评分标准：
   * - 基础分 0.3
   * - 标题长度适中 (+0.1)
   * - 描述长度适中 (+0.1)
   * - 选项数量充足 (+0.1)
   * - 选项文本长度适中 (+0.1)
   * - 数值影响合理 (+0.15)
   * - 无验证错误 (+0.15)
   */
  calculateQualityScore(event: GeneratedEvent): number {
    let score = 0.3; // 基础分

    // 标题长度评分（4-8 字为最佳）
    const titleLen = event.title?.length || 0;
    if (titleLen >= 4 && titleLen <= 8) {
      score += 0.1;
    } else if (titleLen >= 2 && titleLen <= 10) {
      score += 0.05;
    }

    // 描述长度评分（20-45 字为最佳）
    const descLen = event.description?.length || 0;
    if (descLen >= 20 && descLen <= 45) {
      score += 0.1;
    } else if (descLen >= 10 && descLen <= 50) {
      score += 0.05;
    }

    // 选项数量评分（3 个选项最佳）
    if (event.options?.length === 3) {
      score += 0.1;
    } else if (event.options?.length === 2) {
      score += 0.05;
    }

    // 选项文本长度评分
    const avgOptLen = event.options?.reduce((sum, opt) => sum + (opt.text?.length || 0), 0) / (event.options?.length || 1);
    if (avgOptLen >= 4 && avgOptLen <= 12) {
      score += 0.1;
    }

    // 数值影响合理性评分
    let effectsValid = true;
    let totalEffect = 0;
    for (const opt of event.options || []) {
      if (!opt.effects) {
        effectsValid = false;
        break;
      }
      for (const [key, value] of Object.entries(opt.effects)) {
        if (typeof value !== 'number' || isNaN(value)) {
          effectsValid = false;
          break;
        }
        totalEffect += Math.abs(value);
      }
    }
    if (effectsValid && totalEffect > 0) {
      score += 0.15;
    }

    // 无验证错误加分
    const errors = this.validate(event);
    if (errors.length === 0) {
      score += 0.15;
    }

    return Math.min(1, Math.max(0, score));
  }
}

/**
 * 事件仓库
 */
export class EventRepository {
  constructor(private db: Database) {}

  /**
   * 保存生成的事件到数据库
   */
  async saveEvent(
    event: GeneratedEvent,
    sourceInfo: EventSourceInfo
  ): Promise<string> {
    // 生成唯一事件 ID
    const eventId = `evt_${sourceInfo.sourceType}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    // 计算质量分数
    const validator = new EventValidator();
    const qualityScore = validator.calculateQualityScore(event);
    const validationErrors = validator.validate(event);
    const isValidated = validationErrors.length === 0;

    // 记录指标
    metrics.record('quality_score', qualityScore);

    // 保存到数据库
    await this.db.run(
      `INSERT INTO dynamic_events (
        event_id, source_type, source_url, news_title,
        title, description, options, min_rank, max_rank,
        base_weight, is_validated, quality_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventId,
        sourceInfo.sourceType,
        sourceInfo.sourceUrl || null,
        sourceInfo.newsTitle || null,
        event.title,
        event.description,
        JSON.stringify(event.options),
        event.min_rank,
        event.max_rank,
        1.0, // base_weight
        isValidated ? 1 : 0,
        qualityScore,
      ]
    );

    logger.success(`保存事件: ${eventId}`, {
      qualityScore: qualityScore.toFixed(2),
      sourceType: sourceInfo.sourceType,
      validated: isValidated,
    });

    return eventId;
  }

  /**
   * 批量保存事件
   */
  async saveEvents(events: Array<{ event: GeneratedEvent; sourceInfo: EventSourceInfo }>): Promise<string[]> {
    const eventIds: string[] = [];

    for (const { event, sourceInfo } of events) {
      try {
        const eventId = await this.saveEvent(event, sourceInfo);
        eventIds.push(eventId);
      } catch (error) {
        console.error(`❌ 保存事件失败: ${event.title}`, error);
      }
    }

    return eventIds;
  }
}

/**
 * LLM 事件生成器
 */
export class EventGenerator {
  private validator: EventValidator;
  private retryCount: Map<string, number> = new Map();

  constructor(private db?: Database) {
    this.validator = new EventValidator();
  }

  /**
   * 基于新闻生成事件
   */
  async generateFromNews(news: NewsItem): Promise<GeneratedEvent | null> {
    const cacheKey = `news_${news.url}`;

    try {
      // 加载模板
      const template = await loadPromptTemplate('event-generation/news-based-event.md');

      // 选择目标职级（随机）
      const targetRank = VALID_RANKS[Math.floor(Math.random() * VALID_RANKS.length)];

      // 替换变量
      const prompt = replaceVariables(template, {
        news_title: news.title,
        news_content: news.description?.substring(0, 500) || news.title,
        target_rank: targetRank,
      });

      // 调用 LLM
      const llmResponse = await this.callLLMWithRetry(prompt, cacheKey);
      if (!llmResponse) {
        return null;
      }

      // 解析 JSON
      const event = this.parseEventJSON(llmResponse);
      if (!event) {
        return null;
      }

      // 验证质量
      const qualityScore = this.validator.calculateQualityScore(event);
      if (qualityScore < 0.3) {
        console.log(`⚠️  事件质量过低 (${qualityScore.toFixed(2)}): ${event.title}`);
        return null;
      }

      console.log(`✅ 生成新闻事件: ${event.title} (质量: ${qualityScore.toFixed(2)})`);

      return event;
    } catch (error) {
      console.error(`❌ 生成新闻事件失败: ${news.title}`, error);
      return null;
    }
  }

  /**
   * 生成创意事件
   */
  async generateCreative(targetRank?: string): Promise<GeneratedEvent | null> {
    const cacheKey = `creative_${Date.now()}`;

    try {
      // 加载模板
      const template = await loadPromptTemplate('event-generation/creative-event.md');

      // 随机选择职级和类型
      const rank = targetRank || VALID_RANKS[Math.floor(Math.random() * VALID_RANKS.length)];
      const eventTypes = ['daily', 'emergency', 'opportunity', 'challenge'];
      const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

      // 替换变量
      const prompt = replaceVariables(template, {
        target_rank: rank,
        event_type: eventType,
      });

      // 调用 LLM
      const llmResponse = await this.callLLMWithRetry(prompt, cacheKey);
      if (!llmResponse) {
        return null;
      }

      // 解析 JSON
      const event = this.parseEventJSON(llmResponse);
      if (!event) {
        return null;
      }

      // 验证质量
      const qualityScore = this.validator.calculateQualityScore(event);
      if (qualityScore < 0.3) {
        console.log(`⚠️  事件质量过低 (${qualityScore.toFixed(2)}): ${event.title}`);
        return null;
      }

      console.log(`✅ 生成创意事件: ${event.title} (质量: ${qualityScore.toFixed(2)})`);

      return event;
    } catch (error) {
      console.error(`❌ 生成创意事件失败`, error);
      return null;
    }
  }

  /**
   * 批量生成事件（并发控制）
   */
  async batchGenerate(newsItems: NewsItem[]): Promise<GeneratedEvent[]> {
    const results: GeneratedEvent[] = [];
    const batchSize = RSS_LLM_CONFIG.batchSize;
    const concurrency = RSS_LLM_CONFIG.concurrency;

    // 分批处理
    for (let i = 0; i < newsItems.length; i += batchSize) {
      const batch = newsItems.slice(i, i + batchSize);

      // 并发控制
      const chunks: NewsItem[][] = [];
      for (let j = 0; j < batch.length; j += concurrency) {
        chunks.push(batch.slice(j, j + concurrency));
      }

      for (const chunk of chunks) {
        const promises = chunk.map((news) => this.generateFromNews(news));
        const chunkResults = await Promise.all(promises);

        for (const result of chunkResults) {
          if (result) {
            results.push(result);
          }
        }
      }
    }

    console.log(`✅ 批量生成完成: ${results.length}/${newsItems.length} 个事件`);
    return results;
  }

  /**
   * 调用 LLM 并自动重试
   */
  private async callLLMWithRetry(prompt: string, cacheKey: string): Promise<string | null> {
    const maxRetries = RSS_LLM_CONFIG.maxRetries;
    const currentRetry = this.retryCount.get(cacheKey) || 0;

    if (currentRetry >= maxRetries) {
      console.log(`⚠️  已达到最大重试次数 (${maxRetries}): ${cacheKey}`);
      this.retryCount.delete(cacheKey);
      return null;
    }

    try {
      const response = await callLLM({
        messages: [
          {
            role: 'system',
            content: '你是《还我一个土木梦》游戏的事件设计师。严格按照要求输出 JSON 格式，不要包含任何其他文字。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      });

      // 清理重试计数
      this.retryCount.delete(cacheKey);

      return response.content;
    } catch (error) {
      console.error(`❌ LLM 调用失败 (尝试 ${currentRetry + 1}/${maxRetries})`, error);

      // 增加重试计数
      this.retryCount.set(cacheKey, currentRetry + 1);

      // 重试
      if (currentRetry < maxRetries - 1) {
        // 延迟重试（指数退避）
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, currentRetry) * 1000));
        return this.callLLMWithRetry(prompt, cacheKey);
      }

      return null;
    }
  }

  /**
   * 解析 LLM 返回的 JSON
   */
  private parseEventJSON(content: string): GeneratedEvent | null {
    try {
      // 尝试提取 JSON（可能包含在 markdown 代码块中）
      let jsonContent = content.trim();

      // 移除可能的 markdown 代码块标记
      const codeBlockMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1];
      }

      // 解析 JSON
      const event = JSON.parse(jsonContent) as GeneratedEvent;

      // 基本结构验证
      if (!event.title || !event.description || !Array.isArray(event.options)) {
        throw new Error('缺少必需字段');
      }

      return event;
    } catch (error) {
      console.error('❌ 解析 JSON 失败:', error);
      console.error('原始内容:', content.substring(0, 200));
      return null;
    }
  }
}

/**
 * 获取事件生成器单例
 * 注意：如需新的数据库实例，请先调用 resetEventGenerator()
 */
let generatorInstance: EventGenerator | null = null;

export function getEventGenerator(db?: Database): EventGenerator {
  if (!generatorInstance) {
    generatorInstance = new EventGenerator(db);
  }
  return generatorInstance;
}

/**
 * 重置事件生成器单例
 * 用于测试或切换数据库实例
 */
export function resetEventGenerator(): void {
  generatorInstance = null;
}

/**
 * 获取事件仓库实例
 */
export function getEventRepository(db: Database): EventRepository {
  return new EventRepository(db);
}

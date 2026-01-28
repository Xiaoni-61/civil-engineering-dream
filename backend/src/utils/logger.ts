/**
 * 日志工具类
 *
 * 提供结构化日志输出，便于追踪系统运行状况
 * 支持不同级别的日志：info、warn、error、success
 */

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  SUCCESS = 'success',
}

/**
 * 日志元数据接口
 */
export interface LogMeta {
  [key: string]: any;
}

/**
 * 日志条目接口
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta?: LogMeta;
}

/**
 * ANSI 颜色代码
 */
const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // 前景色
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // 背景色
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

/**
 * 日志配置
 */
interface LoggerConfig {
  enableColors: boolean;
  enableTimestamp: boolean;
  enableMeta: boolean;
}

/**
 * 默认配置
 */
const defaultConfig: LoggerConfig = {
  enableColors: true,
  enableTimestamp: true,
  enableMeta: true,
};

/**
 * Logger 类
 */
export class Logger {
  private context: string;
  private config: LoggerConfig;

  constructor(context: string, config: Partial<LoggerConfig> = {}) {
    this.context = context;
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * 格式化时间戳
   */
  private formatTimestamp(): string {
    const now = new Date();
    const iso = now.toISOString();
    // 只保留 HH:mm:ss 部分
    return iso.split('T')[1].slice(0, 8);
  }

  /**
   * 格式化元数据
   */
  private formatMeta(meta?: LogMeta): string {
    if (!meta || Object.keys(meta).length === 0) {
      return '';
    }

    try {
      const jsonStr = JSON.stringify(meta);
      // 如果太长，截断
      if (jsonStr.length > 200) {
        return jsonStr.slice(0, 200) + '...';
      }
      return jsonStr;
    } catch (error) {
      return '[无法序列化]';
    }
  }

  /**
   * 输出日志
   */
  private log(level: LogLevel, message: string, icon: string, color: string, meta?: LogMeta): void {
    const parts: string[] = [];

    // 时间戳
    if (this.config.enableTimestamp) {
      const timestamp = this.formatTimestamp();
      parts.push(`${Colors.dim}${timestamp}${Colors.reset}`);
    }

    // 上下文
    if (this.context) {
      parts.push(`${Colors.cyan}[${this.context}]${Colors.reset}`);
    }

    // 图标和消息
    parts.push(`${color}${icon} ${message}${Colors.reset}`);

    // 元数据
    if (this.config.enableMeta && meta) {
      const metaStr = this.formatMeta(meta);
      if (metaStr) {
        parts.push(`${Colors.dim}${metaStr}${Colors.reset}`);
      }
    }

    // 输出
    const logLine = parts.join(' ');

    // 根据级别选择输出方式
    switch (level) {
      case LogLevel.ERROR:
        console.error(logLine);
        break;
      case LogLevel.WARN:
        console.warn(logLine);
        break;
      default:
        console.log(logLine);
    }
  }

  /**
   * INFO 级别日志
   */
  info(message: string, meta?: LogMeta): void {
    this.log(LogLevel.INFO, message, 'ℹ️', Colors.blue, meta);
  }

  /**
   * WARN 级别日志
   */
  warn(message: string, meta?: LogMeta): void {
    this.log(LogLevel.WARN, message, '⚠️', Colors.yellow, meta);
  }

  /**
   * ERROR 级别日志
   */
  error(message: string, error?: Error | LogMeta): void {
    let meta: LogMeta | undefined;

    if (error instanceof Error) {
      meta = {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'), // 只保留前 3 行堆栈
      };
    } else if (error) {
      meta = error;
    }

    this.log(LogLevel.ERROR, message, '❌', Colors.red, meta);
  }

  /**
   * SUCCESS 级别日志
   */
  success(message: string, meta?: LogMeta): void {
    this.log(LogLevel.SUCCESS, message, '✅', Colors.green, meta);
  }

  /**
   * DEBUG 级别日志（仅在开发环境）
   */
  debug(message: string, meta?: LogMeta): void {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      this.log(LogLevel.INFO, message, '🔍', Colors.dim, meta);
    }
  }

  /**
   * 性能监控：开始计时
   */
  startTimer(operation: string): () => void {
    const start = Date.now();
    this.info(`开始: ${operation}`);

    return () => {
      const duration = Date.now() - start;
      this.success(`完成: ${operation}`, { duration: `${duration}ms` });
    };
  }
}

/**
 * 创建带上下文的 Logger
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * 全局默认 Logger（无上下文）
 */
export const logger = new Logger('');

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private log: Logger;

  constructor(context: string = 'Performance') {
    this.log = new Logger(context);
  }

  /**
   * 开始计时
   */
  start(label: string): void {
    this.timers.set(label, Date.now());
    this.log.debug(`计时开始: ${label}`);
  }

  /**
   * 结束计时并记录
   */
  end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      this.log.warn(`计时器未找到: ${label}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(label);

    this.log.info(`计时结束: ${label}`, { duration: `${duration}ms` });

    return duration;
  }

  /**
   * 测量异步函数执行时间
   */
  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * 测量同步函数执行时间
   */
  measureSync<T>(label: string, fn: () => T): T {
    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

/**
 * 统计数据收集器
 */
export class MetricsCollector {
  private metrics: Map<string, { count: number; total: number; min: number; max: number }> = new Map();
  private log: Logger;

  constructor(context: string = 'Metrics') {
    this.log = new Logger(context);
  }

  /**
   * 记录指标
   */
  record(name: string, value: number): void {
    const existing = this.metrics.get(name) || { count: 0, total: 0, min: Infinity, max: -Infinity };

    existing.count++;
    existing.total += value;
    existing.min = Math.min(existing.min, value);
    existing.max = Math.max(existing.max, value);

    this.metrics.set(name, existing);
  }

  /**
   * 获取指标统计
   */
  getStats(name: string): { count: number; total: number; avg: number; min: number; max: number } | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      return null;
    }

    return {
      count: metric.count,
      total: metric.total,
      avg: metric.count > 0 ? metric.total / metric.count : 0,
      min: metric.min === Infinity ? 0 : metric.min,
      max: metric.max === -Infinity ? 0 : metric.max,
    };
  }

  /**
   * 打印所有指标
   */
  printAll(): void {
    this.log.info('=== 指标统计 ===');

    for (const [name, stats] of this.metrics.entries()) {
      const avg = stats.count > 0 ? stats.total / stats.count : 0;
      console.log(`  ${name}:`);
      console.log(`    次数: ${stats.count}`);
      console.log(`    总计: ${stats.total}`);
      console.log(`    平均: ${avg.toFixed(2)}`);
      console.log(`    最小: ${stats.min}`);
      console.log(`    最大: ${stats.max}`);
    }
  }

  /**
   * 清空所有指标
   */
  clear(): void {
    this.metrics.clear();
    this.log.debug('指标已清空');
  }
}

/**
 * 默认指标收集器
 */
export const metrics = new MetricsCollector();

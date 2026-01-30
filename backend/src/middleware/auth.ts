import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// JWT 密钥（应该来自环境变量）
const JWT_SECRET = process.env.JWT_SECRET || 'civil-engineering-dream-secret-key';

/**
 * 递归排序对象的所有键
 */
function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObjectKeys(obj[key]);
        return result;
      }, {} as any);
  }
  return obj;
}

/**
 * 生成签名
 * @param data 数据对象
 * @param secret 密钥
 */
export function generateSignature(data: Record<string, any>, secret: string = JWT_SECRET): string {
  // 递归排序所有键，确保一致性
  const sortedData = sortObjectKeys(data);
  const jsonString = JSON.stringify(sortedData);
  return crypto.createHmac('sha256', secret).update(jsonString).digest('hex');
}

/**
 * 验证签名
 * @param data 数据对象
 * @param signature 签名
 * @param secret 密钥
 */
export function verifySignature(
  data: Record<string, any>,
  signature: string,
  secret: string = JWT_SECRET
): boolean {
  const expectedSignature = generateSignature(data, secret);
  return expectedSignature === signature;
}

/**
 * 验证签名中间件
 * 验证请求体中的 signature 字段
 */
export function signatureMiddleware(req: Request, res: Response, next: NextFunction) {
  // 仅对 POST 请求进行签名验证
  if (req.method !== 'POST') {
    return next();
  }

  const { signature, ...data } = req.body;

  // 不需要签名验证的路径
  const excludedPaths = [
    '/api/run/start',          // 创建游戏会话
    '/api/saves/save',         // 保存存档
    '/api/saves/list',         // 获取存档列表
    '/api/saves/load',         // 加载存档
  ];

  // 不需要签名验证的路径模式（支持动态路由）
  const excludedPatterns = [
    '/api/run/',               // 传记相关 API（/api/run/:gameId/biography）
  ];

  const isExcluded = excludedPaths.includes(req.path) ||
                     excludedPatterns.some(pattern => req.path.startsWith(pattern) && req.path.includes('/biography'));

  // 如果没有签名且不在豁免列表中，则拒绝
  if (!signature && !isExcluded) {
    return res.status(401).json({
      code: 'MISSING_SIGNATURE',
      message: '缺少签名',
    });
  }

  // 验证签名
  if (signature && !verifySignature(data, signature)) {
    // 调试信息
    const sortedData = sortObjectKeys(data);
    const expectedSig = generateSignature(data);
    console.log('❌ 签名验证失败');
    console.log('   接收签名:', signature);
    console.log('   期望签名:', expectedSig);
    console.log('   完整数据:', JSON.stringify(sortedData, null, 2));

    return res.status(401).json({
      code: 'INVALID_SIGNATURE',
      message: '签名验证失败',
    });
  }

  next();
}

/**
 * 限流中间件（简单的基于 IP 的限流）
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 分钟
const RATE_LIMIT_MAX = 100; // 最多 100 个请求

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || 'unknown';
  const now = Date.now();

  const current = requestCounts.get(ip);
  if (!current || now > current.resetTime) {
    // 重置
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    current.count++;
    if (current.count > RATE_LIMIT_MAX) {
      return res.status(429).json({
        code: 'RATE_LIMIT_EXCEEDED',
        message: '请求过于频繁',
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
      });
    }
  }

  next();
}

/**
 * 错误处理中间件
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('❌ 错误：', err);

  res.status(500).json({
    code: 'INTERNAL_SERVER_ERROR',
    message: err.message || '内部服务器错误',
  });
}

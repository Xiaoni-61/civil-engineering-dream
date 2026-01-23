# Middleware - 中间件

## 目录用途

处理横切关注点，如认证、限流、日志、错误处理等。

## 应包含的中间件

### 1. auth.ts - 认证中间件

**职责**: 验证请求来源和签名

```typescript
// 验证设备 ID
function validateDeviceId(req, res, next) {
  const deviceId = req.headers['x-device-id'] || req.body.deviceId;
  if (!deviceId || !isValidDeviceId(deviceId)) {
    return res.status(401).json({ error: 'Invalid device ID' });
  }
  req.deviceId = deviceId;
  next();
}

// 验证数据签名（用于 /run/finish）
function validateSignature(req, res, next) {
  const { signature, ...data } = req.body;
  if (!antiCheatService.verifySignature(data, signature)) {
    return res.status(403).json({ error: 'Invalid signature' });
  }
  next();
}
```

---

### 2. rateLimit.ts - 限流中间件

**职责**: 防止频繁请求，保护服务稳定性

```typescript
import rateLimit from 'express-rate-limit';

// 全局限流
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 分钟
  max: 100,             // 每分钟最多 100 请求
  message: { error: 'Too many requests' }
});

// 游戏创建限流（更严格）
export const createRunLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,              // 每分钟最多创建 10 局游戏
  keyGenerator: (req) => req.deviceId
});

// 提交结果限流
export const finishRunLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,               // 每分钟最多提交 5 次
  keyGenerator: (req) => req.deviceId
});
```

---

### 3. errorHandler.ts - 错误处理中间件

**职责**: 统一错误响应格式

```typescript
class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
}

function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }

  // 未知错误
  console.error(err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误'
    }
  });
}
```

---

### 4. logger.ts - 日志中间件

**职责**: 记录请求日志

```typescript
function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
}
```

---

### 5. cors.ts - 跨域中间件

**职责**: 处理跨域请求

```typescript
import cors from 'cors';

export const corsMiddleware = cors({
  origin: [
    'https://your-game.pages.dev',
    'http://localhost:5173'  // 开发环境
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Device-Id']
});
```

## 中间件注册顺序

```typescript
// app.ts
app.use(corsMiddleware);
app.use(requestLogger);
app.use(express.json());
app.use(globalLimiter);
app.use('/api', apiRouter);
app.use(errorHandler);  // 错误处理放最后
```

## 错误码定义

| 错误码 | HTTP 状态 | 说明 |
|--------|----------|------|
| `INVALID_DEVICE_ID` | 401 | 设备 ID 无效 |
| `INVALID_SIGNATURE` | 403 | 签名校验失败 |
| `RATE_LIMITED` | 429 | 请求过于频繁 |
| `RUN_NOT_FOUND` | 404 | 游戏记录不存在 |
| `RUN_ALREADY_FINISHED` | 400 | 游戏已结束 |
| `INVALID_RESULT` | 400 | 结果数据异常 |

# Backend - 还我一个土木梦 API 服务

## 目录用途

后端 API 服务，提供游戏数据持久化、排行榜管理和反作弊校验。

## 技术栈

- **运行时**: Node.js (推荐 18+)
- **框架**: Express / Fastify / Hono（待定）
- **数据库**: SQLite（MVP）/ PostgreSQL（生产）
- **部署**: Serverless（Vercel Functions / AWS Lambda）或传统服务器

## API 端点

| 端点 | 方法 | 用途 |
|------|------|------|
| `/run/start` | POST | 创建新游戏，返回 runId 和 serverSeed |
| `/run/finish` | POST | 提交游戏结算数据（含签名校验） |
| `/leaderboard` | GET | 查询排行榜（支持 type 参数） |
| `/me/rank` | GET | 查询当前玩家排名 |

## 目录结构

```
backend/
├── src/
│   ├── api/         # API 路由定义
│   ├── services/    # 业务逻辑
│   ├── models/      # 数据模型
│   ├── middleware/  # 中间件
│   └── database/    # 数据库相关
├── package.json
├── tsconfig.json
└── .env.example
```

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 运行测试
npm run test

# 构建
npm run build

# 启动生产服务
npm start
```

## 环境变量

```env
# .env.example
DATABASE_URL=sqlite://./data.db
JWT_SECRET=your-secret-key
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

## 反作弊策略

1. **Token 签名校验** - 验证客户端提交数据的完整性
2. **限流** - 防止频繁请求
3. **异常值检测** - 拦截明显不合理的数据
4. **设备 ID 绑定** - 匿名用户使用设备 ID 标识

## 部署

推荐部署方案：
- **Serverless**: Vercel Functions、AWS Lambda、腾讯云函数
- **传统服务器**: Docker 容器化部署

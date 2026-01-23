# Src - 后端源码目录

## 目录用途

后端应用的核心源代码，采用分层架构组织。

## 目录结构

| 目录 | 职责 |
|------|------|
| `api/` | API 路由定义和请求处理 |
| `services/` | 核心业务逻辑 |
| `models/` | 数据模型和 ORM 定义 |
| `middleware/` | 请求中间件（认证、限流等） |
| `database/` | 数据库配置和迁移脚本 |

## 入口文件

| 文件 | 用途 |
|------|------|
| `index.ts` / `main.ts` | 应用入口，启动服务器 |
| `app.ts` | Express/Fastify 应用配置 |
| `config.ts` | 配置管理（读取环境变量） |

## 分层架构

```
请求 → middleware → api (路由) → services (业务) → models (数据)
                                      ↓
                                  database
```

### 层级职责

1. **API 层**: 处理 HTTP 请求/响应，参数校验，调用 Service
2. **Service 层**: 核心业务逻辑，不关心 HTTP 细节
3. **Model 层**: 数据结构定义，ORM 操作
4. **Middleware 层**: 横切关注点（认证、日志、限流）

## 代码规范

- 使用 TypeScript 强类型
- 异步操作使用 async/await
- 错误处理使用统一的错误类
- 配置通过环境变量注入

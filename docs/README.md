# Docs - 项目文档

## 目录用途

存放项目相关的文档资料，包括设计文档、API 文档、部署指南等。

## 应包含的文档

| 文档 | 用途 |
|------|------|
| `api-spec.md` | API 接口规范（OpenAPI/Swagger） |
| `game-design.md` | 游戏设计文档（数值平衡、事件卡设计） |
| `deployment.md` | 部署指南（前端、后端、数据库） |
| `architecture.md` | 技术架构说明 |
| `changelog.md` | 版本更新日志 |

## 文档规范

### 1. API 文档

推荐使用 OpenAPI 3.0 规范：

```yaml
# api-spec.yaml
openapi: 3.0.0
info:
  title: 还我一个土木梦 API
  version: 1.0.0
paths:
  /run/start:
    post:
      summary: 创建新游戏
      ...
```

### 2. 游戏设计文档

包含内容：
- 数值系统设计（5 个数值的初始值、变化范围）
- 事件卡设计原则
- 平衡性测试数据
- 职级评定规则

### 3. 部署文档

包含内容：
- 环境要求
- 部署步骤
- 环境变量配置
- 常见问题解答

## 与根目录文档的关系

| 文件 | 位置 | 用途 |
|------|------|------|
| `CLAUDE.md` | 根目录 | Claude Code 开发指南 |
| `WORKLOG.md` | 根目录 | 开发日志 |
| `还我一个土木梦prd.md` | 根目录 | 产品需求文档 |
| 技术文档 | `docs/` | 详细技术文档 |

## 文档维护原则

1. 保持文档与代码同步更新
2. 使用 Markdown 格式
3. 重要变更记录在 changelog 中
4. API 变更需要同步更新文档

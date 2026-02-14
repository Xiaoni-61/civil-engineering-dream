# ============================================================
# 还我一个土木梦 - 后端 Docker 镜像
# ============================================================
# 构建命令: docker build -t civil-engineering-backend ./backend
# 运行命令: docker run -p 3001:3001 -v ./data:/app/data civil-engineering-backend
# ============================================================

FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖（包括 devDependencies 用于构建）
RUN npm ci

# 复制源代码
COPY . .

# 构建 TypeScript
RUN npm run build

# ============================================================
# 生产镜像
# ============================================================
FROM node:20-alpine

WORKDIR /app

# 安装 dumb-init 用于优雅处理信号
RUN apk add --no-cache dumb-init

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 复制构建产物和依赖
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# 复制 prompts 目录（LLM 提示词模板）
COPY --from=builder --chown=nodejs:nodejs /app/prompts ./prompts

# 创建数据目录
RUN mkdir -p /app/data && chown -R nodejs:nodejs /app/data

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# 环境变量默认值
ENV NODE_ENV=production
ENV PORT=3001
ENV HOST=0.0.0.0

# 启动命令
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]

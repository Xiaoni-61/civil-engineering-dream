# ============================================================
# 还我一个土木梦 - 前端 Docker 镜像
# ============================================================
# 构建命令: docker build -t civil-engineering-frontend -f frontend/Dockerfile .
# 运行命令: docker run -p 80:80 civil-engineering-frontend
# ============================================================

# ============================================================
# 构建阶段
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY frontend/package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY frontend/ ./

# 复制 shared 目录
COPY shared /shared

# 构建参数：后端 API 地址
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# 构建生产版本
RUN npm run build

# ============================================================
# 生产镜像 - Nginx
# ============================================================
FROM nginx:alpine

# 复制 nginx 配置
COPY frontend/nginx.conf /etc/nginx/nginx.conf

# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]

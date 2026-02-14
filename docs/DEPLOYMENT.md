# 部署文档

本文档提供多种部署方案，从最简单的 Docker 一键部署到生产级的云服务器部署。

---

## 目录

- [最简部署流程（云服务器）](#最简部署流程云服务器)
- [快速开始](#快速开始)
- [方案一：Docker 部署（推荐）](#方案一docker-部署推荐)
- [方案二：阿里云/腾讯云部署](#方案二阿里云腾讯云部署)
- [方案三：PaaS 平台部署](#方案三paas-平台部署)
- [环境变量说明](#环境变量说明)
- [常见问题](#常见问题)

---

## 最简部署流程（云服务器）

> 假设你有一台云服务器（阿里云/腾讯云），IP 地址为 `123.45.67.89`

### 1. 开放端口

在云服务商控制台的**安全组**中开放：
- **80** - 前端访问端口
- **3001** - 后端 API 端口（可选）

### 2. 安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
```

### 3. 克隆项目并启动

```bash
git clone https://github.com/xiaoni-61/civil-engineering-dream.git
cd civil-engineering-dream

# 配置环境变量
cp backend/.env.example backend/.env
nano backend/.env
# 修改 JWT_SECRET 为随机字符串（必须修改！）

# 启动
docker-compose up -d

# 检查状态
docker-compose ps
```

### 4. 访问应用

浏览器打开 `http://123.45.67.89` 即可访问游戏。

- 前端：`http://你的IP`
- 后端 API：`http://你的IP:3001`
- 健康检查：`http://你的IP:3001/health`

### 5. 使用域名（可选）

如果有域名 `example.com`：

1. 在域名服务商添加 A 记录：`example.com → 123.45.67.89`
2. 浏览器打开 `http://example.com`

---

## 快速开始

### 前置要求

- Git
- Node.js 20+（非 Docker 部署需要）
- Docker & Docker Compose（Docker 部署需要）

### 克隆仓库

```bash
git clone https://github.com/Xiaoni-61/civil-engineering-dream.git
cd civil-engineering-dream
```

---

## 方案一：Docker 部署（推荐）

### 1. 配置环境变量

```bash
# 复制环境变量模板
cp backend/.env.example backend/.env

# 编辑配置（必须修改 JWT_SECRET）
nano backend/.env
```

**重要**：修改 `JWT_SECRET` 为强随机字符串：
```bash
# 生成随机密钥
openssl rand -base64 32
```

### 2. 创建 .env 文件（docker-compose 使用）

在项目根目录创建 `.env` 文件：

```env
# 后端 API 地址（前端构建时使用）
# 如果前后端部署在同一服务器，使用服务器 IP
VITE_API_BASE_URL=http://your-server-ip:3001

# JWT 密钥（必须修改！）
JWT_SECRET=your-strong-random-secret-here

# LLM 配置（可选）
LLM_PROVIDER=doubao
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
LLM_MODEL=doubao-seed-1-6-lite-251015
```

### 3. 启动服务

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 查看服务状态
docker-compose ps
```

### 4. 访问应用

- 前端：http://your-server-ip
- 后端 API：http://your-server-ip:3001
- 健康检查：http://your-server-ip:3001/health

### 5. 常用命令

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 更新部署
git pull
docker-compose up -d --build

# 查看后端日志
docker-compose logs -f backend

# 进入后端容器
docker-compose exec backend sh

# 备份数据
docker-compose exec backend tar czf /tmp/backup.tar.gz /app/data
docker cp civil-engineering-dream-backend-1:/tmp/backup.tar.gz ./backup.tar.gz
```

### 生产环境部署

使用生产配置启动（包含资源限制）：

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 方案二：阿里云/腾讯云部署

### 架构说明

```
┌─────────────────────────────────────────────────────────────┐
│                        云服务器                               │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   Nginx (80)    │    │  Node.js (3001) │                │
│  │   前端静态文件    │───▶│    后端 API     │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                     │                           │
│           │              ┌──────┴──────┐                    │
│           │              │  SQLite DB  │                    │
│           │              │  data/game.db│                   │
│           │              └─────────────┘                    │
│           │                                                  │
│  ┌────────┴────────┐                                        │
│  │   SSL 证书       │  (可选，HTTPS)                         │
│  │   CDN 加速       │  (可选，静态资源)                       │
│  └─────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### 1. 服务器准备

**推荐配置**：
- CPU：2 核
- 内存：2 GB
- 硬盘：40 GB
- 系统：Ubuntu 22.04 / CentOS 8

### 2. 安装依赖

```bash
# Ubuntu
apt update && apt install -y nodejs npm nginx

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 PM2（进程管理）
npm install -g pm2
```

### 3. 部署后端

```bash
# 创建应用目录
mkdir -p /var/www/civil-engineering
cd /var/www/civil-engineering

# 克隆代码
git clone https://github.com/Xiaoni-61/civil-engineering-dream.git .

# 配置环境变量
cp backend/.env.example backend/.env
nano backend/.env
# 修改 JWT_SECRET！

# 安装依赖并构建
cd backend
npm install
npm run build

# 创建数据目录
mkdir -p data

# 使用 PM2 启动
pm2 start dist/index.js --name civil-backend

# 设置开机自启
pm2 startup
pm2 save
```

### 4. 部署前端

```bash
# 配置前端环境变量
cd /var/www/civil-engineering/frontend
cp .env.production.example .env.production
nano .env.production
# 设置 VITE_API_BASE_URL=http://your-domain.com/api

# 方式一：构建后由 Nginx 托管
npm install
npm run build

# 将构建产物复制到 Nginx 目录
cp -r dist/* /var/www/html/

# 方式二：直接使用 Nginx 托管（推荐）
# 见下方 Nginx 配置
```

### 5. Nginx 配置

创建 `/etc/nginx/sites-available/civil-engineering`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或 IP

    # 前端静态文件
    root /var/www/civil-engineering/frontend/dist;
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

启用配置：

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/civil-engineering /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

### 6. 配置 HTTPS（可选但推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

### 7. 防火墙配置

```bash
# Ubuntu UFW
ufw allow 80
ufw allow 443
ufw allow 22
ufw enable

# 阿里云安全组
# 在控制台开放 80、443 端口
```

### 8. 更新部署脚本

创建 `/var/www/civil-engineering/deploy.sh`：

```bash
#!/bin/bash
set -e

cd /var/www/civil-engineering

echo "📥 拉取最新代码..."
git pull

echo "🔨 构建后端..."
cd backend
npm install
npm run build

echo "🔨 构建前端..."
cd ../frontend
npm install
npm run build

echo "🔄 重启后端服务..."
pm2 restart civil-backend

echo "🔄 重载 Nginx..."
systemctl reload nginx

echo "✅ 部署完成！"
```

---

## 方案三：PaaS 平台部署

### Vercel + Railway（推荐）

#### 1. 部署后端到 Railway

1. 访问 [Railway](https://railway.app/)
2. 使用 GitHub 登录
3. New Project → Deploy from GitHub repo
4. 选择 `civil-engineering-dream`
5. Root Directory 设置为 `/backend`
6. 添加环境变量（参考环境变量说明）
7. 部署完成后获取域名，如 `https://xxx.up.railway.app`

#### 2. 部署前端到 Vercel

1. 访问 [Vercel](https://vercel.com/)
2. Import Project from GitHub
3. Root Directory 设置为 `/frontend`
4. 添加环境变量：
   - `VITE_API_BASE_URL` = Railway 后端地址
5. 部署

### Render（前后端一体化）

1. 访问 [Render](https://render.com/)
2. 创建 Web Service
3. 连接 GitHub 仓库
4. 配置：
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && node dist/index.js`
5. 添加环境变量

---

## 环境变量说明

### 后端环境变量

| 变量 | 必需 | 默认值 | 说明 |
|-----|:---:|-------|------|
| `PORT` | 否 | 3001 | 服务端口 |
| `HOST` | 否 | localhost | 服务地址 |
| `NODE_ENV` | 否 | development | 环境模式 |
| `JWT_SECRET` | **是** | - | JWT 密钥（生产必须更换）|
| `LLM_PROVIDER` | 否 | - | LLM 提供商：doubao/deepseek/openai/anthropic |
| `LLM_API_KEY` | 否 | - | LLM API Key |
| `LLM_BASE_URL` | 否 | - | API 端点 |
| `LLM_MODEL` | 否 | - | 模型名称 |
| `RATE_LIMIT_WINDOW` | 否 | 60000 | 限流窗口(ms) |
| `RATE_LIMIT_MAX` | 否 | 100 | 限流最大请求数 |

### 前端环境变量

| 变量 | 必需 | 默认值 | 说明 |
|-----|:---:|-------|------|
| `VITE_API_BASE_URL` | **生产必需** | - | 后端 API 地址 |

---

## 常见问题

### Q: 前端无法连接后端？

1. 检查 `VITE_API_BASE_URL` 是否正确
2. 检查后端是否正常运行：访问 `/health` 端点
3. 检查 CORS 配置（生产环境建议限制允许的域名）

### Q: 数据库数据丢失？

Docker 部署确保使用 volume 持久化：
```bash
# 检查 volume
docker volume ls

# 定期备份
docker-compose exec backend sqlite3 /app/data/game.db ".backup /app/data/backup.db"
```

### Q: LLM 功能不工作？

1. 确认已配置 `LLM_API_KEY`
2. 检查 API 余额
3. 查看后端日志：`docker-compose logs backend | grep LLM`

### Q: 如何查看游戏数据？

```bash
# 进入后端容器
docker-compose exec backend sh

# 查看 SQLite 数据
sqlite3 /app/data/game.db
.tables
SELECT * FROM game_saves LIMIT 5;
```

### Q: 如何更新部署？

```bash
# Docker 部署
git pull
docker-compose up -d --build

# 云服务器部署
./deploy.sh
```

---

## 技术支持

- GitHub Issues: https://github.com/Xiaoni-61/civil-engineering-dream/issues

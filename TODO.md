# 部署上线 TODO

> 简单记录，一点一点完成

---

## 🔴 高优先级

### 数据库
- [ ] 迁移存档数据到云数据库（Supabase/PlanetScale）
- [ ] 配置定期备份策略

### 前端部署
- [ ] 部署到 Vercel/Netlify
- [ ] 配置自定义域名（可选）

### 后端部署
- [ ] 部署到 Railway/Render/Fly.io
- [ ] 配置生产环境变量（NODE_ENV=production）
- [ ] 更新 API_BASE_URL 为生产地址

### HTTPS
- [ ] 配置 SSL 证书（云平台通常自动提供）

---

## 🟡 中优先级

### 监控
- [ ] 配置错误监控（Sentry）
- [ ] 添加性能监控

### 法律合规
- [ ] 添加隐私政策页面
- [ ] 添加用户协议

### 安全
- [ ] 更换 JWT_SECRET 为强密码
- [ ] 添加 IP 黑名单机制

### 缓存
- [ ] 配置 Redis（可选，用于 LLM 缓存）

---

## 🟢 低优先级

### 优化
- [ ] 配置 CDN 加速
- [ ] 添加 Google Analytics
- [ ] 添加用户反馈渠道

### CI/CD
- [ ] 配置 GitHub Actions 自动部署
- [ ] 添加自动化测试

---

## 📝 部署笔记

### 当前状态
- 前端：本地开发 http://localhost:3000
- 后端：本地开发 http://localhost:3001
- 数据库：SQLite (backend/data/game.db)

### 快速部署方案
- 前端 → Vercel（连接 GitHub 即可）
- 后端 → Railway（连接 GitHub，配置环境变量）
- 数据库 → Supabase（免费额度 500MB）

---

## ✅ 已完成

- [x] 存档系统实现
- [x] 6级职级系统重构

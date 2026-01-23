# Frontend - 还我一个土木梦 H5 应用

## 目录用途

前端 H5 手机网页应用，提供土木项目管理模拟游戏的用户界面和交互逻辑。

## 技术栈

- **框架**: React + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand / Redux Toolkit（待定）
- **样式方案**: TailwindCSS / CSS Modules
- **海报生成**: html2canvas / canvas API

## 目录结构

```
frontend/
├── public/          # 静态资源（favicon、OG 图片等）
├── src/
│   ├── components/  # UI 组件
│   ├── pages/       # 页面
│   ├── store/       # 状态管理
│   ├── utils/       # 工具函数
│   ├── assets/      # 静态资源
│   ├── data/        # 游戏数据
│   └── types/       # TypeScript 类型
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 核心功能模块

1. **事件卡牌系统** - 展示事件卡、处理玩家选择
2. **数值管理** - 5 个核心数值（Cash/Health/Rep/Progress/Quality）的展示与更新
3. **游戏流程** - 开局 → 回合循环 → 结算
4. **战绩单生成** - Canvas 生成可分享的成绩图片
5. **排行榜展示** - 展示全球排名

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产包
npm run build

# 预览生产包
npm run preview
```

## 适配要求

- **Mobile First**: 以 iPhone (375px) 为基准设计
- **响应式**: 兼容主流移动设备
- **性能目标**: 首屏加载 < 3s，交互响应 < 100ms

## 部署

推荐部署平台：
- GitHub Pages
- Cloudflare Pages
- Vercel

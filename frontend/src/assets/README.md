# Assets - 静态资源

## 目录用途

存放需要经过构建工具处理的静态资源，如图片、字体、全局样式等。与 `public/` 不同，这里的资源会被 Vite 处理（压缩、哈希命名等）。

## 目录结构建议

```
assets/
├── images/           # 图片资源
│   ├── icons/       # 图标（数值图标、按钮图标等）
│   ├── cards/       # 事件卡背景、装饰
│   ├── ui/          # UI 元素（按钮背景、进度条等）
│   └── poster/      # 海报模板素材
├── fonts/           # 字体文件
│   └── custom.woff2
└── styles/          # 全局样式
    ├── variables.css   # CSS 变量（颜色、间距等）
    ├── reset.css       # 样式重置
    └── global.css      # 全局样式
```

## 设计规范

### 配色方案（建议）

| 用途 | 颜色 | 说明 |
|------|------|------|
| 主色调 | `#FF6B35` | 土木/建筑橙 |
| 辅助色 | `#2E4057` | 深蓝灰 |
| 成功色 | `#4CAF50` | 数值增加 |
| 危险色 | `#F44336` | 数值减少/警告 |
| 背景色 | `#F5F5F5` | 浅灰背景 |

### 数值图标

为 5 个核心数值设计对应图标：
- Cash（现金流）- 💰 钱袋/金币
- Health（身心健康）- ❤️ 心形
- Rep（声望）- ⭐ 星星/奖杯
- Progress（工期）- 📅 日历/进度条
- Quality（质量）- ✅ 勾选/品质徽章

## 资源优化

- 图片格式优先使用 WebP（回退 PNG）
- 图标优先使用 SVG
- 字体使用 woff2 格式
- 大图片进行压缩处理

## 引用方式

```typescript
// Vite 中引用资源
import logo from '@/assets/images/logo.png';
import '@/assets/styles/global.css';
```

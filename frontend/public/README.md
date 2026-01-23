# Public - 公共静态资源

## 目录用途

存放不需要经过构建工具处理的静态资源，这些文件会被直接复制到构建输出目录。

## 应包含的文件

| 文件 | 用途 |
|------|------|
| `favicon.ico` | 网站图标 |
| `og-image.png` | 社交分享预览图（推荐 1200x630px） |
| `apple-touch-icon.png` | iOS 添加到主屏幕的图标 |
| `manifest.json` | PWA 配置（可选） |
| `robots.txt` | 搜索引擎爬虫配置 |

## OG Meta 标签配置

用于社交平台分享预览，需要在 `index.html` 中配置：

```html
<meta property="og:title" content="还我一个土木梦 - 土木人的模拟经营游戏" />
<meta property="og:description" content="3分钟体验土木人的职业生涯，你能坚持几个回合？" />
<meta property="og:image" content="/og-image.png" />
<meta property="og:type" content="website" />
```

## 注意事项

- OG 图片建议尺寸：1200 x 630 像素
- favicon 建议提供多尺寸版本
- 所有资源应压缩优化以提升加载速度

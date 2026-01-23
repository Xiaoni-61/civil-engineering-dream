# Src - 前端源码目录

## 目录用途

前端应用的核心源代码目录，包含所有业务逻辑、UI 组件和工具函数。

## 目录结构

| 目录 | 职责 |
|------|------|
| `components/` | 可复用的 UI 组件 |
| `pages/` | 页面级组件（路由对应） |
| `store/` | 全局状态管理 |
| `utils/` | 工具函数和辅助方法 |
| `assets/` | 需要构建处理的静态资源 |
| `data/` | 游戏数据（事件卡池、配置等） |
| `types/` | TypeScript 类型定义 |

## 入口文件

| 文件 | 用途 |
|------|------|
| `main.tsx` | 应用入口，挂载 React 根组件 |
| `App.tsx` | 根组件，配置路由和全局 Provider |
| `index.css` | 全局样式 |

## 模块依赖关系

```
pages/
  └── 依赖 → components/, store/, utils/

components/
  └── 依赖 → store/, utils/, assets/, types/

store/
  └── 依赖 → utils/, data/, types/

utils/
  └── 依赖 → types/, data/
```

## 代码规范

- 组件使用函数式组件 + Hooks
- 状态管理遵循单向数据流
- 工具函数保持纯函数设计
- 类型定义与实现分离

# 项目进度和质量显示设计

## 设计目标

分离人物属性和项目状态的概念，在 ActionsPage 顶部显示项目状态卡片。

## 背景

### 问题
- `PlayerStats.progress/quality` 存在但未在 UI 中使用
- `GameState.projectProgress/projectQuality` 是实际的项目状态
- 概念混淆：进度/质量属于项目状态，不是人物属性

### 目标
1. 从 `PlayerStats` 中移除 `progress` 和 `quality`
2. 清理所有对 `stats.progress` 和 `stats.quality` 的引用
3. 在 ActionsPage 添加项目状态卡片，显示 `projectProgress` 和 `projectQuality`

## 设计

### 属性分离

| 类别 | 属性 | 说明 |
|------|------|------|
| **人物属性 (PlayerStats)** | cash, health, reputation, workAbility, luck | 代表人物本身的状态/能力 |
| **项目状态 (GameState)** | projectProgress, projectQuality | 代表当前项目的进展 |

### ActionsPage 项目卡片设计

**位置：** 在"季度和状态信息"下方，"基础行动"上方

**UI 设计：**
```
┌─────────────────────────────────────┐
│  🏗️ 当前项目                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  进度: 65%  质量: 72               │
│  ━━━━━━━━━━━━━ 65%                │
│  ━━━━━━━━━━━━━━━ 72%               │
└─────────────────────────────────────┘
```

**样式：**
- 浅蓝色渐变背景 (`from-blue-50 to-indigo-50`)
- 双进度条：进度条（蓝色）、质量条（紫色）
- 百分比显示：0-100%
- 完成阈值提示：进度≥80% 且 质量≥70% 可完成项目

## 实施步骤

### Step 1: 更新类型定义
- [ ] 从 `shared/types/player.ts` 的 `PlayerStats` 接口移除 `progress` 和 `quality`
- [ ] 确认 `GameState` 中的 `projectProgress` 和 `projectQuality` 存在

### Step 2: 清理 store 代码
- [ ] `gameStoreNew.ts` 中移除所有 `newStats.progress` 和 `newStats.quality` 的赋值
- [ ] 只保留 `state.projectProgress` 和 `state.projectQuality` 的更新

### Step 3: 清理其他文件
- [ ] 检查 `gameStore.ts` 中的 `stats.progress` 和 `stats.quality` 引用
- [ ] 移除 `STAT_DISPLAY` 中的 `progress` 和 `quality` 配置（如果存在）

### Step 4: 创建 ProjectCard 组件
- [ ] 创建 `frontend/src/components/ProjectCard.tsx`
- [ ] 显示 `projectProgress` 和 `projectQuality`
- [ ] 双进度条设计
- [ ] 完成阈值提示

### Step 5: 集成到 ActionsPage
- [ ] 在 ActionsPage 中导入 ProjectCard
- [ ] 放置在"季度和状态信息"下方
- [ ] 传递 projectProgress 和 projectQuality props

### Step 6: 测试
- [ ] TypeScript 编译通过
- [ ] 游戏运行正常
- [ ] 项目状态正确显示
- [ ] 行动效果正确应用到项目状态

## 涉及文件

| 文件 | 修改类型 |
|------|----------|
| `shared/types/player.ts` | 修改：移除 progress, quality |
| `frontend/src/store/gameStoreNew.ts` | 修改：清理 stats.progress/quality |
| `frontend/src/store/gameStore.ts` | 修改：清理 stats.progress/quality |
| `frontend/src/data/constants.ts` | 检查：STAT_DISPLAY 配置 |
| `frontend/src/components/ProjectCard.tsx` | 新建 |
| `frontend/src/pages/ActionsPage.tsx` | 修改：添加 ProjectCard |
| `frontend/src/components/StatusBar.tsx` | 修改：移除 progress/quality 显示 |

## 注意事项

1. **数据同步**：确保 `projectProgress` 和 `projectQuality` 在所有需要更新的地方都被正确更新
2. **阈值检查**：`checkProjectCompletion` 使用的是 `projectProgress/projectQuality`，确保正确
3. **UI 反馈**：项目卡片应提供清晰的视觉反馈，让玩家了解项目进展

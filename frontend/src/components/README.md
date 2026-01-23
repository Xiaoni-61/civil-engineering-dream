# Components - UI 组件

## 目录用途

存放可复用的 UI 组件，遵循原子设计原则，从基础组件到复合组件逐层构建。

## 应包含的组件

### 游戏核心组件

| 组件 | 职责 |
|------|------|
| `EventCard.tsx` | 事件卡牌（显示事件描述、3个选项按钮） |
| `OptionButton.tsx` | 选项按钮（赶工/控成本/保质量） |
| `StatusBar.tsx` | 数值状态条（单个数值的进度条展示） |
| `StatusPanel.tsx` | 状态面板（5个数值的整体展示） |
| `RoundIndicator.tsx` | 回合指示器（当前回合/总回合） |

### 结算相关组件

| 组件 | 职责 |
|------|------|
| `ScoreCard.tsx` | 成绩卡片（职级、净资产、项目履历） |
| `RankBadge.tsx` | 排名徽章（显示全球排名） |
| `SharePoster.tsx` | 分享海报（Canvas 生成的战绩单） |

### 排行榜组件

| 组件 | 职责 |
|------|------|
| `LeaderboardTable.tsx` | 排行榜列表 |
| `LeaderboardTabs.tsx` | 排行榜切换标签（综合/利润/工期） |
| `PlayerRankRow.tsx` | 玩家排名行 |

### 通用组件

| 组件 | 职责 |
|------|------|
| `Button.tsx` | 通用按钮 |
| `Modal.tsx` | 弹窗 |
| `Loading.tsx` | 加载状态 |
| `Toast.tsx` | 轻提示 |

## 组件设计原则

1. **单一职责** - 每个组件只做一件事
2. **Props 驱动** - 通过 props 控制组件行为，避免内部状态
3. **可组合性** - 组件可以灵活组合使用
4. **响应式** - 适配不同屏幕尺寸

## 文件命名规范

- 组件文件：`PascalCase.tsx`
- 样式文件：`ComponentName.module.css` 或 `ComponentName.styles.ts`
- 测试文件：`ComponentName.test.tsx`

# 能力系统开发日志

## 2026-01-27

### Bug修复：季度结算现金计算错误

**问题描述**：
- 用户报告：当前现金5.8万，季度净变化+8000，点击"进入下一季度"后，topbar显示的现金不是6.6万，有时是5.6万
- 明显的现金计算错误，金额没有正确累加

**根因分析**（Root Cause Analysis）：
1. **数据流追踪**：
   - `finishQuarter()` 在第876-901行正确计算并更新了 `stats.cash = stats.cash + netChange`
   - `nextQuarter()` 在第944行使用 `const state = get()` 获取状态快照
   - 第959行使用 `let newCash = state.stats.cash` 读取现金

2. **核心问题**：
   - `nextQuarter()` 中的 `get()` 调用返回的是函数开始时的状态快照
   - 由于 Zustand 状态更新的批处理机制，该快照可能不包含 `finishQuarter()` 刚刚更新的现金值
   - 导致新季度使用的是旧的现金值，丢失了季度结算的现金变化

**解决方案**：
- 将 `nextQuarter()` 改为使用 `set()` 的函数形式：`set((prev) => { ... })`
- `prev` 参数会接收到最新的状态，包含 `finishQuarter()` 更新后的现金
- 将所有对 `state` 的引用改为 `prev`，确保读取最新数据

**涉及文件**：
- `frontend/src/store/gameStoreNew.ts:943-1052` - 重构 `nextQuarter()` 方法

**测试验证**：
- ✅ TypeScript 编译通过
- ✅ 前端构建成功
- 需要手动测试季度结算流程

**提交**: (待提交)

### UX改进：季度结算事件预告系统

**问题描述**：
- 用户反馈：结算页面显示"净变化+8000，现金6.6万"，但点击"进入下一季度"后，现金变成了6.5万
- 原因：季度开始事件在 `nextQuarter()` 中随机生成并立即应用，用户无法预知这些事件
- 导致用户困惑："我的钱怎么又变了？"

**改进方案（方案A）**：
在结算页面提前展示下季度开始事件预告，让用户看到完整的信息流。

**实现逻辑**：
```
finishQuarter()
  ↓
1. 计算本季度收支 → 现金6.6万
2. 生成（不应用）下季度开始事件
3. 计算下季度事件总影响
4. 存储到 settlement.nextQuarterStartEvents
  ↓
结算页面显示
  ┌─────────────────────────────────┐
  │ 本季度收支：+8000               │
  │ 当前现金：6.6万                 │
  │                                │
  │ 🔮 下季度开始事件预告            │
  │ - 突发疾病: -3000现金           │
  │ - 朋友资助: +2000现金           │
  │ 预期进入下季度后现金：6.5万     │
  └─────────────────────────────────┘
  ↓
nextQuarter()
  - 读取已生成的事件并应用
  - 现金变成6.5万 ✅ (符合预期)
```

**涉及文件**：
- `frontend/src/store/gameStoreNew.ts:903-983` - `finishQuarter()` 中生成下季度事件
- `frontend/src/store/gameStoreNew.ts:1017-1054` - `nextQuarter()` 从 settlement 读取事件
- `frontend/src/pages/QuarterlySettlementPage.tsx:23-24,293-397` - 显示下季度事件预告

**UI设计**：
- 使用琥珀色背景（amber-50 to orange-50）突出显示预告区域
- 分别展示每个事件的详情（标题、描述、效果）
- 底部汇总所有事件的总影响
- 显示预期进入下季度后的现金金额

**测试验证**：
- ✅ TypeScript 编译通过
- ✅ 前端构建成功
- 需要手动测试季度结算流程

**提交**: (待提交)

---

## 2026-01-26

### 完成任务 1-5

**Task 1: 扩展类型定义** ✅
- 扩展 PlayerStats 接口添加 workAbility 和 luck
- 添加 AbilityEffects 和 AbilityRequirement 接口
- 更新 Effects 接口支持新属性变化
- 提交: d9a8602

**Task 2: 创建人物创建类型和随机数据** ✅
- 创建 shared/types/character.ts
- 添加 CharacterCreation 接口
- 添加 20 个男名和 20 个女名的随机姓名库
- 添加属性评价文案系统
- 更新 shared/types/index.ts 导出新类型
- 提交: 606e71f

**Task 3: 更新游戏配置常量** ✅
- 添加工作能力和幸运初始值配置
- 添加属性成长配置（基础训练、高级训练、晋升加成）
- 添加训练冷却配置
- 添加4种训练类型配置
- 添加隐藏选项解锁阈值配置
- 添加关系加成配置
- 在 STAT_DISPLAY 中添加新属性显示配置
- 提交: 8c16bce

**Task 4: 扩展事件类型支持新属性和隐藏选项** ✅
- EventEffects 添加 workAbility 和 luck 字段
- DecisionOption 添加隐藏选项支持（requiredAbility, hidden, riskFactor）
- 提交: 992011b

**Task 5: 创建人物创建页面组件** ✅
- 创建 CharacterCreationPage.tsx 组件
- 支持姓名输入/随机、性别选择/随机
- 实现属性抽卡系统（工作能力+幸运=10）
- 显示属性条和评价文案
- 修改 Home.tsx 跳转到人物创建页面
- 添加路由配置
- 提交: 3e7692f

### 进行中任务

**Task 6: 扩展游戏状态管理支持新属性** (下一步)
**Task 7: 创建训练行动卡片组件**
**Task 8: 实现训练逻辑和冷却机制**
**Task 9: 实现价格预测系统**
**Task 10: 实现下季度价格生成算法**
**Task 11: 修改事件卡片支持隐藏选项**
**Task 12: 实现冒险选项的风险判定**
**Task 13: 更新事件结果卡片显示**
**Task 14: 扩展关系系统支持属性影响**
**Task 15: 测试与验证**

---

## 2026-01-27

### 修复：替换为 StockChart 组件

**问题描述：**
- `StockChart.tsx` 组件已创建但未被使用
- `MarketPage.tsx` 使用内联 SVG 图表，存在问题：
  - `viewBox` 宽度计算错误（数据点为 1 时宽度为 0）
  - 缺乏交互功能

**修改内容：**
- 在 `MarketPage.tsx` 中导入 `StockChart` 组件
- 用 `StockChart` 替换内联 SVG 图表（第 215-223 行）
- 删除不再使用的代码：`getLineColor`, `getPointColor`, `yAxisSteps`, `yTicks`, `yAxisRange`

**涉及文件：**
- `frontend/src/pages/MarketPage.tsx`

**Review 状态：** ⏳ 待验证

### 修复：季度开始事件影响 + TopBar 显示人物属性

**问题 1：季度开始事件影响未应用到人物属性**
- **根因：** `gameStoreNew.ts` 的 `nextQuarter` 函数中应用季度开始事件效果时，只处理了 `cash`, `health`, `reputation`, `progress`, `quality`，遗漏了 `workAbility` 和 `luck`
- **修复：**
  - 添加 `newWorkAbility` 和 `newLuck` 变量初始化
  - 在事件效果应用中添加对 `workAbility` 和 `luck` 的处理
  - 在 `set` 状态更新中包含这两个属性

**问题 2：TopBar 未显示完整人物属性**
- **根因：** `TopStatusBar.tsx` 只显示现金、健康、声誉，缺少工作能力和幸运
- **修复：**
  - 添加 `workAbility` 和 `luck` 状态获取
  - 添加新的人物属性显示行（工作能力 + 幸运）
  - 工作能力使用 brand 色系，幸运使用紫色色系

**涉及文件：**
- `frontend/src/store/gameStoreNew.ts`
- `frontend/src/components/TopStatusBar.tsx`

**Review 状态：** ⏳ 待验证

### 重构：分离人物属性和项目状态

**设计目标：**
- 从 `PlayerStats` 中移除 `progress` 和 `quality`（它们属于项目状态，不是人物属性）
- 在 ActionsPage 顶部显示项目状态卡片（ProjectCard 组件）

**完成的任务：**
1. ✅ 更新类型定义：移除 `PlayerStats.progress` 和 `quality`
2. ✅ 清理 `gameStoreNew.ts` 中的 `stats.progress` 和 `stats.quality` 引用
3. ✅ 清理 `gameStore.ts` 中的 `stats.progress` 和 `stats.quality` 引用
4. ✅ 更新 `constants.ts` 中的 `STAT_DISPLAY` 和 `GAME_CONFIG.initialStats`
5. ✅ 创建 `ProjectCard` 组件显示项目进度和质量
6. ✅ 集成 `ProjectCard` 到 `ActionsPage`
7. ✅ 更新 `StatusBar.tsx` 移除 progress/quality 显示
8. ✅ 更新 API 类型定义（`llmApi.ts` 和 `gameApi.ts`）
9. ✅ TypeScript 编译通过

**设计文档：** `docs/plans/2026-01-27-project-status-display-design.md`

**涉及文件：**
- `shared/types/player.ts` - 移除 progress 和 quality
- `frontend/src/store/gameStoreNew.ts` - 清理 stats 引用
- `frontend/src/store/gameStore.ts` - 清理 stats 引用
- `frontend/src/data/constants.ts` - 更新配置
- `frontend/src/components/ProjectCard.tsx` - 新建
- `frontend/src/pages/ActionsPage.tsx` - 集成项目卡片
- `frontend/src/components/StatusBar.tsx` - 移除进度/质量显示
- `frontend/src/api/llmApi.ts` - 更新类型定义
- `frontend/src/api/gameApi.ts` - 更新类型定义

**Review 状态：** ⏳ 待验证

### 优化：TopStatusBar 手机端布局优化

**问题：** TopStatusBar 增加人物属性后高度增加，各页面 pt-40（160px）padding 不够

**方案 C（混合方案）：**
1. 压缩 TopStatusBar：
   - 减少外层 padding：py-2 → py-1.5，px-4 → px-3
   - 进度条高度：h-1.5 → h-1
   - 核心数值改为 3 列 grid 布局（更紧凑）
   - 人物属性改为 2 列 grid 布局
   - 行动点单行显示
   - 字体缩小：text-xs → text-[10px]

2. 调整页面 padding：pt-40 → pt-44（176px）

**优化效果：**
- TopStatusBar 高度从 ~200px 压缩到 ~140px
- 保持所有信息完整显示
- 手机端体验更优

**涉及文件：**
- `frontend/src/components/TopStatusBar.tsx` - 压缩布局
- 所有页面文件 - pt-40 → pt-44

**Review 状态：** ⏳ 待验证

### 重构：基础行动重新设计

**背景：**
- 原有"培训学习"行动与"属性训练"功能重复
- 需要更多差异化策略选择

**新行动设计：**

1. **承接私活**（FREELANCE）
   - 图标：💼
   - 效果：现金 +15000，健康 -8，声誉 -5
   - 定位：现金导向，高风险回报

2. **偷工减料**（CUT_CORNERS）
   - 图标：⚠️
   - 效果：进度 +18，质量 -12，声誉 -3，健康 -3
   - 定位：赶工冲刺，牺牲质量和声誉追进度

**基础行动组合：**
| 行动 | 定位 | 主要收益 | 主要代价 |
|------|------|---------|---------|
| 做项目 | 平衡发展 | 进度+10，质量+5 | 现金-5000，健康-5 |
| 承接私活 | 现金导向 | 现金+15000 | 健康-8，声誉-5 |
| 偷工减料 | 赶工冲刺 | 进度+18 | 质量-12，声誉-3，健康-3 |
| 休息 | 恢复状态 | 健康+12 | 无 |

**涉及文件：**
- `shared/types/game.ts` - 替换 TRAINING 为 FREELANCE 和 CUT_CORNERS
- `frontend/src/data/constants.ts` - 更新 ACTIONS 配置
- `frontend/src/pages/ActionsPage.tsx` - 更新基础行动过滤列表

**Review 状态：** ⏳ 待验证

### 修复：季度结算页面完整显示事件效果

**问题：**
- 季度开始事件只显示现金和健康效果，遗漏声誉、工作能力、幸运、进度、质量
- 天灾事件只显示现金惩罚，遗漏健康、声誉、进度惩罚

**修复内容：**

1. **季度开始事件显示**
   - 构建完整的效果显示字符串
   - 支持显示：cash、health、reputation、workAbility、luck、progress、quality
   - 效果之间用 " · " 分隔

2. **天灾事件显示**
   - 显示事件描述
   - 显示所有惩罚效果：cashPenalty、healthPenalty、reputationPenalty、progressPenalty

**涉及文件：**
- `frontend/src/pages/QuarterlySettlementPage.tsx`

**Review 状态：** ⏳ 待验证

### 新增：本季度属性变化汇总

**背景：**
- 用户反馈结算页面显示的事件效果和 TopBar 属性值之间的关系不清晰
- 需要让玩家明确看到本季度所有属性的变化

**新增功能：**
- 在结算页面添加"本季度属性变化汇总"section
- 汇总显示所有属性变化：
  - 季度开始事件效果（现金、健康、声誉、工作能力、幸运）
  - 季度自然恢复健康
  - 收支净变化
  - 天灾事件惩罚
  - 奖金事件奖励
- 底部提示：以上所有变化已应用到当前属性值

**涉及文件：**
- `frontend/src/pages/QuarterlySettlementPage.tsx`

**Review 状态：** ⏳ 待验证

### 修复：添加季度涨薪机制

**问题：**
- 点击"进入下一季度"后，TopBar 显示的工资数额不更新
- 原因：`actualSalary` 只在初始化和晋升时更新，缺少季度涨薪机制

**修复内容：**

1. **添加季度涨薪机制**（gameStoreNew.ts）
   - 在 `finishQuarter()` 中添加涨薪逻辑
   - 60% 概率触发涨薪（实习生和合伙人除外）
   - 涨薪幅度基于当前职级的 `raiseRange`

2. **结算页面显示涨薪信息**
   - 在"本季度属性变化汇总"中显示"季度涨薪"
   - 涨薪信息已应用到下季度工资

**涉及文件：**
- `frontend/src/store/gameStoreNew.ts` - finishQuarter 函数添加涨薪逻辑
- `frontend/src/pages/QuarterlySettlementPage.tsx` - 显示涨薪信息

**Review 状态：** ⏳ 待验证

### 修复：季度结算现金计算错误

**问题：**
- 当前现金 5.8万，季度净变化 +8000，预期 6.6万
- 点击"进入下一季度"后实际显示 5.6万（计算错误）

**根因：**
- `finishQuarter()` 中多次调用 `set()` 导致状态覆盖
- 天灾事件处理、现金更新、关系衰减分别调用 `set()`
- Zustand 状态更新异步问题导致后面的 `get()` 获取到过时状态

**修复：**
- 将所有状态更新合并到一次 `set()` 调用
- 移除中间的 `set({ relationships: newRelationships })`
- 确保 `newStats` 在计算时使用 `state.stats` 而不是 `get().stats`

**涉及文件：**
- `frontend/src/store/gameStoreNew.ts` - finishQuarter 函数重构

**Review 状态：** ⏳ 待验证

### 修复：结算页面属性变化汇总显示优化

**问题：**
- 结算页面的"属性变化汇总"让玩家困惑
- 季度开始事件和收支结算的变化混在一起，不清楚哪些已应用

**修复内容：**
1. **添加控制台调试日志** - 便于追踪现金计算流程
2. **重新组织属性变化汇总**：
   - 【本季度开始事件】(已生效) - 季度开始时已应用的事件
   - 【本季度收支结算】- 季度结算时的变化
3. **明确说明**：
   - 季度开始事件标注"已生效"
   - 收支净变化标注"(工资+生活费+项目等)"
   - 天灾的现金惩罚不再重复显示（已包含在净变化中）

**调试日志：**
- finishQuarter: 输出当前现金、各项收支、净变化、预期现金
- nextQuarter: 输出进入时现金、季度事件现金变化、应用后现金

**涉及文件：**
- `frontend/src/store/gameStoreNew.ts` - 添加调试日志
- `frontend/src/pages/QuarterlySettlementPage.tsx` - 重新组织属性变化显示

**Review 状态：** ⏳ 待验证

### 新增：工作能力和幸运功能实现

**背景：**
- 用户反馈工作能力和幸运属性虽然在类型中定义，但实际功能未实现
- 需要实现：隐藏技术选项、隐藏冒险选项、关系维护加成UI反馈

**完成的功能：**

1. **类型定义扩展**（eventTypes.ts）
   - 添加 `failureFeedback?: string` - 冒险选项失败时的反馈文本
   - 添加 `failure?: EventEffects` - 冒险选项失败时的效果

2. **风险选项处理优化**（gameStoreNew.ts）
   - 使用 `selectedOption.effects.failure` 替代 `(selectedOption.effects as any).failure`
   - 使用 `failureFeedback` 替代硬编码的 "（失败）"

3. **隐藏选项添加**（11个隐藏选项）
   - **engineerEvents.ts** (2个): 技术方案优化(工作能力≥30)、技术攻关突破(工作能力≥35)
   - **commonEvents.ts** (1个): 豪赌天气好转(幸运≥40, 30%风险)
   - **assistantEngineerEvents.ts** (3个): 深度优化方案(工作能力≥25)、豪赌隐蔽处理(幸运≥35, 35%风险)、自主技术攻关(工作能力≥25)
   - **seniorEngineerEvents.ts** (2个): 革新技术方案(工作能力≥50)、自主研发突破(工作能力≥50)
   - **managerEvents.ts** (3个): 精细化管理扭亏(工作能力≥45)、豪赌变更谈判(幸运≥45, 25%风险)、专业帮扶改进(工作能力≥45)

4. **UI 反馈：关系维护加成**（gameStoreNew.ts）
   - 添加 `hasWorkAbilityBonus` 标志跟踪工作能力加成
   - 维护关系时，如果工作能力≥60且是设计院/监理关系，显示 "(🔧工作能力+20%)"
   - 贵人相助机制同样显示工作能力加成

**功能说明：**
- **隐藏技术选项**：需要工作能力达到阈值才显示，效果更好
- **隐藏冒险选项**：需要幸运达到阈值才显示，有失败风险
  - 成功率公式：`100 - riskFactor * 100 + luck / 2`
  - 失败时应用 `effects.failure` 中的惩罚
- **关系维护加成**：工作能力≥60时，维护设计院/监理关系获得+20%加成
- **贵人相助机制**：幸运≥60时，15%概率触发（已存在，已有UI反馈）

**涉及文件：**
- `frontend/src/data/events/eventTypes.ts` - 类型扩展
- `frontend/src/data/events/engineerEvents.ts` - 添加2个隐藏选项
- `frontend/src/data/events/commonEvents.ts` - 添加1个隐藏选项
- `frontend/src/data/events/assistantEngineerEvents.ts` - 添加3个隐藏选项
- `frontend/src/data/events/seniorEngineerEvents.ts` - 添加2个隐藏选项
- `frontend/src/data/events/managerEvents.ts` - 添加3个隐藏选项
- `frontend/src/store/gameStoreNew.ts` - 风险处理优化+UI反馈

**测试验证：**
- ✅ TypeScript 编译通过
- ✅ 前端构建成功
- ⏳ 需要手动测试：
  - 隐藏选项在不同属性值下的显示/隐藏
  - 冒险选项的成功/失败判定
  - 关系维护时的加成提示

**Review 状态：** ⏳ 待验证

### 新增：添加更多隐藏选项

**用户需求：**
- 隐藏选项数量不够，希望添加更多
- 了解隐藏选项的显示机制

**隐藏选项显示机制：**
- `EventCard.tsx` 组件过滤逻辑：
  - 普通选项（`hidden: false` 或未设置）始终显示
  - 隐藏选项（`hidden: true`）需要满足 `requiredAbility` 条件才显示
  - 工作能力选项：`stats.workAbility >= requiredAbility.workAbility`
  - 幸运选项：`stats.luck >= requiredAbility.luck`
- 隐藏选项样式：紫色边框 + "✨ 特殊选项" 标识

**新增隐藏选项（+13个）：**

| 文件 | 事件 | 选项类型 | 阈值 |
|------|------|---------|------|
| internEvents.ts | 图纸疑问 | 🔧独立研究分析 | 工作能力≥20 |
| internEvents.ts | 材料验收 | 🔧专业快速检测 | 工作能力≥20 |
| internEvents.ts | 安全隐患 | 🎲豪赌不会出事 | 幸运≥25, 40%风险 |
| directorEvents.ts | 多项目协调 | 🔧精益资源统筹 | 工作能力≥55 |
| directorEvents.ts | 战略项目决策 | 🎲豪赌战略机遇 | 幸运≥55, 30%风险 |
| directorEvents.ts | 业务拓展 | 🔧创新市场开拓 | 工作能力≥55 |
| partnerEvents.ts | 公司战略决策 | 🔧战略革新 | 工作能力≥60 |
| partnerEvents.ts | 重大投资决策 | 🎲豪赌独角兽项目 | 幸运≥60, 35%风险 |
| commonEvents.ts | 设备故障 | 🔧技术诊断维修 | 工作能力≥25 |
| commonEvents.ts | 材料价格波动 | 🔧精准市场预测 | 工作能力≥30 |
| commonEvents.ts | 现场变更 | 🎲豪赌甲方放弃 | 幸运≥30, 50%风险 |

**总计：24个隐藏选项**
- 实习生：3个
- 助理工程师：3个
- 工程师：2个
- 高级工程师：2个
- 项目经理：3个
- 项目总监：3个
- 合伙人：2个
- 通用事件：6个

**风险机制说明：**
- 成功率公式：`成功阈值 = 100 - riskFactor × 100 + luck / 2`
- 例如：riskFactor=0.3, luck=50 → 阈值=100-30+25=95
- 随机 roll (0-100) > 阈值 则成功

**涉及文件：**
- `frontend/src/data/events/internEvents.ts` - +3隐藏选项
- `frontend/src/data/events/directorEvents.ts` - +3隐藏选项
- `frontend/src/data/events/partnerEvents.ts` - +2隐藏选项
- `frontend/src/data/events/commonEvents.ts` - +5隐藏选项

**测试验证：**
- ✅ TypeScript 编译通过
- ✅ 前端构建成功
- ⏳ 需要手动测试各种属性组合下的隐藏选项显示

**Review 状态：** ⏳ 待验证

### 文档：游戏策划文档创建

**背景：**
- 需要给游戏策划者创建一份详细的游戏机制文档
- 文档需包含所有游戏规则和机制，便于理解和调整

**创建文档：** `docs/GAME_DESIGN_DOCUMENT.md`

**文档结构：**

1. 游戏概述
   - 游戏定位、核心循环、游戏阶段划分

2. 核心数值系统
   - 5大玩家属性（现金、健康、声誉、工作能力、幸运）
   - 项目状态（进度、质量）
   - 数值范围、危险阈值、作用说明

3. 职级系统
   - 7级职级完整配置表
   - 晋升条件（净资产、项目数、声誉、特殊要求）
   - 季度工资范围、涨薪机制

4. 事件系统
   - 事件分类（专业型、职场型）
   - 事件池分配（每职级10个事件）
   - 决策选项类型（普通、隐藏技术、隐藏冒险）
   - 事件触发机制、季度开始/结束事件

5. 能力系统
   - 工作能力：4种获取方式、4种作用机制
   - 幸运：4种获取方式、4种作用机制
   - 详细公式和示例

6. 材料市场系统
   - 4种材料配置表
   - 价格波动机制
   - 价格事件影响
   - 交易机制、价格预测系统

7. 关系系统
   - 5种关系类型配置
   - 关系解锁条件
   - 4种维护方式
   - 属性影响（工作能力加成、贵人相助）

8. 行动系统
   - 行动点计算公式
   - 4种基础行动
   - 3种高级行动
   - 行动限制

9. 团队系统
   - 4种成员类型
   - 团队规模计算
   - 团队效果
   - 领导力获取
   - 团队问题类型

10. 季度结算系统
    - 完整结算流程
    - 收支计算
    - 生活成本、关系衰减

11. 胜利与失败条件
    - 胜利条件：晋升合伙人
    - 3种失败条件（破产、过劳、封杀）

**附录：**
- 附录 A: 24个隐藏选项完整列表（按职级分类）
- 附录 B: 公式速查表

**涉及文件：**
- `docs/GAME_DESIGN_DOCUMENT.md` - 新建

**文档特点：**
- 详细数值：所有阈值、概率、范围都有明确数值
- 公式示例：关键机制配有计算公式和示例
- 表格展示：复杂数据用表格清晰呈现
- 图标标识：每个概念都有对应的图标

**Review 状态：** ✅ 创建完成

## 2026-01-27

### Task 1: 修改 RankConfig 类型定义

**背景：**
- 关系系统重构的第一个任务
- 目标：将关系从"鸡肋"变为"与业绩同等重要的核心晋升维度"
- 需要为每个职级添加关系要求配置

**任务内容：**
- 在 `shared/types/game.ts` 的 `RankConfig` 接口中添加 `relationshipRequirements` 字段
- 字段类型：可选的数组，包含关系类型和最小值要求
- 字段定义：
  ```typescript
  relationshipRequirements?: {
    type: RelationshipType;
    minValue: number;
  }[];
  ```

**实现细节：**
- 字段为可选（`?`），确保向后兼容
- 现有的 `RANK_CONFIGS` 常量无需修改即可通过编译
- 为后续任务（Task 2: 配置各职级关系要求）奠定基础

**涉及文件：**
- `shared/types/game.ts:118-121` - 添加 relationshipRequirements 字段

**测试验证：**
- ✅ TypeScript 编译通过（前端）
- ✅ TypeScript 编译通过（后端）
- ✅ 前端构建成功
- ✅ 所有现有职级配置与新类型定义兼容

**Review 状态：** ✅ 完成并通过验证

### Task 1: 优化 RankConfig 关系要求类型定义

**背景：**
- 代码审查发现 Task 1 的实现存在 3 个代码质量问题
- 需要重构以提升类型定义的语义清晰度和可维护性

**修复内容：**

1. **提取接口类型**
   - 创建独立的 `RelationshipRequirement` 接口
   - 提升类型复用性和可维护性

2. **语义优化**
   - 重命名 `minValue` → `requiredValue`
   - 更清晰地表达"必须达到的值"而非"最小值"

3. **逻辑关系明确化**
   - 添加 `requirementType?: 'all' | 'any'` 字段
   - 明确 AND/OR 逻辑：默认 'all'（所有条件都满足），可选 'any'（满足任一即可）

**新类型结构：**
```typescript
export interface RelationshipRequirement {
  type: RelationshipType;
  requiredValue: number;
}

export interface RankConfig {
  // ...其他字段...
  relationshipRequirements?: {
    requirements: RelationshipRequirement[];
    requirementType?: 'all' | 'any';
  };
}
```

**优势对比：**

| 方面 | 旧实现 | 新实现 |
|------|-------|-------|
| 类型复用 | ❌ 内联类型 | ✅ 独立接口 |
| 语义清晰 | ⚠️ minValue（最小值） | ✅ requiredValue（必需值） |
| 逻辑表达 | ❌ 不明确 AND/OR | ✅ 明确 'all'\|'any' |
| 可扩展性 | ⚠️ 平铺数组 | ✅ 结构化对象 |

**涉及文件：**
- `shared/types/game.ts:106-129` - 重构关系要求类型定义

**测试验证：**
- ✅ TypeScript 编译通过（前端）
- ✅ TypeScript 编译通过（后端）
- ✅ 前端构建成功
- ✅ 所有现有职级配置与新类型定义兼容

**Review 状态：** ✅ 代码质量问题已修复
## 2026-01-27 (继续)

### Task 2: 为各职级添加关系要求配置

**改动点**：
- 为每个职级（从 ASSISTANT_ENGINEER 到 PARTNER）添加了 `relationshipRequirements` 配置
- 定义了各职级晋升所需的关系类型和最低值

**关系要求配置**：
- 实习生 → 助理工程师：监理 ≥ 60
- 助理工程师 → 工程师：设计院 ≥ 65
- 工程师 → 高级工程师：劳务队 ≥ 70
- 高级工程师 → 项目经理：甲方 ≥ 75 + 监理 ≥ 70
- 项目经理 → 项目总监：甲方 ≥ 80 + 政府 ≥ 70
- 项目总监 → 合伙人：所有关系 ≥ 75

**涉及文件**：
- `shared/types/game.ts:340-430` - 为 6 个职级配置添加关系要求

**Review 状态**：
- ✅ TypeScript 编译通过
- ✅ 配置符合设计文档要求
- ⏳ 待后续任务实现关系检查逻辑

**提交**: `19feb57` - feat: add relationship requirements to rank configs

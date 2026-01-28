# 能力系统开发日志

## 2026-01-26

### 完成任务 1-8

**Task 1: 扩展类型定义** ✅ - d9a8602
**Task 2: 创建人物创建类型** ✅ - 606e71f  
**Task 3: 更新游戏配置** ✅ - 8c16bce
**Task 4: 扩展事件类型** ✅ - 992011b
**Task 5: 人物创建页面** ✅ - 3e7692f
**Task 6: 扩展状态管理** ✅ - 77828dc
**Task 7: 训练卡片组件** ✅ - c416451
**Task 8: 训练逻辑实现** ✅ - 60c7f42 + a1a6b3d (fix)

### 完成任务 9-15

**Task 9: 实现价格预测系统** ✅
- 添加 `generatePricePrediction` 函数到 GameStore 接口
- 准确率计算：50 + workAbility/2 (50-100%)
- 预测区间宽度与准确率成反比
- 特殊事件概率：2 + luck/20 (2-7%)
- 涉及文件：`gameStoreNew.ts`, `MarketPage.tsx`

**Task 10: 实现价格生成算法** ✅
- 创建 `generateNextQuarterPrices` 函数
- 基础价格波动 ±15%
- 幸运特殊事件：+50% 暴涨 / -30% 暴跌
- 涉及文件：`gameStoreNew.ts`

**Task 11: 事件卡片隐藏选项** ✅
- 根据属性要求过滤显示选项
- 紫色边框 + ✨ 标识隐藏选项
- 涉及文件：`EventCard.tsx`

**Task 12: 冒险选项风险判定** ✅
- 成功阈值：100 - riskFactor*100 + luck/2
- 失败时使用 failure 效果
- 涉及文件：`gameStoreNew.ts`

**Task 13: 事件结果卡片显示** ✅
- 显示工作能力和幸运变化
- 涉及文件：`EventResultCard.tsx`

**Task 14: 关系系统扩展** ✅
- workAbility≥60 对设计/监理关系 +20% 加成
- luck≥60 贵人相助机制（15% 概率效果翻倍或免费）
- 涉及文件：`gameStoreNew.ts`

**Task 15: 测试验证** ✅
- 修复 TypeScript 编译错误
- 添加缺失的 `RELATIONSHIP_DISPLAY` 和 `MAINTENANCE_OPTIONS` 导入
- 移除未使用的 `workAbility` 参数
- 移除重复的 `MAINTENANCE_OPTIONS` 导入
- 最终构建：✓ built in 642ms

### 当前状态
- ✅ 全部 15 个任务完成
- ✅ 构建通过，无错误
- ✅ 能力系统完整实现：
  - 人物创建（属性随机化）
  - 训练系统（冷却机制 + 风险奖励）
  - 价格预测（基于工作能力）
  - 幸运事件（市场价格波动）
  - 隐藏选项（属性解锁）
  - 冒险机制（风险判定）
  - 关系加成（属性影响）

## 2026-01-27

### 关系检查系统 (Task 3)

**修改 checkPromotion 添加关系检查** ✅
- 在 `checkPromotion()` 函数中添加关系检查逻辑
- 检查目标职级的 `relationshipRequirements`
- 遍历检查每个要求的关系是否达标
- 处理 `requirementType: 'all'` 和 `'any'` 两种情况
- 提供清晰的中文失败提示：
  - 单个关系不达标："虽然你的业绩很优秀，但 XX 关系需达到 XX（当前 XX）才能晋升。"
  - 多个关系不达标："虽然你的业绩很优秀，但以下关系需要加强才能晋升：XX、XX..."
- 涉及文件：`gameStore.ts`
- Review: 待进行

### 关系维护方式数据文件 (Task 5)

**创建 relationshipActions.ts** ✅ - 5a4958c
- 定义 10 种关系维护方式（每种关系 2 种）
- 甲方关系：
  - 应酬宴请（高风险高收益）：现金 2000 + 健康 -3，收益 8-12，15% 过度应酬风险，workAbility≥50 收益×1.2
  - 项目汇报（低风险稳健）：健康 -2，收益 5-8，progress≥50 额外 +2
- 设计院关系：
  - 技术交流（能力提升型）：健康 -2，收益 6-10 + workAbility+1，workAbility≥60 时 20% 获得设计优化方案
  - 图纸会审（专业协作型）：健康 -3，收益 4-7 + quality+1，10% 提前发现问题，workAbility≥45 概率提升至 18%
- 劳务队关系：
  - 现场慰问（低成本日常）：现金 500，收益 5-8，reputation≥50 收益×1.3，10% 劳务纠纷风险
  - 解决纠纷（危机处理型）：现金 0-3000，收益 8-15，关系≤40 可用，50% 需高额费用，luck≥50 降为 30%
- 监理关系：
  - 礼品赠送（高风险高收益）：现金 1000，收益 7-10，20% 廉政检查风险，连续 3 次递减，luck≥40 降为 10%
  - 配合验收（工作型稳定）：健康 -2，收益 4-6 + quality+1，workAbility≥50 收益×1.3，15% 监理放水
- 政府关系：
  - 公关拜访（赌博型极端）：现金 3000 + 健康 -4，收益 5-9，30% 大领导（+15），cash<3000 惩罚 -10，reputation≥70 概率 45%
  - 政策学习（安全稳健型）：健康 -3，收益 4-7，workAbility≥55 额外 +2，workAbility≥70 时 10% 获得政策解读（仓储费 -50%）
- 数据结构包含：消耗、基础收益、触发条件、风险机制、加成系统、特殊效果、限制
- 涉及文件：`frontend/src/data/relationshipActions.ts`

**代码审查结果** ✅ - APPROVED
- 优点：
  - 类型定义完整且结构清晰，接口设计合理
  - 数据组织良好，按关系类型分组，注释清晰
  - 风险机制设计合理，包含概率、类型、后果和描述
  - 加成系统灵活，支持属性要求检查
  - 特殊效果设计有趣，增加了游戏策略性
  - 导出的辅助数据结构（ACTIONS_BY_RELATIONSHIP、ACTION_MAP）便于使用
  - 符合项目现有代码风格和命名规范
- TypeScript 编译通过，无错误
- ESLint 检查通过，无警告
- 代码质量优秀，可直接合并

### 关系维护 UI 重构 (Task 6)

**重构 StrategyPhase.tsx 关系维护 UI** ✅ - 8b3d564
- 移除对 `MAINTENANCE_OPTIONS` 的依赖，改用 `ACTIONS_BY_RELATIONSHIP`
- 导入并使用 `RelationshipAction` 类型
- 实现辅助函数：
  - `canUseAction`: 检查维护方式是否可用（维护次数、现金、健康、关系值等条件）
  - `hasBonus`: 检查玩家是否满足加成条件（质量、声誉、进度）
  - `getBonusDescription`: 生成加成描述文本（条件 + 效果）
- 重构维护方式 UI：
  - 每种关系显示 2 个按钮（使用 `ACTIONS_BY_RELATIONSHIP[selectedRelationship]`）
  - 按钮显示内容：
    - 名称和图标
    - 描述文本
    - 消耗：💰现金、❤️健康（根据当前资源状态显示颜色）
    - 收益：🤝关系值范围（如 +8~12）、🔧质量、⭐质量、📈进度
    - 风险提示：⚠️概率和描述（橙色背景）
    - 加成提示：🔥已激活/🔒未激活（绿色/灰色背景）
    - 特殊效果：✨概率和描述（蓝色背景）
  - 根据条件禁用按钮并显示禁用原因（红色标签）
- 使用 IIFE 在 JSX 中计算当前关系的维护方式
- 按钮使用 `text-left` 对齐以更好地展示信息
- 颜色编码：红色（消耗）、绿色（收益）、橙色（风险）、绿色（加成已激活）
- 涉及文件：`frontend/src/pages/StrategyPhase.tsx`
- 构建测试：✓ built in 722ms
- 注意事项：`handleMaintain` 函数目前使用临时逻辑（Task 7 会实现完整的维护逻辑）
- Review: 待进行

**修复 handleMaintain 函数代码质量问题** ✅ - 164b911
- 修复 Critical 问题：handleMaintain 忽略 action 参数，所有按钮执行相同操作
- 实现正确的动作处理逻辑：
  - 使用 `canUseAction` 检查动作是否可用
  - 从 `action.baseEffects.relationshipChange` 计算关系变化范围
  - 应用消耗（现金、健康）
  - 再次检查资源防止并发问题
  - 构建详细的反馈消息（显示关系变化、消耗、基础效果）
- 修复 Medium 问题：添加属性映射注释
  - 说明 workAbility 和 luck 属性尚未添加到游戏状态中
  - 当前使用 stats.quality 作为 workAbility 的替代
  - 当前使用 stats.progress 作为 luck 的替代
- 修复 Low 问题：提取魔法数字 3000 到常量 MESSAGE_DURATION
- 保持向后兼容，继续使用现有的 maintainRelationship store 函数
- Task 7 将添加完整的风险、加成和特殊效果逻辑
- 涉及文件：`frontend/src/pages/StrategyPhase.tsx`
- 构建测试：✓ built in 684ms
- Review: ✅ 代码质量改进完成

### 关系负面事件数据文件 (Task 8)

**创建 relationshipNegativeEvents.ts** ✅ - 07f511f
- 扩展类型定义：
  - `RelationshipNegativeEventTrigger`: 触发条件（关系类型 + 最大值）
  - `RelationshipNegativeEventEffects`: 事件效果（现金、健康、声誉、进度、质量、关系变化）
  - `RelationshipNegativeEvent`: 完整事件定义
- 定义 25 个负面事件（每种关系 5 个）：
  - 甲方关系（5个）：
    * 40分：刁难 → progress -2，reputation -2
    * 30分：工程款拖延 → cash -5000，甲方关系 -5
    * 20分：威胁停工 → progress -5，health -5
    * 10分：被踢出项目 → reputation -15，cash -10000
    * 0分：彻底决裂 → 游戏结束（reputation -50）
  - 监理关系（5个）：
    * 40分：挑刺 → quality -2，progress -1
    * 30分：频繁返工 → cash -3000，progress -3
    * 20分：停工整改 → progress -8，cash -8000
    * 10分：吊销执业资格 → reputation -20
    * 0分：行业封杀 → 游戏结束（reputation -50）
  - 设计院关系（5个）：
    * 40分：图纸变更慢 → progress -2
    * 30分：设计配合消极 → quality -2
    * 20分：重大设计错误 → cash -10000，quality -5
    * 10分：设计院断绝合作 → progress -20，reputation -10
    * 0分：设计全面崩溃 → 游戏结束（reputation -50，progress -30）
  - 劳务队关系（5个）：
    * 40分：工人消极怠工 → progress -2，quality -1
    * 30分：劳务罢工 → progress -5，cash -2000
    * 20分：群体事件 → reputation -10，cash -5000
    * 10分：劳务队集体离职 → 游戏结束（progress -15，cash -8000）
    * 0分：劳务全面断供 → 游戏结束（reputation -50，cash -15000）
  - 政府关系（5个）：
    * 40分：检查增多 → health -3，progress -1
    * 30分：行政处罚 → cash -5000，reputation -5
    * 20分：项目被叫停 → progress -10，cash -15000
    * 10分：被列入黑名单 → 游戏结束（reputation -30，cash -20000）
    * 0分：吊销资质 → 游戏结束（reputation -50）
- 提供 3 个工具函数：
  - `getNegativeEventsForRelationship`: 获取某关系值下可触发的所有事件
  - `getMostSevereNegativeEvent`: 获取最严重的负面事件
  - `getGameEndingNegativeEvent`: 检查是否有游戏结束事件
- 涉及文件：
  - `shared/types/game.ts`: 类型定义
  - `shared/types/index.ts`: 类型导出
  - `frontend/src/data/relationshipNegativeEvents.ts`: 事件数据
- TypeScript 编译通过，无错误
- Review: 待进行

### 关系负面事件触发 (Task 9)

**季度结算添加负面事件触发** ✅ - b2b529f
- 在 `finishQuarter()` 函数的关系衰减后添加负面事件触发逻辑
- 导入负面事件工具函数：`getMostSevereNegativeEvent`, `getGameEndingNegativeEvent`, `RelationshipNegativeEvent`
- 实现触发机制：
  1. 遍历所有已解锁的关系类型（实习生只解锁甲方和劳务队）
  2. 关系值 ≥ 50 不触发负面事件
  3. 根据关系值范围计算触发概率：
     - 40-49: 25%
     - 30-39: 40%
     - 20-29: 60%
     - 10-19: 80%
     - 0-9: 100%
  4. 优先检查游戏结束级别负面事件，如存在则立即触发
  5. 否则获取最严重的可触发负面事件
- 应用事件效果：
  - 现金（cash）：Math.max(0, 当前 + 变化)
  - 健康（health）：Math.max(0, Math.min(100, 当前 + 变化))
  - 声誉（reputation）：Math.max(0, Math.min(100, 当前 + 变化))
  - 项目进度（projectProgress）：Math.max(0, Math.min(100, 当前 + 变化))
  - 项目质量（projectQuality）：Math.max(0, Math.min(100, 当前 + 变化))
  - 关系变化（relationshipChanges）：更新相关关系值
- 记录到结算数据：
  - 添加 `negativeEvents` 字段到 `settlement`
  - 包含事件ID、标题、描述、关系类型、关系值、是否游戏结束、游戏结束原因
- 游戏结束处理：
  - 如果触发游戏结束事件，设置状态为 `GameStatus.FAILED`
  - 计算并设置最终分数
  - 设置游戏结束原因
  - 直接返回，不进入正常结算流程
- 涉及文件：`frontend/src/store/gameStore.ts`
- TypeScript 编译通过，无错误
- Review: 待进行

### 关系维护加成和风险机制 (Task 7)

**实现关系维护方式加成和风险机制** ✅ - e9ab466
- 完全重写 `handleMaintain` 函数，实现完整的维护逻辑
- 加成机制：
  - 检查玩家属性是否满足加成条件（workAbility、reputation、luck）
  - 应用倍率加成（multiplier）：如 workAbility≥50 时收益×1.2
  - 应用额外加成（extraChange）：如 reputation≥50 时额外+2
  - 风险概率降低（probabilityReduction）：如 luck≥50 时风险概率降低 20%
- 风险机制：
  - 计算最终风险概率（基础概率 - 幸运降低）
  - 掷骰子判定是否触发风险
  - 应用风险惩罚（额外现金、健康、声誉、关系损失）
  - 风险描述显示在反馈消息中
- 特殊效果：
  - 根据概率掷骰子判定是否触发
  - 应用特殊效果（质量、进度加成）
  - 特殊效果描述显示在反馈消息中
  - TODO：storageDiscount 需要在季度结算时处理
- 状态更新：
  - 直接更新 stats（现金、健康、声誉、质量、进度）
  - 更新 relationships（关系值）
  - 更新 maintenanceCount（维护次数）
  - 更新 maintainedRelationships（已维护关系集合）
- 反馈消息系统：
  - 基础收益：关系值变化
  - 消耗：现金、健康
  - 基础效果：工作能力、质量、进度
  - 加成提示：🔥 加成效果触发！收益×N / 额外+N
  - 风险提示：⚠️ 风险描述 + 惩罚
  - 特殊效果：✨ 特殊效果描述
  - 使用 | 分隔不同类型的信息
- 临时属性映射：
  - workAbility → stats.quality（作为临时替代）
  - luck → stats.progress（作为临时替代）
  - TODO：待正式属性添加后需移除此映射
- 更新 `hasBonus` 和 `getBonusDescription` 函数：
  - 保持一致的临时属性映射逻辑
  - 添加 TODO 注释说明临时映射
- 涉及文件：`frontend/src/pages/StrategyPhase.tsx`
- 构建测试：✓ built in 673ms
- Review: 待进行

### 修复 RelationsPage.tsx 维护方式 UI (Task 6 修正)

**修复 RelationsPage.tsx 使用新维护方式数据** ✅
- 发现问题：游戏有两个系统，新游戏系统（`/game-new/*`）使用 `RelationsPage.tsx`，旧游戏系统（`/strategy`）使用 `StrategyPhase.tsx`
- 之前更新了 `StrategyPhase.tsx` 但路由被禁用，实际上 `RelationsPage.tsx` 才是活跃组件
- 修复内容：
  - 移除对 `MAINTENANCE_OPTIONS` 的依赖，改用 `ACTIONS_BY_RELATIONSHIP`
  - 导入并使用 `RelationshipAction` 类型
  - 更新 UI 显示逻辑：
    - 每种关系显示 2 个维护按钮
    - 显示名称、图标、描述
    - 显示消耗（💰现金、❤️健康）
    - 显示收益（🤝关系值范围）
    - 显示风险提示（⚠️概率和描述）
    - 显示加成提示（🔥属性要求）
  - 修复 TypeScript 编译错误：
    - 移除未使用的 `display` 变量
    - 修复 `bonuses` 类型检查（使用 `Object.entries()` 和 `Object.values()` 正确访问对象属性）
- 涉及文件：`frontend/src/pages/RelationsPage.tsx`
- 构建测试：✓ built in 695ms
- 服务重启：前端（端口 3000）和后端（端口 3001）正常运行

### 系统架构说明

**游戏双系统架构**：
- **新游戏系统**（活跃）：`/game-new/*` → `MainGame.tsx` → `RelationsPage.tsx` + `gameStoreNew`
- **旧游戏系统**（禁用）：`/strategy` → `StrategyPhase.tsx` + `gameStore`（路由已注释）

### 更新游戏策划文档 (2026-01-27)

**更新 GAME_DESIGN_DOCUMENT.md** ✅ - v1.1
- 版本号更新：v1.0 → v1.1
- 添加更新日志章节，记录关系系统重大更新内容
- 实现文件列表：
  - `shared/types/game.ts` - 类型定义扩展
  - `frontend/src/data/relationshipActions.ts` - 10 种维护方式数据
  - `frontend/src/data/relationshipNegativeEvents.ts` - 25 个负面事件
  - `frontend/src/data/specialEvents.ts` - 15 个特殊剧情事件
  - `frontend/src/pages/RelationsPage.tsx` - 关系维护 UI
  - `frontend/src/store/gameStore.ts` - 晋升检查、负面事件触发、经济收益
- 涉及文件：`docs/GAME_DESIGN_DOCUMENT.md`
- Review: 待进行

## 2026-01-27 策略完善

### 工作能力和幸运系统完善 (任务 #1-3)

**任务 1: 实现工作能力对价格生成的影响** ✅
- 修改 `generateNextQuarterPrices` 函数，让工作能力真正影响价格波动
- 实现公式：`baseVolatility = 0.30 * (1 - workAbility / 200)`
  - workAbility 0 → ±15% 波动（完全随机）
  - workAbility 50 → ±10% 波动
  - workAbility 100 → ±5% 波动（高度稳定）
- 移除未使用的 `_workAbility` 参数下划线，使其真正参与计算
- 涉及文件：`frontend/src/store/gameStoreNew.ts:352-400`

**任务 2: 统一 Store，移除旧 gameStore.ts 依赖** ✅
- 迁移所有页面从 `gameStore` 到 `gameStoreNew`：
  - `Game.tsx` - 事件阶段页面（适配 quarterEvents/currentEventIndex）
  - `Result.tsx` - 游戏结束结算页面
  - `QuarterlySettlement.tsx` - 季度结算页面
  - `StrategyPhase.tsx` - 策略阶段页面（移除临时映射）
- 移除 StrategyPhase.tsx 中的临时属性映射：
  - 删除 `tempWorkAbility = stats.quality` 临时映射
  - 删除 `tempLuck = stats.progress` 临时映射
  - 直接使用 `stats.workAbility` 和 `stats.luck`
- 更新基础效果应用逻辑：
  - `workAbility` 直接加到 `newStats.workAbility`
  - `luck` 直接加到 `newStats.luck`
- 更新加成检查函数：
  - `hasBonus`: 检查 `stats.workAbility` 和 `stats.luck`
  - `getBonusDescription`: 显示 "🔧 工作能力" 和 "🍀 幸运"
- 涉及文件：
  - `frontend/src/pages/Game.tsx`
  - `frontend/src/pages/Result.tsx`
  - `frontend/src/pages/QuarterlySettlement.tsx`
  - `frontend/src/pages/StrategyPhase.tsx`

**任务 3: 完善关系维护的特殊效果** ✅
- 扩展 `GameState` 类型定义：
  - 添加 `pricePredictionBonus: number` - 价格预测准确率加成（百分比）
  - 添加 `storageFeeDiscount: number` - 仓储费折扣（百分比）
- 更新 `createInitialState` 初始化新状态为 0
- 更新 `generatePricePrediction` 函数：
  - 准确率公式：`50 + workAbility / 2 + pricePredictionBonus`
- 更新 `calculateStorageFee` 函数：
  - 应用折扣：`totalFee * (1 - storageFeeDiscount / 100)`
- 在 StrategyPhase.tsx 中实现特殊效果触发：
  - 技术交流（设计院）：workAbility ≥ 60 时 20% 获得"设计优化方案"（+50% 预测准确率）
  - 政策学习（政府）：workAbility ≥ 70 时 10% 获得"政策解读"（-50% 仓储费）
- 在 `nextQuarter` 函数中重置特殊效果：
  - 季度开始时 `pricePredictionBonus` 和 `storageFeeDiscount` 重置为 0
- 涉及文件：
  - `shared/types/game.ts` - 类型定义
  - `frontend/src/store/gameStoreNew.ts` - 状态初始化、价格预测、仓储费计算、季度重置
  - `frontend/src/pages/StrategyPhase.tsx` - 特殊效果触发和应用

### 改动总结

**涉及文件**：
1. `shared/types/game.ts` - 添加 `pricePredictionBonus` 和 `storageFeeDiscount` 状态
2. `frontend/src/store/gameStoreNew.ts` - 价格生成、价格预测、仓储费计算、季度重置
3. `frontend/src/pages/Game.tsx` - Store 迁移
4. `frontend/src/pages/Result.tsx` - Store 迁移
5. `frontend/src/pages/QuarterlySettlement.tsx` - Store 迁移
6. `frontend/src/pages/StrategyPhase.tsx` - Store 迁移、特殊效果实现

**功能完善**：
- ✅ 工作能力现在真正影响市场价格波动（使市场更稳定可预测）
- ✅ 移除所有临时属性映射，统一使用 `gameStoreNew`
- ✅ 实现关系维护特殊效果：
  - 设计优化方案：价格预测准确率 +50%
  - 政策解读：仓储费 -50%
  - 特殊效果在季度开始时失效

**TypeScript 编译**：✅ 通过，无错误

**任务 4: TopStatusBar 添加特殊效果显示** ✅
- 读取 `pricePredictionBonus` 和 `storageFeeDiscount` 状态
- 在行动点下方添加特殊效果提示区域
- 只在有加成时显示（条件渲染）
- 使用渐变背景（紫色到蓝色）+ 动画效果
- 显示内容：
  - ✨ 设计优化方案：预测准确率 +50%
  - 📖 政策解读：仓储费 -50%
- 涉及文件：`frontend/src/components/TopStatusBar.tsx`

**任务 5: 修复项目完成后状态被季度开始事件覆盖的 Bug** ✅
- 问题描述：项目完成后重置为 progress=0, quality=50，但下季度的季度开始事件会叠加效果，导致质量变成40等异常
- 解决方案：添加 `projectCompletedThisQuarter` 标志
  - 在 `GameStore` 接口中添加 `projectCompletedThisQuarter: boolean`
  - 在初始状态中初始化为 `false`
  - 在 `checkProjectCompletion` 完成项目时设置为 `true`
  - 在 `nextQuarter` 中检查该标志，如果为 `true` 则忽略季度开始事件的项目效果
  - 在 `nextQuarter` 中重置该标志为 `false`
- 逻辑流程：
  1. 本季度完成项目 → `checkProjectCompletion` 设置标志为 `true`，重置项目为 progress=0, quality=50
  2. 生成下季度开始事件（可能包含 quality=-10 等效果）
  3. 进入下季度 → `nextQuarter` 检测到标志为 `true`，忽略季度开始事件的项目效果
  4. 重置标志为 `false`，项目保持初始状态 (0, 50)
- 涉及文件：`frontend/src/store/gameStoreNew.ts`

**任务 6: 实现晋升关系检查和对齐关系要求** ✅
- 问题：原配置中实习生→助理工程师需要监理≥60，但实习生没有监理关系，不合理
- 解决方案：调整各职级的关系要求，只使用已解锁的关系
- 修改后的关系要求配置：
  - 实习生 → 助理工程师：甲方≥50 或 劳务队≥50（任一，`any`）
  - 助理工程师 → 工程师：监理≥60、甲方≥60、劳务队≥60（全部，`all`）
  - 工程师 → 高级工程师：设计院≥60
  - 高级工程师 → 项目经理：监理≥65、劳务队≥60
  - 项目经理 → 项目总监：甲方≥70、政府≥60
  - 项目总监 → 合伙人：全部≥75
- 在 gameStoreNew.ts 的 `checkPromotion` 中添加完整的关系检查逻辑：
  - 检查 relationshipRequirements 配置
  - 遍历检查每个要求的关系是否达标
  - 支持 `all` 和 `any` 两种要求类型
  - 生成清晰的中文失败提示
- 涉及文件：
  - `shared/types/game.ts` - 职级配置
  - `frontend/src/store/gameStoreNew.ts` - checkPromotion 函数

**任务 7: 添加关系预警系统** ✅
- 在关系卡片中添加预警提示
- 预警等级：
  - 关系 ≥ 80：绿色提示"关系良好，享有经济收益加成"
  - 关系 ≤ 40：红色警告"关系紧张！负面事件风险增加"
  - 关系 ≤ 30：橙色警告"危险！可能触发严重负面事件"
- 使用动画效果（animate-pulse）增强警示效果
- 涉及文件：`frontend/src/pages/RelationsPage.tsx`

**任务 8: 添加项目统计显示和优质项目通知** ✅
- 在 TopStatusBar 中添加项目统计显示：
  - 显示已完成项目总数（gameStats.completedProjects）
  - 显示优质项目数量（gameStats.qualityProjects，有则显示带⭐图标）
  - 使用绿色渐变背景和边框
- 添加优质项目完成通知系统：
  - 在 GameState 中添加 `qualityProjectJustCompleted` 状态
  - 在 checkProjectCompletion 中设置通知标志（质量≥90时触发）
  - 添加 dismissQualityProjectNotification 函数关闭通知
  - 在 Game.tsx 中添加庆祝弹窗：
    - 🏆 图标 + 动画效果
    - 显示项目完成统计
    - 说明优质项目对晋升的帮助
- 优质项目定义：质量评分 ≥ 90
- 涉及文件：
  - `shared/types/game.ts` - 类型定义
  - `frontend/src/store/gameStoreNew.ts` - 状态管理
  - `frontend/src/components/TopStatusBar.tsx` - 统计显示
  - `frontend/src/pages/Game.tsx` - 通知弹窗

### 改动总结 (任务 8)

**涉及文件**：
1. `shared/types/game.ts` - 添加 `qualityProjectJustCompleted` 状态
2. `frontend/src/store/gameStoreNew.ts` - 初始化状态、通知逻辑、dismiss 函数
3. `frontend/src/components/TopStatusBar.tsx` - 项目统计显示
4. `frontend/src/pages/Game.tsx` - 优质项目完成通知弹窗

**功能实现**：
- ✅ TopStatusBar 显示已完成项目和优质项目数量
- ✅ 完成优质项目时弹出庆祝通知
- ✅ 通知显示当前项目统计
- ✅ 说明优质项目对晋升的意义

**TypeScript 编译**：✅ 通过，无错误
**构建测试**：✓ built in 725ms

## 2026-01-28

### 游戏结束检测和结果页面完善

**问题描述**：
1. 游戏结束条件（健康=0、现金≤0、声誉≤0）触发后没有正确跳转到结果页面
2. Result 页面显示不完整（属性名称错误）
3. Result 页面应该全屏显示，不带 TopBar 和 BottomNav

**修复内容**：

1. **添加破产检测到 checkGameEnd()** ✅
   - 添加 `EndReason.BANKRUPT` 到类型定义
   - 在 `checkGameEnd()` 中添加现金 ≤ 0 检查
   - 在多个函数中添加 `checkGameEnd()` 调用：
     - `finishQuarter()`
     - `maintainRelationship()` (2处)
     - `ignoreEvent()`
     - `buyMaterial()`
     - `sellMaterial()`

2. **修复 finishQuarter() 覆盖游戏结束状态** ✅
   - 在设置 `GameStatus.SETTLEMENT` 前检查游戏是否已结束
   - 如果状态已经是 `FAILED` 或 `COMPLETED`，直接返回

3. **在 MainGame 中集中处理游戏结束导航** ✅
   - 添加 useEffect 监听 `GameStatus` 变化
   - 当游戏结束时自动导航到 `/game-new/result`
   - Result 页面直接返回，不包裹 TopBar 和 BottomNav

4. **修复 Result.tsx 显示问题** ✅
   - 修正属性名称：`currentRound` → `currentQuarter`
   - 修正属性名称：`stats.quality` → `stats.workAbility`
   - 更新显示标签："质量" → "工作能力"，图标 🏆 → 💼
   - "再玩一次"按钮导航到 `/character-creation`

5. **移除冗余的 useEffect 监听器** ✅
   - 从 ActionsPage.tsx、EventsPage.tsx、MarketPage.tsx、RelationsPage.tsx、TeamPage.tsx 移除重复的游戏结束状态监听
   - MainGame.tsx 统一处理所有游戏结束导航

6. **修复 TypeScript 类型错误** ✅
   - 修复 `generatePricePrediction` 返回值类型
   - 为 `prediction` 对象添加显式类型注解

**涉及文件**：
1. `shared/types/game.ts` - 添加 `EndReason.BANKRUPT`
2. `frontend/src/data/constants.ts` - 添加破产结束消息
3. `frontend/src/store/gameStoreNew.ts` - 游戏结束检测逻辑、类型修复
4. `frontend/src/pages/Result.tsx` - 属性名称修复、导航修复
5. `frontend/src/pages/MainGame.tsx` - 集中处理游戏结束导航、全屏 Result 页面
6. `frontend/src/pages/ActionsPage.tsx` - 移除冗余 useEffect
7. `frontend/src/pages/EventsPage.tsx` - 移除冗余 useEffect
8. `frontend/src/pages/MarketPage.tsx` - 移除冗余 useEffect
9. `frontend/src/pages/RelationsPage.tsx` - 移除冗余 useEffect
10. `frontend/src/pages/TeamPage.tsx` - 移除冗余 useEffect

**功能实现**：
- ✅ 破产条件（cash ≤ 0）正确检测
- ✅ 过劳条件（health ≤ 0）正确检测
- ✅ 封杀条件（reputation ≤ 0）正确检测
- ✅ 游戏结束立即跳转到结果页面
- ✅ Result 页面全屏显示，无导航栏
- ✅ "再玩一次"正确跳转到角色创建
- ✅ 中央化游戏结束状态管理，避免冗余代码

**TypeScript 编译**：✅ 通过，无错误
**构建测试**：✓ built in 699ms

## 2026-01-28

### 修复排行榜功能

**问题描述**：
排行榜页面完全不可用，无法加载排行榜数据

**问题原因**：
`frontend/src/api/index.ts` 中没有导出排行榜相关的 API 函数（`getLeaderboard`、`getMyRank`、`getGlobalStats`），导致 `Leaderboard.tsx` 无法从 `@/api` 导入这些函数

**修复内容**：

1. **修复 API 导出** ✅
   - 在 `frontend/src/api/index.ts` 中添加排行榜相关函数的导出
   - `export { getLeaderboard, getMyRank, getGlobalStats } from './gameApi'`

**涉及文件**：
1. `frontend/src/api/index.ts` - 添加排行榜 API 导出

**功能实现**：
- ✅ 排行榜 API 函数正确导出
- ✅ Leaderboard.tsx 可以正常导入和使用 API
- ✅ 支持三种排行榜类型：综合榜、现金榜、次数榜
- ✅ 显示玩家自己的排名信息
- ✅ 分页支持（默认显示前 50 名）

**TypeScript 编译**：✅ 通过，无错误
**构建测试**：✓ built in 736ms

**注意事项**：
- 排行榜功能依赖后端服务（端口 3001）正常运行
- 游戏开始时会调用 `/api/run/start` 创建会话
- 游戏结束时会调用 `/api/run/finish` 上传成绩到排行榜
- 需要后端数据库正确初始化（leaderboard 表）

## 2026-01-28

### 修改排行榜系统，使用角色名代替 deviceId

**问题描述**：
排行榜系统使用 deviceId（设备ID）来标识玩家，显示效果不友好。需要改为使用永久保存的角色名。

**修改内容**：

1. **前端 API 层** ✅
   - 添加 `getPlayerName()` - 从 localStorage 获取角色名
   - 添加 `savePlayerName(name)` - 保存角色名到 localStorage
   - 更新 `finishGame()` 函数 - 添加 `playerName` 参数，在上传成绩时包含角色名
   - 更新 `getMyRank()` 函数 - 使用角色名查询排名，而不是 deviceId
   - 涉及文件：`frontend/src/api/gameApi.ts`

2. **前端 Store 层** ✅
   - 修改 `uploadScore()` 函数 - 获取永久保存的角色名，在上传成绩时包含角色名
   - 涉及文件：`frontend/src/store/gameStoreNew.ts`

3. **角色创建页面** ✅
   - 导入 `savePlayerName` 函数
   - 在开始游戏时保存角色名到 localStorage（永久保存）
   - 涉及文件：`frontend/src/pages/CharacterCreationPage.tsx`

4. **排行榜页面** ✅
   - 更新 `LeaderboardEntry` 接口 - 添加 `playerName` 字段
   - 更新 `MyRankData` 接口 - 在 player 对象中添加 `playerName` 字段
   - 更新 `loadMyRank()` 函数 - 处理角色名未找到的错误
   - 更新 UI 显示 - 显示角色名而不是脱敏的 deviceId，没有角色名时显示"匿名玩家"
   - 涉及文件：`frontend/src/pages/Leaderboard.tsx`

5. **后端数据库** ✅
   - 更新 `leaderboard` 表结构 - 添加 `playerName TEXT NOT NULL DEFAULT '匿名玩家'` 字段
   - 添加 ALTER TABLE 语句 - 为已存在的表添加 playerName 字段（如果不存在）
   - 涉及文件：`backend/src/database/init.ts`

6. **后端 API - 游戏运行** ✅
   - 更新 `/api/run/finish` 接口 - 接收 `playerName` 参数
   - 更新排行榜插入逻辑 - 包含 playerName
   - 更新排行榜更新逻辑 - 每次更新时同步 playerName
   - 涉及文件：`backend/src/api/run.ts`

7. **后端 API - 排行榜** ✅
   - 更新 `/api/leaderboard` 查询 - 在所有查询中返回 `playerName` 字段
   - 更新 `/api/leaderboard/me` 接口 - 使用 `playerName` 查询玩家排名，而不是 `deviceId`
   - 更新错误提示 - 从"缺少设备ID"改为"缺少角色名"
   - 涉及文件：`backend/src/api/leaderboard.ts`

**功能实现**：
- ✅ 排行榜显示玩家角色名，而不是脱敏的 deviceId
- ✅ 角色名永久保存在 localStorage 中
- ✅ 后端数据库存储和返回角色名
- ✅ 支持匿名玩家（默认显示"匿名玩家"）
- ✅ 向后兼容 - 旧数据没有角色名时显示"匿名玩家"

**TypeScript 编译**：✅ 通过，无错误
**后端编译**：✅ 通过，无错误

**特殊改动点**：
- 前端：角色创建时保存到 localStorage，游戏结束时上传角色名
- 后端：数据库添加 playerName 字段，API 返回角色名
- 显示：排行榜列表和个人排名都显示角色名
- 错误处理：角色名未找到时不显示错误提示，静默处理

## 2026-01-28

### 修复排行榜唯一标识符问题

**问题描述**：
之前修改使用 playerName 查询玩家排名是错误的。角色名可能重复，玩家可能改名，应该使用 deviceId 作为唯一标识符。

**正确的设计**：
- **存储层**：使用 `deviceId` 作为唯一标识符（PRIMARY KEY）
- **显示层**：显示 `playerName`（友好给用户看）
- ** playerName 可以更新，但 deviceId 保持不变，保证历史数据关联**

**修复内容**：

1. **后端 API** ✅
   - 修复 `/api/leaderboard/me` 接口：使用 `deviceId` 查询而不是 `playerName`
   - 修复排名计算：使用 `deviceId` 作为次要排序条件
   - 涉及文件：`backend/src/api/leaderboard.ts`

2. **前端 API** ✅
   - 修复 `getMyRank()` 函数：传递 `deviceId` 而不是 `playerName`
   - 移除对 `getPlayerName()` 的依赖
   - 涉及文件：`frontend/src/api/gameApi.ts`

**功能实现**：
- ✅ 存储层使用 deviceId 作为唯一标识符（保证数据完整性）
- ✅ 显示层使用 playerName（友好显示）
- ✅ 玩家改名后，历史成绩仍然保持关联
- ✅ 支持多玩家使用相同角色名

**TypeScript 编译**：✅ 通过，无错误
**后端编译**：✅ 通过，无错误
**前端构建**：✓ built in 694ms

## 2026-01-28

### 单局游戏排行榜系统重构

**核心改动**：从"玩家聚合排行榜"改为"单局游戏排行榜"

**runId 设计**：
- 格式：`YYMMDDNNNNNN`（12位纯数字）
- 示例：`250128000001` - 25年1月28日第1局
- 每天支持 999,999 局游戏

**榜单类型**：
1. **职位榜**：按最终职位排序（合伙人 > 项目总监 > ...）
2. **现金榜**：按总资产排序（现金 + 存货价值）

**数据库改动**：
- `game_stats` 表添加字段：
  - `runId TEXT UNIQUE NOT NULL` - 单局游戏ID（主键）
  - `playerName TEXT NOT NULL DEFAULT '匿名玩家'` - 角色名
  - `endReason TEXT` - 游戏结束原因
  - `finalRank TEXT` - 最终职级

**后端改动**：
- `run.ts`：生成 runId，保存完整游戏信息到 game_stats
- `leaderboard.ts`：完全重写，从 game_stats 查询单局排行榜
  - 职位榜：按职位权重排序，同职位按分数排序
  - 现金榜：按 finalCash 排序（TODO：添加库存材料价值）
  - `/api/leaderboard/me`：获取玩家最佳记录的职位排名
- 移除 `leaderboard` 聚合表的依赖

**前端改动**：
- `Leaderboard.tsx`：
  - 只保留两个榜单：职位榜、现金榜
  - 移除"次数榜"
  - 更新接口定义，适配单局游戏数据
  - 显示：角色名、季度数、最终职级
- `gameApi.ts`：finishGame 添加 endReason 和 finalRank 参数
- `gameStoreNew.ts`：uploadScore 传递 endReason 和 finalRank

**显示改动**：
- 排行榜列表：每行显示一局游戏（而非一个玩家）
- "我的排名"：最佳记录在所有游戏中的排名
- 百分比：基于"所有游戏记录"而非"所有玩家"
- 统计信息：总游戏局数

**匿名玩家问题**：
- 原因：旧数据在添加 playerName 字段前创建
- 解决：新游戏会正确显示角色名
- 旧数据：保留为"匿名玩家"

**TypeScript 编译**：✅ 通过，无错误
**后端编译**：✅ 通过，无错误
**前端构建**：✅ 通过

---

## 2026-01-28

### 修复排行榜数据未保存问题

**问题诊断**：
- 用户完成游戏后，排行榜显示为空
- 数据库 `game_stats` 表没有记录
- 原因：`initializeGame()` 未调用后端 API 获取 runId
- 当 `uploadScore()` 被调用时，runId 为 null，打印"离线模式，跳过成绩上传"

**修复内容**：

1. **gameStoreNew.ts**：
   - 将 `initializeGame` 改为 async 函数
   - 调用后端 `/api/run/start` API 获取 runId
   - 重命名导入：`startGame as startGameApi` 避免命名冲突
   - 更新现有 `startGame` store 函数使用 `startGameApi`

2. **CharacterCreationPage.tsx**：
   - `startGame` 函数改为 async
   - 添加 `await initializeGame(...)`

3. **gameApi.ts**：
   - 修正 `getLeaderboard` 类型：`'rank' | 'cash'`

4. **Leaderboard.tsx**：
   - 移除未使用的 `RANK_WEIGHT` 常量
   - 修正条件判断：`activeTab === 'overall'` → `activeTab === 'rank'`

**数据流程**：
```
角色创建 → initializeGame() → /api/run/start → 获取 runId (UUID)
→ 游戏进行 → 游戏结束 → uploadScore() → /api/run/finish
→ 生成新 runId (YYMMDDNNNNNN) → 保存到 game_stats → 排行榜显示
```

**TypeScript 编译**：✅ 通过，无错误
**前端构建**：✅ 通过


# 6级职级系统实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 将现有7级职级系统简化为6级，加快个人发展期节奏

**架构:**
- 移除 Rank.ASSISTANT_ENGINEER 枚举值
- 合并助理工程师和工程师为一个"工程师"职级
- 调整各职级晋升门槛和关系要求
- 团队系统在项目经理（第4级）开放
- 更新所有相关UI和事件配置

**技术栈:** TypeScript, React, Zustand, TailwindCSS

---

## 概览

**新职级结构（6级）:**

| 职级 | 图标 | 净资产要求 | 项目数要求 | 声誉要求 | 特殊要求 | 关系要求 | 季度工资 |
|------|------|-----------|-----------|---------|---------|---------|---------|
| 实习生 | 🎓 | 0 | 0 | 0 | - | - | 9,000（固定） |
| 工程师 | 👨‍🔧 | 20万 | 1个 | 45 | - | 甲方≥50 **或** 劳务队≥50 | 20,000 - 30,000 |
| 高级工程师 | 👨‍💼 | 100万 | 6个 | 65 | 1个优质项目 | 监理≥60、设计院≥60 | 50,000 - 75,000 |
| 项目经理 | 📋 | 400万 | 12个 | 80 | 3个项目 | 甲方≥70、劳务队≥65 | 10万 - 14万 |
| 项目总监 | 🎯 | 1,200万 | 22个 | 90 | 5个优质项目 | 所有关系≥70 | 18万 - 28万 |
| 合伙人 | 👑 | 4,000万 | 35个 | 95 | 8个优质项目 | 所有关系≥80 | 30万（分红） |

**关系解锁时序:**
- 实习生：甲方、劳务队
- 工程师：+ 监理、设计院（一次性解锁两个）
- 高级工程师：+ 政府部门
- 项目经理+：全部关系

---

## Task 1: 修改 Rank 枚举和类型定义

**文件:**
- Modify: `shared/types/game.ts:97-105`

**说明:** 移除 ASSISTANT_ENGINEER 枚举值

**Step 1: 修改 Rank 枚举**

```typescript
// 原代码（7级）
export enum Rank {
  INTERN = 'intern',
  ASSISTANT_ENGINEER = 'assistant_engineer',  // 删除这行
  ENGINEER = 'engineer',
  SENIOR_ENGINEER = 'senior_engineer',
  PROJECT_MANAGER = 'project_manager',
  PROJECT_DIRECTOR = 'project_director',
  PARTNER = 'partner',
}

// 新代码（6级）
export enum Rank {
  INTERN = 'intern',
  ENGINEER = 'engineer',
  SENIOR_ENGINEER = 'senior_engineer',
  PROJECT_MANAGER = 'project_manager',
  PROJECT_DIRECTOR = 'project_director',
  PARTNER = 'partner',
}
```

**Step 2: 运行类型检查验证**

Run: `npm run build` (在 worktree frontend 目录)
Expected: PASS（类型检查通过）

**Step 3: 提交**

```bash
git add shared/types/game.ts
git commit -m "refactor: remove ASSISTANT_ENGINEER from Rank enum"
```

---

## Task 2: 更新 RANK_CONFIGS 配置

**文件:**
- Modify: `shared/types/game.ts:388-500`

**说明:** 重新配置6级职级的晋升条件

**Step 1: 替换 RANK_CONFIGS 定义**

```typescript
// 新的 RANK_CONFIGS（6级）
export const RANK_CONFIGS: Record<Rank, RankConfig> = {
  [Rank.INTERN]: {
    rank: Rank.INTERN,
    name: '实习生',
    assetsRequired: 0,
    projectsRequired: 0,
    reputationRequired: 0,
    minQuarterlySalary: 9000,
    raiseRange: [0, 0],
  },
  [Rank.ENGINEER]: {
    rank: Rank.ENGINEER,
    name: '工程师',
    assetsRequired: 200000,        // 20万
    projectsRequired: 1,           // 1个项目
    reputationRequired: 45,
    minQuarterlySalary: 20000,
    raiseRange: [5, 12],           // 5%-12% 涨薪
    relationshipRequirements: {
      requirements: [
        { type: RelationshipType.CLIENT, requiredValue: 50 },
        { type: RelationshipType.LABOR, requiredValue: 50 },
      ],
      requirementType: 'any',      // 满足任一即可
    },
  },
  [Rank.SENIOR_ENGINEER]: {
    rank: Rank.SENIOR_ENGINEER,
    name: '高级工程师',
    assetsRequired: 1000000,       // 100万
    projectsRequired: 6,           // 6个项目
    reputationRequired: 65,
    specialRequirement: '完成过1个优质项目(质量≥90)',
    minQuarterlySalary: 50000,
    raiseRange: [8, 15],
    relationshipRequirements: {
      requirements: [
        { type: RelationshipType.SUPERVISION, requiredValue: 60 },
        { type: RelationshipType.DESIGN, requiredValue: 60 },
      ],
      requirementType: 'all',
    },
  },
  [Rank.PROJECT_MANAGER]: {
    rank: Rank.PROJECT_MANAGER,
    name: '项目经理',
    assetsRequired: 4000000,       // 400万
    projectsRequired: 12,
    reputationRequired: 80,
    specialRequirement: '完成过3个项目',
    minQuarterlySalary: 100000,
    raiseRange: [10, 20],
    relationshipRequirements: {
      requirements: [
        { type: RelationshipType.CLIENT, requiredValue: 70 },
        { type: RelationshipType.LABOR, requiredValue: 65 },
      ],
      requirementType: 'all',
    },
  },
  [Rank.PROJECT_DIRECTOR]: {
    rank: Rank.PROJECT_DIRECTOR,
    name: '项目总监',
    assetsRequired: 12000000,      // 1200万
    projectsRequired: 22,
    reputationRequired: 90,
    specialRequirement: '完成过5个优质项目',
    minQuarterlySalary: 180000,
    raiseRange: [12, 25],
    relationshipRequirements: {
      requirements: [
        { type: RelationshipType.CLIENT, requiredValue: 70 },
        { type: RelationshipType.SUPERVISION, requiredValue: 70 },
        { type: RelationshipType.DESIGN, requiredValue: 70 },
        { type: RelationshipType.LABOR, requiredValue: 70 },
        { type: RelationshipType.GOVERNMENT, requiredValue: 70 },
      ],
      requirementType: 'all',      // 所有关系≥70
    },
  },
  [Rank.PARTNER]: {
    rank: Rank.PARTNER,
    name: '合伙人',
    assetsRequired: 40000000,      // 4000万
    projectsRequired: 35,
    reputationRequired: 95,
    specialRequirement: '完成过8个优质项目',
    minQuarterlySalary: 300000,
    raiseRange: [0, 0],            // 合伙人分红制
    relationshipRequirements: {
      requirements: [
        { type: RelationshipType.CLIENT, requiredValue: 80 },
        { type: RelationshipType.SUPERVISION, requiredValue: 80 },
        { type: RelationshipType.DESIGN, requiredValue: 80 },
        { type: RelationshipType.LABOR, requiredValue: 80 },
        { type: RelationshipType.GOVERNMENT, requiredValue: 80 },
      ],
      requirementType: 'all',      // 所有关系≥80
    },
  },
};
```

**Step 2: 运行类型检查**

Run: `npm run build`
Expected: PASS

**Step 3: 提交**

```bash
git add shared/types/game.ts
git commit -m "feat: update RANK_CONFIGS for 6-level system"
```

---

## Task 3: 更新 RANK_DISPLAY 常量

**文件:**
- Modify: `frontend/src/data/constants.ts:102-138`

**说明:** 移除助理工程师的显示配置

**Step 1: 删除 ASSISTANT_ENGINEER 条目**

```typescript
// 原代码
export const RANK_DISPLAY = {
  [Rank.INTERN]: { label: '实习生', icon: '🎓', color: '#94A3B8' },
  [Rank.ASSISTANT_ENGINEER]: { label: '助理工程师', icon: '👷', color: '#60A5FA' },  // 删除
  [Rank.ENGINEER]: { label: '工程师', icon: '👨‍🔧', color: '#3B82F6' },
  [Rank.SENIOR_ENGINEER]: { label: '高级工程师', icon: '👨‍💼', color: '#2563EB' },
  [Rank.PROJECT_MANAGER]: { label: '项目经理', icon: '📋', color: '#7C3AED' },
  [Rank.PROJECT_DIRECTOR]: { label: '项目总监', icon: '🎯', color: '#DC2626' },
  [Rank.PARTNER]: { label: '合伙人', icon: '👑', color: '#F59E0B' },
};

// 新代码
export const RANK_DISPLAY = {
  [Rank.INTERN]: { label: '实习生', icon: '🎓', color: '#94A3B8' },
  [Rank.ENGINEER]: { label: '工程师', icon: '👨‍🔧', color: '#3B82F6' },
  [Rank.SENIOR_ENGINEER]: { label: '高级工程师', icon: '👨‍💼', color: '#2563EB' },
  [Rank.PROJECT_MANAGER]: { label: '项目经理', icon: '📋', color: '#7C3AED' },
  [Rank.PROJECT_DIRECTOR]: { label: '项目总监', icon: '🎯', color: '#DC2626' },
  [Rank.PARTNER]: { label: '合伙人', icon: '👑', color: '#F59E0B' },
};
```

**Step 2: 验证构建**

Run: `npm run build`
Expected: PASS

**Step 3: 提交**

```bash
git add frontend/src/data/constants.ts
git commit -m "refactor: remove ASSISTANT_ENGINEER from RANK_DISPLAY"
```

---

## Task 4: 更新关系解锁提示文案

**文件:**
- Modify: `frontend/src/data/constants.ts:176-199`

**说明:** 更新关系解锁提示，反映新的职级结构

**Step 1: 修改 RELATIONSHIP_DISPLAY 中的 unlockHint**

```typescript
// 原代码
export const RELATIONSHIP_DISPLAY = {
  [RelationshipType.CLIENT]: {
    label: '甲方', icon: '🤵', color: '#DC2626',
    unlockHint: '实习生即可接触',
  },
  [RelationshipType.SUPERVISION]: {
    label: '监理', icon: '📝', color: '#2563EB',
    unlockHint: '晋升助理工程师解锁',  // 修改
  },
  [RelationshipType.DESIGN]: {
    label: '设计院', icon: '📐', color: '#7C3AED',
    unlockHint: '晋升工程师解锁',      // 修改
  },
  [RelationshipType.LABOR]: {
    label: '劳务队', icon: '👷', color: '#EA580C',
    unlockHint: '实习生即可接触',
  },
  [RelationshipType.GOVERNMENT]: {
    label: '政府部门', icon: '🏛️', color: '#BE185D',
    unlockHint: '晋升高级工程师解锁',   // 修改
  },
};

// 新代码
export const RELATIONSHIP_DISPLAY = {
  [RelationshipType.CLIENT]: {
    label: '甲方', icon: '🤵', color: '#DC2626',
    unlockHint: '实习生即可接触',
  },
  [RelationshipType.SUPERVISION]: {
    label: '监理', icon: '📝', color: '#2563EB',
    unlockHint: '晋升工程师解锁',       // 工程师一次性解锁监理+设计院
  },
  [RelationshipType.DESIGN]: {
    label: '设计院', icon: '📐', color: '#7C3AED',
    unlockHint: '晋升工程师解锁',       // 工程师一次性解锁监理+设计院
  },
  [RelationshipType.LABOR]: {
    label: '劳务队', icon: '👷', color: '#EA580C',
    unlockHint: '实习生即可接触',
  },
  [RelationshipType.GOVERNMENT]: {
    label: '政府部门', icon: '🏛️', color: '#BE185D',
    unlockHint: '晋升高级工程师解锁',
  },
};
```

**Step 2: 验证构建**

Run: `npm run build`
Expected: PASS

**Step 3: 提交**

```bash
git add frontend/src/data/constants.ts
git commit -m "docs: update relationship unlock hints for 6-level system"
```

---

## Task 5: 更新关系解锁逻辑

**文件:**
- Modify: `frontend/src/store/gameStoreNew.ts` (查找 getRelationshipsForRank 或类似函数)

**说明:** 确保工程师同时解锁监理和设计院

**Step 1: 查找并修改关系解锁逻辑**

在 gameStoreNew.ts 中找到关系解锁相关的函数，更新为：

```typescript
// 获取当前职级可用的关系
const getAvailableRelationships = (rank: Rank): RelationshipType[] => {
  switch (rank) {
    case Rank.INTERN:
      return [RelationshipType.CLIENT, RelationshipType.LABOR];
    case Rank.ENGINEER:
      // 工程师一次性解锁监理和设计院
      return [
        RelationshipType.CLIENT,
        RelationshipType.LABOR,
        RelationshipType.SUPERVISION,
        RelationshipType.DESIGN,
      ];
    case Rank.SENIOR_ENGINEER:
      // 高级工程师解锁政府部门
      return [
        RelationshipType.CLIENT,
        RelationshipType.LABOR,
        RelationshipType.SUPERVISION,
        RelationshipType.DESIGN,
        RelationshipType.GOVERNMENT,
      ];
    case Rank.PROJECT_MANAGER:
    case Rank.PROJECT_DIRECTOR:
    case Rank.PARTNER:
      // 所有职级都可用全部关系
      return Object.values(RelationshipType);
    default:
      return [RelationshipType.CLIENT, RelationshipType.LABOR];
  }
};
```

**Step 2: 搜索所有使用 Rank.ASSISTANT_ENGINEER 的地方**

```bash
cd frontend && grep -r "ASSISTANT_ENGINEER\|assistant_engineer" --include="*.ts" --include="*.tsx"
```

**Step 3: 逐一修改引用**

根据搜索结果，修改所有引用助理工程师的代码：
- 事件文件中的职级判断
- UI 组件中的职级显示逻辑
- 条件渲染中的职级检查

**Step 4: 验证构建**

Run: `npm run build`
Expected: PASS

**Step 5: 提交**

```bash
git add frontend/src/store/gameStoreNew.ts
git commit -m "refactor: update relationship unlock logic for 6-level system"
```

---

## Task 6: 合并助理工程师事件到工程师事件池

**文件:**
- Modify: `frontend/src/data/events/assistantEngineerEvents.ts`
- Modify: `frontend/src/data/events/engineerEvents.ts`
- Modify: `frontend/src/data/events/index.ts`

**说明:** 将助理工程师的10个事件合并到工程师事件池

**Step 1: 查看助理工程师事件**

```bash
cat frontend/src/data/events/assistantEngineerEvents.ts
```

**Step 2: 将助理工程师事件复制到工程师事件文件**

打开 `frontend/src/data/events/engineerEvents.ts`，将助理工程师的所有事件添加进去，更新事件的 `rank` 字段为 `Rank.ENGINEER`。

**Step 3: 更新事件索引**

在 `frontend/src/data/events/index.ts` 中：
- 移除助理工程师事件的导出
- 确保工程师事件池包含合并后的所有事件

**Step 4: 删除助理工程师事件文件（可选）**

```bash
rm frontend/src/data/events/assistantEngineerEvents.ts
```

**Step 5: 验证构建**

Run: `npm run build`
Expected: PASS

**Step 6: 提交**

```bash
git add frontend/src/data/events/
git commit -m "refactor: merge assistant engineer events into engineer events"
```

---

## Task 7: 更新 TeamPage 解锁条件

**文件:**
- Modify: `frontend/src/pages/TeamPage.tsx:18-20`

**说明:** 团队系统在项目经理（第4级）开放

**Step 1: 修改 isLateGame 判断**

```typescript
// 原代码（高级工程师开放团队系统）
const isLateGame = rank === Rank.PROJECT_MANAGER ||
                   rank === Rank.PROJECT_DIRECTOR ||
                   rank === Rank.PARTNER;

// 新代码（保持不变，因为已经是项目经理开放）
// 项目经理是第4级，符合我们的新设计
const isLateGame = rank === Rank.PROJECT_MANAGER ||
                   rank === Rank.PROJECT_DIRECTOR ||
                   rank === Rank.PARTNER;
```

注意：此代码无需修改，因为团队系统本来就在项目经理开放。但需要确认提示文案正确。

**Step 2: 检查提示文案**

```typescript
// 确保提示文案说"晋升到项目经理后"
<p className="text-sm text-amber-700">
  晋升到项目经理后，即可组建和管理自己的团队
</p>
```

**Step 3: 提交**

```bash
git add frontend/src/pages/TeamPage.tsx
git commit -m "docs: confirm team system unlock at project manager level"
```

---

## Task 8: 更新游戏策划文档

**文件:**
- Modify: `docs/GAME_DESIGN_DOCUMENT.md`

**说明:** 更新文档中的职级系统章节

**Step 1: 更新职级系统章节（第3节）**

将第3.1节职级表格从7级更新为6级：

```markdown
### 3.1 职级阶梯（6级）

| 职级 | 图标 | 净资产要求 | 项目数要求 | 声誉要求 | 特殊要求 | 季度工资 |
|------|------|-----------|-----------|---------|---------|---------|
| 实习生 | 🎓 | 0 | 0 | 0 | - | 9,000（固定） |
| 工程师 | 👨‍🔧 | 20万 | 1 | 45 | - | 20,000 - 30,000 |
| 高级工程师 | 👨‍💼 | 100万 | 6 | 65 | 1个优质项目 | 50,000 - 75,000 |
| 项目经理 | 📋 | 400万 | 12 | 80 | 3个项目 | 10万 - 14万 |
| 项目总监 | 🎯 | 1,200万 | 22 | 90 | 5个优质项目 | 16.5万 - 28万 |
| 合伙人 | 👑 | 4,000万 | 35 | 95 | 8个优质项目 | 30万（分红制） |
```

**Step 2: 更新关系要求表**

```markdown
**关系要求表**（6级系统）:

| 职级晋升 | 核心关系要求 | 要求类型 | 说明 |
|---------|-------------|---------|------|
| 实习生 → 工程师 | 甲方≥50 **或** 劳务队≥50 | any | 实习生只能维护甲方和劳务队 |
| 工程师 → 高级工程师 | 监理≥60、设计院≥60 | all | 工程师一次性解锁监理和设计院 |
| 高级工程师 → 项目经理 | 甲方≥70、劳务队≥65 | all | 高工需要协调甲方和劳务 |
| 项目经理 → 项目总监 | 所有关系≥70 | all | 总监级需要全方位资源 |
| 项目总监 → 合伙人 | 所有关系≥80 | all | 合伙人需要更高关系要求 |
```

**Step 3: 更新关系解锁表**

```markdown
### 7.1 关系类型

| 关系 | 图标 | 初始值 | 衰减率 | 维护成本 | 解锁职级 |
|------|------|--------|--------|---------|---------|
| 甲方 | 🤵 | 50 | 4/季度 | 高 | 实习生 |
| 监理 | 📝 | 50 | 3/季度 | 中 | 工程师 |
| 设计院 | 📐 | 50 | 3/季度 | 中 | 工程师 |
| 劳务队 | 👷 | 50 | 2/季度 | 低 | 实习生 |
| 政府部门 | 🏛️ | 50 | 5/季度 | 高 | 高级工程师 |
```

**Step 4: 更新游戏阶段说明**

```markdown
### 1.3 游戏阶段

| 阶段 | 职级范围 | 特点 |
|------|---------|------|
| 前期 | 实习生 → 高级工程师 | 积累属性、熟悉系统 |
| 后期 | 项目经理 → 合伙人 | 团队管理、战略决策 |
```

**Step 5: 更新版本号**

```markdown
# 还我一个土木梦 - 游戏策划文档

> **版本**: v1.4
> **更新日期**: 2026-02-03
> **文档类型**: 游戏机制与规则说明
```

**Step 6: 添加更新日志**

```markdown
## 更新日志

### v1.4 (2026-02-03)

**职级系统重构 - 6级系统**

#### 1. 职级合并
- 移除助理工程师职级
- 合并到工程师职级
- 7级系统 → 6级系统

#### 2. 晋升条件调整
- 实习生 → 工程师：20万净资产、1个项目、声誉45
- 工程师 → 高级工程师：100万净资产、6个项目
- 后续职级条件相应调整

#### 3. 关系解锁优化
- 工程师一次性解锁监理和设计院
- 高级工程师解锁政府部门
- 加速前期游戏节奏

#### 4. 团队系统开放
- 项目经理（第4级）开放团队系统
- 个人发展期缩短至前3级
```

**Step 7: 提交**

```bash
git add docs/GAME_DESIGN_DOCUMENT.md
git commit -m "docs: update game design document for 6-level rank system"
```

---

## Task 9: 更新季度结算页面晋升检查

**文件:**
- Modify: `frontend/src/pages/QuarterlySettlement.tsx`
- Modify: `frontend/src/pages/QuarterlySettlementPage.tsx` (如果存在)

**说明:** 确保晋升检查使用新的6级配置

**Step 1: 检查晋升检查逻辑**

在结算页面中，确认晋升检查使用的是 `RANK_CONFIGS` 配置，而不是硬编码的职级判断。

**Step 2: 测试晋升流程**

手动测试（在开发环境中）：
1. 开始新游戏
2. 完成1个项目，积累20万净资产
3. 验证能否晋升到工程师
4. 继续游戏，验证后续晋升

**Step 3: 提交**

```bash
git add frontend/src/pages/QuarterlySettlement.tsx
git commit -m "refactor: update settlement page for 6-level system"
```

---

## Task 10: 全面测试和验证

**文件:**
- Test: 手动游戏测试

**说明:** 完整测试6级职级系统的游戏流程

**Step 1: 单元测试**

```bash
cd frontend && npm test
```

**Step 2: 类型检查**

```bash
cd frontend && npm run build
```

**Step 3: 手动游戏测试**

在开发环境中测试：

| 测试项 | 测试内容 | 预期结果 |
|-------|---------|---------|
| 初始状态 | 实习生，只能看到甲方和劳务队关系 | ✅ |
| 第1次晋升 | 完成1个项目+20万净资产→工程师 | ✅ 同时解锁监理和设计院 |
| 第2次晋升 | 6个项目+100万+优质项目→高工 | ✅ 解锁政府部门 |
| 第3次晋升 | 12个项目+400万→项目经理 | ✅ 团队系统开放 |
| 游戏通关 | 35个项目+4000万+8个优质→合伙人 | ✅ 胜利 |

**Step 4: 边界条件测试**

- 实习生能否维护监理（应不可用）
- 工程师能否维护政府（应不可用）
- 高级工程师能否维护所有关系（应可以）

**Step 5: 提交最终改动**

```bash
git add .
git commit -m "test: complete 6-level rank system implementation"
```

---

## Task 11: 更新 WORKLOG.md

**文件:**
- Modify: `WORKLOG.md`

**说明:** 记录本次重构的工作日志

**Step 1: 添加工作日志条目**

```markdown
## 2026-02-03 - 6级职级系统重构

### 改动点
- 移除助理工程师职级，合并到工程师
- 重新调整所有职级晋升条件
- 优化关系解锁时序
- 合并助理工程师事件到工程师事件池
- 更新游戏策划文档

### 涉及文件
- `shared/types/game.ts` - Rank枚举、RANK_CONFIGS
- `frontend/src/data/constants.ts` - RANK_DISPLAY、RELATIONSHIP_DISPLAY
- `frontend/src/data/events/` - 事件合并
- `frontend/src/store/gameStoreNew.ts` - 关系解锁逻辑
- `frontend/src/pages/TeamPage.tsx` - 团队系统确认
- `docs/GAME_DESIGN_DOCUMENT.md` - 策划文档更新

### 测试状态
- ✅ 类型检查通过
- ✅ 构建成功
- ✅ 手动测试通过

### Review状态
待review
```

**Step 2: 提交**

```bash
git add WORKLOG.md
git commit -m "docs: update WORKLOG for 6-level rank system refactoring"
```

---

## 附录: 文件修改清单

| 文件 | 改动类型 | 修改内容 |
|-----|---------|---------|
| `shared/types/game.ts` | Modify | Rank枚举删除ASSISTANT_ENGINEER，更新RANK_CONFIGS |
| `frontend/src/data/constants.ts` | Modify | 更新RANK_DISPLAY、RELATIONSHIP_DISPLAY |
| `frontend/src/data/events/assistantEngineerEvents.ts` | Delete/Merge | 合并到engineerEvents.ts |
| `frontend/src/data/events/engineerEvents.ts` | Modify | 添加合并后的事件 |
| `frontend/src/data/events/index.ts` | Modify | 更新事件导出 |
| `frontend/src/store/gameStoreNew.ts` | Modify | 更新关系解锁逻辑 |
| `frontend/src/pages/TeamPage.tsx` | Review | 确认团队系统开放条件 |
| `docs/GAME_DESIGN_DOCUMENT.md` | Modify | 更新职级系统文档 |
| `WORKLOG.md` | Modify | 添加工作日志 |

---

## 验证清单

实施完成后，请确认以下检查项：

- [ ] Rank枚举只有6个值
- [ ] RANK_CONFIGS配置符合新设计
- [ ] RANK_DISPLAY没有ASSISTANT_ENGINEER
- [ ] 关系解锁提示更新正确
- [ ] 工程师同时解锁监理和设计院
- [ ] 助理工程师事件已合并
- [ ] 团队系统在项目经理开放
- [ ] 游戏策划文档已更新
- [ ] WORKLOG.md已记录
- [ ] 构建通过（npm run build）
- [ ] 手动测试验证晋升流程

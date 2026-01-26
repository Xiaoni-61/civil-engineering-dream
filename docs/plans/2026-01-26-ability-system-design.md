# 人物属性系统扩展设计

## 设计目标

在现有游戏基础上添加两个新属性（工作能力、幸运），增加游戏的可玩性和策略深度。通过属性的trade-off机制和成长系统，让玩家在每次选择中都需要权衡，同时体验明显的成长感。

---

## 一、核心属性定义

### 1.1 新增属性

**工作能力** (workAbility)
- 范围：0-100
- 初始值：0-10（通过抽卡获得，与幸运总和=10）
- 含义：专业技术能力和项目管理能力
- 主要影响：
  - 解锁"技术方案"隐藏选项（≥30解锁）
  - 价格预测准确率 = (50 + 工作能力/2)%
  - 专业技术类选项效果加成 +10% ~ +50%
  - 专业性关系（设计院、监理）建立成功率加成

**幸运** (luck)
- 范围：0-100
- 初始值：0-10（通过抽卡获得，与工作能力总和=10）
- 含义：运气和随机性
- 主要影响：
  - 解锁"冒险尝试"隐藏选项（≥40解锁）
  - 材料价格暴涨/暴跌事件概率提升
  - 冒险类选项失败概率降低
  - 所有关系统建立时"贵人相助"概率提升

### 1.2 现有属性保持不变

- Cash（现金）、Health（健康）、Reputation（声誉）
- Progress（项目进度）、Quality（项目质量）

---

## 二、人物创建系统

### 2.1 页面流程

**第一步：输入基本信息**
- 姓名：文本输入框，支持手动输入或"🎲 随机姓名"按钮
- 性别：单选（男/女），或"🎲 随机性别"按钮

**第二步：属性抽卡系统**
- 点击"🎴 随机抽取属性"按钮
- 显示抽卡动画和结果：
  ```
  🎴 你的属性分配：

  工作能力：7/10 ████████░░
  幸    运：3/10 ███░░░░░░░

  评价：你是个技术型人才，专业能力强但运气一般。
  在职场发展中要发挥技术优势，同时注意风险控制。
  ```
- 工作能力 + 幸运 = 10（固定总和）
- 可以无限次重新抽卡，直到满意为止

**第三步：开始游戏**
- 确认信息后点击"开始游戏"
- 进入游戏，初始化所有属性

### 2.2 技术实现

- 创建 `CharacterCreationPage.tsx` 组件
- 随机姓名库（男/女各100个常见姓名）
- 属性抽卡动画（CSS + SVG）
- 属性评价文案（根据属性组合生成不同评语）

---

## 三、属性成长系统

### 3.1 三种成长方式

**方式1：事件选择成长（小幅）**
- 事件选项中包含属性变化
- 影响幅度：+1 到 +5
- 边际效应递减：属性越高，成长越慢

**方式2：专门训练行动（大幅，有风险）**

| 训练类型 | 效果 | 消耗 | 成功率 |
|---------|------|------|--------|
| 📚 专业培训 | 工作能力+5 | 现金-2000，健康-5 | 100% |
| 📖 考取证书 | 工作能力+8 | 现金-3000，健康-8 | 50+幸运/2 % |
| 🎯 参加行业活动 | 幸运+3 | 现金-1000，健康-2 | 100% |
| 🎲 外出社交 | 幸运+5 | 现金-1500，健康-3 | 50+幸运/2 % |

- 每季度最多训练1次
- 同种高级训练有3个季度冷却期
- 失败时：消耗资源但属性+0

**方式3：晋升时选择性提升（自动）**
- 每次晋升职级时，随机选择1-2个属性提升
- 提升幅度递减：+10 → +8 → +6 → +5 → +4 → +3
- 不是每次都提升工作能力和幸运，可能提升其他属性（如健康上限）

---

## 四、隐藏选项解锁系统

### 4.1 解锁条件

- 工作能力 ≥ 30：解锁"技术方案"选项
- 幸运 ≥ 40：解锁"冒险尝试"选项

### 4.2 事件结构

**基础选项**：3个（始终显示）
**隐藏选项**：0-2个（根据属性条件）
- 只满足一个条件：显示4个选项
- 两个条件都满足：显示5个选项

### 4.3 示例

```typescript
事件：工地上的失误
- 选项1：立即要求返工
- 选项2：私下协商
- 选项3：默不作声
- 选项4（隐藏）：[技术方案] 利用专业知识提出最优解 ✨
  需要工作能力≥30
  效果比普通选项更好
- 选项5（隐藏）：[冒险尝试] 赌一把 🎲
  需要幸运≥40
  可能大赚也可能失败
```

---

## 五、属性对关系建立的影响

### 5.1 关系建立成功率计算

```
基础成功率：50%

工作能力加成：
- 设计院、监理：工作能力≥60 时，+20% 成功率
- 劳务队：+5%

幸运加成：
- 幸运≥60 时，+15% 随机遇到"贵人相助"事件

最终成功率 = 基础50% + 工作能力加成 + 幸运加成
```

### 5.2 特殊事件 - 贵人相助

- 触发条件：幸运≥60
- 触发概率：15%
- 效果：
  - 免费维护关系
  - 或关系值+10（正常是+5）
- 显示："✨ 贵人相助：幸运让你遇到了设计院的陈总，他对你印象很好！"

---

## 六、属性对市场交易的影响

### 6.1 价格预测系统

**工作能力影响**：
- 准确率 = (50 + 工作能力/2)%
  - 工作能力0 → 50%（完全随机）
  - 工作能力50 → 75%
  - 工作能力100 → 100%
- 准确率影响预测区间宽度：
  - 低准确率：预测区间很宽（400-500）
  - 高准确率：预测区间很窄（445-455）

### 6.2 幸运特殊事件

**触发概率**：2% + 幸运/20（2-7%）

**两种事件**：
- 暴涨事件（60%概率）：价格 +50%
- 暴跌事件（40%概率）：价格 -30%

**价格生成算法**：

```javascript
function generateNextQuarterPrices(workAbility, luck) {
  // 1. 基础价格波动（±15%）
  let newPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.3);

  // 2. 幸运特殊事件
  const eventChance = 2 + luck / 20;
  if (Math.random() * 100 < eventChance) {
    newPrice *= Math.random() < 0.6 ? 1.5 : 0.7;
  }

  // 3. 价格边界检查
  newPrice = Math.max(100, Math.min(newPrice, 10000));

  return newPrice;
}
```

### 6.3 市场页面UI显示

```
┌─────────────────────────────────────┐
│ 水泥  当前价格：450元/吨             │
│ ⬆️ +5.2%                           │
│                                     │
│ 📊 价格预测（准确率：65%）           │
│ 预测：正常波动                      │
│ 预测价格区间：430-470元/吨           │
│ ⚡ 特殊事件概率：+4.5%（幸运加成）    │
│ - 可能暴涨：+50%                    │
│ - 可能暴跌：-30%                    │
└─────────────────────────────────────┘
```

---

## 七、技术架构

### 7.1 类型定义扩展

**shared/types/game.ts**:
```typescript
export interface PlayerStats {
  cash: number;
  health: number;
  reputation: number;
  progress: number;
  quality: number;

  // 新增属性
  workAbility: number;
  luck: number;
}

export interface AbilityEffects {
  pricePredictionAccuracy: number;
  specialEventChance: number;
  relationBonus: number;
}
```

**shared/types/character.ts** (新建):
```typescript
export interface CharacterCreation {
  name: string;
  gender: 'male' | 'female';
  workAbility: number;
  luck: number;
}

export const RANDOM_NAMES = {
  male: ["张伟", "李强", "王磊", "刘洋", "陈杰"],
  female: ["李娜", "王芳", "张敏", "刘静", "陈丽"]
};
```

**frontend/src/data/events/eventTypes.ts**:
```typescript
export interface DecisionOption {
  id: string;
  text: string;
  feedback: string;
  effects: EventEffects;

  // 新增
  requiredAbility?: {
    workAbility?: number;
    luck?: number;
  };
  hidden?: boolean;
  riskFactor?: number;
}

export interface EventEffects {
  cash?: number;
  health?: number;
  reputation?: number;
  progress?: number;
  quality?: number;
  relationships?: RelationshipEffect[];

  // 新增
  workAbility?: number;
  luck?: number;
  teamMorale?: number;
  leadership?: number;
}
```

### 7.2 状态管理扩展

**gameStoreNew.ts** 新增：
- `character`: CharacterCreation 数据
- `lastTrainingQuarter`: 记录上次训练时间
- `trainingCooldowns`: 训练冷却时间记录
- `generateNextQuarterPrices()`: 新的价格生成函数
- `generatePricePrediction()`: 价格预测函数
- `executeTraining()`: 训练执行函数

---

## 八、实施步骤

### Phase 1: 数据结构搭建（2小时）
1. 扩展 `shared/types/game.ts`
2. 创建 `shared/types/character.ts`
3. 扩展 `frontend/src/data/events/eventTypes.ts`

### Phase 2: 人物创建系统（3小时）
1. 创建 `CharacterCreationPage.tsx`
2. 实现属性抽卡逻辑和动画
3. 添加属性评价文案生成
4. 修改 `Home.tsx` 和 `gameStoreNew.ts`

### Phase 3: 训练行动系统（2小时）
1. 创建 `TrainingActionCard.tsx`
2. 修改 `ActionsPage.tsx`
3. 实现训练逻辑和冷却机制

### Phase 4: 隐藏选项实现（2小时）
1. 修改 `EventCard.tsx`
2. 添加隐藏选项到现有事件
3. 实现风险判定逻辑

### Phase 5: 价格预测系统（2小时）
1. 修改 `MarketPage.tsx`
2. 实现价格预测显示
3. 实现价格生成算法

### Phase 6: 关系系统扩展（1小时）
1. 修改关系建立成功率计算
2. 添加贵人相助事件

### Phase 7: 测试与平衡（3小时）
1. 端到端测试
2. 调整属性成长曲线
3. 平衡训练成本和效果

**总预计时间**：15小时

---

## 九、设计原则总结

| 原则 | 实现 |
|------|------|
| 从低开始 | 初始值0-10，明显成长感 |
| Trade-off | 属性总和固定，必须有所取舍 |
| 探索性 | 无限次抽卡、隐藏选项 |
| 真实性 | 价格预测真实反映涨跌 |
| 策略性 | 训练有风险，需要权衡 |
| 平衡性 | 边际效应递减，避免属性升满 |

---

## 十、后续优化方向

1. **更多属性**：体质、魅力、胆识等
2. **属性相互影响**：比如工作能力高但幸运低，某些选项会有不同效果
3. **成就系统**：比如"工作能力达到100"、"连续3次训练成功"等
4. **特殊事件**：针对特定属性组合的特殊事件

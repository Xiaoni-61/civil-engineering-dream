# Data - 游戏数据

## 目录用途

存放游戏静态数据，包括事件卡池、职级配置、数值初始化参数等。

## 应包含的数据文件

### 1. events.ts - 事件卡池

**MVP 要求**: ≥60 张卡牌

**数据结构**:
```typescript
interface EventCard {
  id: string;
  title: string;           // 事件标题
  description: string;     // 事件描述（土木梗）
  category: EventCategory; // 事件分类
  options: Option[];       // 3 个选项
}

interface Option {
  id: string;
  label: string;           // 选项文字
  type: 'rush' | 'cost' | 'quality';  // 赶工/控成本/保质量
  effects: OptionEffect;   // 数值影响
  feedback: string;        // 选择后的反馈文字
}
```

**事件分类**:
- `client` - 甲方相关（改图、加需求、催进度）
- `weather` - 天气事件（暴雨停工、高温预警）
- `finance` - 资金相关（进度款拖欠、材料涨价）
- `team` - 团队相关（人员离职、加班冲突）
- `quality` - 质量事件（验收不合格、返工）
- `safety` - 安全事件（安全检查、事故隐患）

---

### 2. titles.ts - 职级配置

```typescript
interface TitleConfig {
  minScore: number;
  maxScore: number;
  title: string;
  description: string;
}

// 示例
const titles: TitleConfig[] = [
  { minScore: 90, maxScore: 100, title: '土木之神', description: '...' },
  { minScore: 70, maxScore: 89, title: '项目经理', description: '...' },
  // ...
];
```

---

### 3. initialStats.ts - 初始数值

```typescript
const initialStats = {
  cash: 100,      // 初始现金
  health: 100,    // 初始健康
  rep: 50,        // 初始声望
  progress: 0,    // 初始进度
  quality: 70,    // 初始质量
};
```

---

### 4. gameConfig.ts - 游戏配置

```typescript
const gameConfig = {
  maxRounds: 20,           // 最大回合数
  failThresholds: {
    cash: 0,               // 现金低于此值失败
    health: 0,             // 健康低于此值失败
  },
  // 其他配置...
};
```

## 数据维护说明

- 事件卡内容应包含土木行业梗，保持趣味性
- 数值平衡需要测试调整
- 新增事件卡需要同时更新分类统计

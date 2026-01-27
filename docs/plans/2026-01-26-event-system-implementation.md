# 事件决策系统实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标:** 构建一个季度制的叙事决策系统，每季度随机抽取 2-4 个事件，玩家必须完成所有事件的选择决策才能进入下一季度。

**架构:** 基于现有的 Zustand store 扩展事件系统，采用序列式事件触发和结果卡片反馈机制。事件数据按职级分文件组织，支持类型安全的影响效果计算。

**技术栈:** React 18, TypeScript 5, Zustand 4, TailwindCSS 3

---

## 目录结构

```
frontend/src/data/events/
  ├── index.ts                    # 导出所有事件
  ├── eventTypes.ts               # 事件类型定义
  ├── commonEvents.ts             # 通用事件
  ├── internEvents.ts             # 实习生事件 (10个)
  └── ...其他职级文件

frontend/src/components/
  ├── EventCard.tsx               # 事件展示卡片
  ├── EventResultCard.tsx         # 结果展示卡片
  └── EventHistoryItem.tsx        # 事件历史项

frontend/src/pages/
  └── EventsPage.tsx              # 更新事件页面

frontend/src/store/
  └── gameStoreNew.ts             # 扩展事件相关状态
```

---

## Task 1: 创建事件类型定义

**文件:**
- 创建: `frontend/src/data/events/eventTypes.ts`

**Step 1: 创建类型定义文件**

```typescript
/**
 * 事件决策系统类型定义
 */

import { Rank, RelationshipType } from '@shared/types';

/**
 * 事件类别
 */
export type EventCategory = 'professional' | 'workplace';

/**
 * 决策事件
 */
export interface DecisionEvent {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  requiredRank: Rank;
  options: DecisionOption[];
  flavorText?: string;
}

/**
 * 决策选项
 */
export interface DecisionOption {
  id: string;
  text: string;
  feedback: string;
  effects: EventEffects;
}

/**
 * 事件影响效果
 */
export interface EventEffects {
  cash?: number;
  health?: number;
  reputation?: number;
  progress?: number;
  quality?: number;
  relationships?: RelationshipEffect[];
  teamMorale?: number;
  leadership?: number;
}

/**
 * 关系影响
 */
export interface RelationshipEffect {
  type: RelationshipType;
  change: number;
}

/**
 * 事件结果记录
 */
export interface EventResult {
  eventId: string;
  eventTitle: string;
  selectedOptionId: string;
  selectedOptionText: string;
  feedback: string;
  effects: EventEffects;
  timestamp: number;
}

/**
 * 事件池配置
 */
export interface EventPoolConfig {
  common: DecisionEvent[];
  intern: DecisionEvent[];
  assistantEngineer: DecisionEvent[];
  engineer: DecisionEvent[];
  seniorEngineer: DecisionEvent[];
  manager: DecisionEvent[];
  director: DecisionEvent[];
  partner: DecisionEvent[];
}
```

**Step 2: 验证 TypeScript 编译**

Run: `cd frontend && npm run build`
Expected: 成功编译（目前没有使用这些类型，不会报错）

**Step 3: 提交**

```bash
cd frontend
git add src/data/events/eventTypes.ts
git commit -m "feat(events): add event type definitions"
```

---

## Task 2: 创建事件索引文件

**文件:**
- 创建: `frontend/src/data/events/index.ts`

**Step 1: 创建索引文件**

```typescript
/**
 * 事件决策系统 - 索引文件
 *
 * 按职级组织的事件池
 * - 低职级（实习生-高级工程师）: 40-50个事件
 * - 高职级（项目经理-合伙人）: 30个事件
 * - 通用事件: 所有职级共享
 */

import { DecisionEvent, EventPoolConfig } from './eventTypes';
import { Rank } from '@shared/types';

// 导入各职级事件（后续添加）
// import { commonEvents } from './commonEvents';
// import { internEvents } from './internEvents';
// import { assistantEngineerEvents } from './assistantEngineerEvents';
// ... 其他导入

// 临时空数组，后续填充
const commonEvents: DecisionEvent[] = [];
const internEvents: DecisionEvent[] = [];
const assistantEngineerEvents: DecisionEvent[] = [];
const engineerEvents: DecisionEvent[] = [];
const seniorEngineerEvents: DecisionEvent[] = [];
const managerEvents: DecisionEvent[] = [];
const directorEvents: DecisionEvent[] = [];
const partnerEvents: DecisionEvent[] = [];

/**
 * 获取指定职级可用的所有事件
 */
export function getEventsForRank(rank: Rank): DecisionEvent[] {
  const events: DecisionEvent[] = [
    ...commonEvents,  // 通用事件所有人都能遇到
  ];

  // 添加当前及以下职级的事件
  if (rank >= Rank.INTERN) {
    events.push(...internEvents);
  }
  if (rank >= Rank.ASSISTANT_ENGINEER) {
    events.push(...assistantEngineerEvents);
  }
  if (rank >= Rank.ENGINEER) {
    events.push(...engineerEvents);
  }
  if (rank >= Rank.SENIOR_ENGINEER) {
    events.push(...seniorEngineerEvents);
  }
  if (rank >= Rank.PROJECT_MANAGER) {
    events.push(...managerEvents);
  }
  if (rank >= Rank.PROJECT_DIRECTOR) {
    events.push(...directorEvents);
  }
  if (rank >= Rank.PARTNER) {
    events.push(...partnerEvents);
  }

  return events;
}

/**
 * 从事件池中随机抽取指定数量的事件
 */
export function shuffleQuarterEvents(
  availableEvents: DecisionEvent[],
  count: number
): DecisionEvent[] {
  const shuffled = [...availableEvents].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, availableEvents.length));
}

/**
 * 根据事件ID查找事件
 */
export function findEventById(eventId: string): DecisionEvent | undefined {
  const allEvents = [
    ...commonEvents,
    ...internEvents,
    ...assistantEngineerEvents,
    ...engineerEvents,
    ...seniorEngineerEvents,
    ...managerEvents,
    ...directorEvents,
    ...partnerEvents,
  ];

  return allEvents.find(e => e.id === eventId);
}

// 导出所有事件（用于文档和测试）
export const eventPool: EventPoolConfig = {
  common: commonEvents,
  intern: internEvents,
  assistantEngineer: assistantEngineerEvents,
  engineer: engineerEvents,
  seniorEngineer: seniorEngineerEvents,
  manager: managerEvents,
  director: directorEvents,
  partner: partnerEvents,
};
```

**Step 2: 验证 TypeScript 编译**

Run: `cd frontend && npm run build`
Expected: 成功编译

**Step 3: 提交**

```bash
cd frontend
git add src/data/events/index.ts
git commit -m "feat(events): add event index with pool management"
```

---

## Task 3: 扩展 gameStoreNew 事件状态

**文件:**
- 修改: `frontend/src/store/gameStoreNew.ts`

**Step 1: 添加事件相关的导入**

在文件顶部添加：

```typescript
import {
  DecisionEvent,
  EventResult,
  getEventsForRank,
  shuffleQuarterEvents
} from '@/data/events';
```

**Step 2: 扩展 GameStore 接口**

找到 GameStore 接口定义，添加以下字段：

```typescript
interface GameStore {
  // ... 现有字段 ...

  // 事件系统
  quarterEvents: DecisionEvent[];        // 本季度待处理事件
  currentEventIndex: number;             // 当前事件索引
  completedEventResults: EventResult[];  // 本季度已完成事件结果
  allEventHistory: EventResult[];        // 全局事件历史（合并到eventHistory中）
  pendingEventResult: EventResult | null; // 待确认的结果
  showEventResult: boolean;             // 是否显示结果卡片

  // 事件相关 actions
  initializeQuarterEvents: () => void;
  selectEventOption: (optionId: string) => void;
  continueToNextEvent: () => void;
  isAllEventsCompleted: () => boolean;
  getCurrentEvent: () => DecisionEvent | null;
  getCurrentEventResult: () => EventResult | null;
}
```

**Step 3: 初始化事件状态**

在初始状态中添加：

```typescript
quarterEvents: [],
currentEventIndex: 0,
completedEventResults: [],
allEventHistory: [],
pendingEventResult: null,
showEventResult: false,
```

**Step 4: 实现辅助函数**

在文件中添加（在其他辅助函数附近）：

```typescript
// 应用事件影响
const applyEventEffects = (effects: EventResult['effects']) => {
  set((state) => {
    const newStats = { ...state.stats };
    const newRelationships = { ...state.relationships };
    const newProgress = state.projectProgress;
    const newQuality = state.projectQuality;
    const newTeam = { ...state.team };

    // 应用基础属性影响
    if (effects.cash) newStats.cash += effects.cash;
    if (effects.health) newStats.health = Math.max(0, Math.min(100, newStats.health + effects.health));
    if (effects.reputation) newStats.reputation = Math.max(0, Math.min(100, newStats.reputation + effects.reputation));
    if (effects.progress) {
      const newState = updateProjectProgress(newProgress, effects.progress);
      // 处理项目进度更新
    }
    if (effects.quality) {
      // 处理项目质量更新
    }

    // 应用关系影响
    if (effects.relationships) {
      effects.relationships.forEach(rel => {
        newRelationships[rel.type] = Math.max(0, Math.min(100, newRelationships[rel.type] + rel.change));
      });
    }

    // 应用团队影响（后期）
    if (effects.teamMorale && newTeam.members.length > 0) {
      newTeam.members.forEach(member => {
        member.morale = Math.max(0, Math.min(100, member.morale + effects.teamMorale!));
      });
    }

    return {
      stats: newStats,
      relationships: newRelationships,
      projectProgress: newProgress,
      projectQuality: newQuality,
      team: newTeam,
    };
  });
};
```

**Step 5: 验证编译**

Run: `cd frontend && npm run build`
Expected: 编译成功（类型已添加但方法未实现）

**Step 6: 提交**

```bash
cd frontend
git add src/store/gameStoreNew.ts
git commit -m "feat(store): add event system state types"
```

---

## Task 4: 实现事件初始化逻辑

**文件:**
- 修改: `frontend/src/store/gameStoreNew.ts`

**Step 1: 实现 initializeQuarterEvents**

找到 store 的实现部分，添加这个方法：

```typescript
initializeQuarterEvents: () => {
  const state = get();
  const rank = state.rank;

  // 获取当前职级可用的事件
  const availableEvents = getEventsForRank(rank);

  // 如果没有可用事件，跳过
  if (availableEvents.length === 0) {
    console.warn('No events available for rank:', rank);
    return;
  }

  // 随机抽取 2-4 个事件
  const eventCount = Math.floor(Math.random() * 3) + 2;
  const selectedEvents = shuffleQuarterEvents(availableEvents, eventCount);

  set({
    quarterEvents: selectedEvents,
    currentEventIndex: 0,
    completedEventResults: [],
    pendingEventResult: null,
    showEventResult: false,
  });
},
```

**Step 2: 在 nextQuarter 中调用初始化**

找到 `nextQuarter` 方法，在开始部分添加：

```typescript
nextQuarter: () => {
  // ... 现有的代码 ...

  // 初始化本季度事件
  get().initializeQuarterEvents();

  // ... 继续其他逻辑 ...
},
```

**Step 3: 验证编译**

Run: `cd frontend && npm run build`
Expected: 编译成功

**Step 4: 提交**

```bash
cd frontend
git add src/store/gameStoreNew.ts
git commit -m "feat(store): implement quarter event initialization"
```

---

## Task 5: 实现事件选择逻辑

**文件:**
- 修改: `frontend/src/store/gameStoreNew.ts`

**Step 1: 实现 selectEventOption**

```typescript
selectEventOption: (optionId: string) => {
  const state = get();
  const currentEvent = state.quarterEvents[state.currentEventIndex];

  if (!currentEvent) {
    console.error('No current event available');
    return;
  }

  const selectedOption = currentEvent.options.find(o => o.id === optionId);
  if (!selectedOption) {
    console.error('Option not found:', optionId);
    return;
  }

  // 创建结果记录
  const result: EventResult = {
    eventId: currentEvent.id,
    eventTitle: currentEvent.title,
    selectedOptionId: optionId,
    selectedOptionText: selectedOption.text,
    feedback: selectedOption.feedback,
    effects: selectedOption.effects,
    timestamp: Date.now(),
  };

  // 暂存结果，显示结果卡片
  set({
    pendingEventResult: result,
    showEventResult: true,
  });
},
```

**Step 2: 实现 continueToNextEvent**

```typescript
continueToNextEvent: () => {
  const state = get();

  if (!state.pendingEventResult) {
    console.error('No pending event result');
    return;
  }

  // 应用当前事件的影响
  applyEventEffects(state.pendingEventResult.effects);

  // 添加到已完成列表
  const newCompleted = [...state.completedEventResults, state.pendingEventResult];
  const newIndex = state.currentEventIndex + 1;

  // 检查是否还有更多事件
  if (newIndex < state.quarterEvents.length) {
    // 还有更多事件
    set({
      completedEventResults: newCompleted,
      currentEventIndex: newIndex,
      pendingEventResult: null,
      showEventResult: false,
    });
  } else {
    // 所有事件已完成
    set({
      completedEventResults: newCompleted,
      currentEventIndex: newIndex,
      allEventHistory: [...state.allEventHistory, ...newCompleted],
      eventHistory: [...state.eventHistory, ...newCompleted.map(r => ({
        id: `${r.eventId}-${r.selectedOptionId}`,
        title: r.eventTitle,
        description: r.selectedOptionText,
        options: [],
        // 兼容现有 EventCard 结构
      }))],
      quarterEvents: [],
      pendingEventResult: null,
      showEventResult: false,
    });
  }
},
```

**Step 3: 实现辅助查询方法**

```typescript
isAllEventsCompleted: () => {
  const state = get();
  return state.quarterEvents.length > 0 &&
         state.currentEventIndex >= state.quarterEvents.length;
},

getCurrentEvent: () => {
  const state = get();
  return state.quarterEvents[state.currentEventIndex] || null;
},

getCurrentEventResult: () => {
  const state = get();
  return state.pendingEventResult;
},
```

**Step 4: 验证编译和运行**

Run: `cd frontend && npm run build`
Expected: 编译成功

**Step 5: 提交**

```bash
cd frontend
git add src/store/gameStoreNew.ts
git commit -m "feat(store): implement event selection and continuation logic"
```

---

## Task 6: 创建 EventCard 组件

**文件:**
- 创建: `frontend/src/components/EventCard.tsx`

**Step 1: 创建组件文件**

```typescript
import { DecisionEvent, EventCategory } from '@/data/events';

interface EventCardProps {
  event: DecisionEvent;
  onSelectOption: (optionId: string) => void;
}

export function EventCard({ event, onSelectOption }: EventCardProps) {
  const categoryConfig = {
    professional: {
      label: '🔧 专业问题',
      className: 'bg-blue-100 text-blue-700',
    },
    workplace: {
      label: '💼 职场博弈',
      className: 'bg-purple-100 text-purple-700',
    },
  };

  const config = categoryConfig[event.category];

  return (
    <div className="bg-gradient-to-br from-brand-50 to-engineering-50 border-2 border-brand-200 rounded-xl p-5">
      {/* 事件类别标签 */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2 py-1 rounded-full ${config.className}`}>
          {config.label}
        </span>
      </div>

      {/* 事件标题和描述 */}
      <h3 className="font-bold text-lg mb-2 text-slate-900">{event.title}</h3>
      <p className="text-sm text-slate-700 mb-4">{event.description}</p>

      {/* 背景描述（可选） */}
      {event.flavorText && (
        <p className="text-xs text-slate-500 italic mb-4">{event.flavorText}</p>
      )}

      {/* 三个选项 */}
      <div className="space-y-2">
        {event.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectOption(option.id)}
            className="w-full py-3 px-4 bg-white border-2 border-slate-200 rounded-lg hover:border-brand-400 hover:bg-brand-50 active:scale-[0.98] transition-all text-left"
          >
            <div className="font-medium text-slate-900">{option.text}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: 验证编译**

Run: `cd frontend && npm run build`
Expected: 编译成功

**Step 3: 提交**

```bash
cd frontend
git add src/components/EventCard.tsx
git commit -m "feat(components): add EventCard component"
```

---

## Task 7: 创建 EventResultCard 组件

**文件:**
- 创建: `frontend/src/components/EventResultCard.tsx`

**Step 1: 创建组件文件**

```typescript
import { EventResult, EventEffects } from '@/data/events';
import { RELATIONSHIP_DISPLAY } from '@/data/constants';
import { RelationshipType } from '@shared/types';

interface EventResultCardProps {
  result: EventResult;
  onContinue: () => void;
}

function renderEffectItem(label: string, value?: number) {
  if (value === undefined) return null;
  const isPositive = value >= 0;
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{value.toLocaleString()}
      </span>
    </div>
  );
}

export function EventResultCard({ result, onContinue }: EventResultCardProps) {
  const { effects } = result;

  return (
    <div className="bg-white border-2 border-brand-200 rounded-xl p-5">
      {/* 结果标题 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">📋</span>
        <h3 className="font-bold text-lg text-slate-900">决策结果</h3>
      </div>

      {/* 选择的选项 */}
      <div className="bg-slate-50 rounded-lg p-3 mb-4">
        <div className="text-xs text-slate-500 mb-1">你的选择</div>
        <div className="font-medium text-slate-900">{result.selectedOptionText}</div>
      </div>

      {/* 反馈文字 */}
      <p className="text-sm text-slate-700 mb-4">{result.feedback}</p>

      {/* 影响列表 */}
      <div className="space-y-1 mb-4">
        <div className="text-xs text-slate-500 mb-2">影响详情</div>

        {renderEffectItem('💰 现金', effects.cash)}
        {renderEffectItem('❤️ 健康', effects.health)}
        {renderEffectItem('⭐ 声誉', effects.reputation)}
        {renderEffectItem('📈 进度', effects.progress)}
        {renderEffectItem('📊 质量', effects.quality)}

        {/* 关系影响 */}
        {effects.relationships?.map((rel) => {
          const relInfo = RELATIONSHIP_DISPLAY[rel.type];
          return (
            <div key={rel.type} className="flex justify-between items-center py-1">
              <span className="text-sm flex items-center gap-1">
                <span>{relInfo.icon}</span>
                <span>{relInfo.label}</span>
              </span>
              <span className={`text-sm font-bold ${rel.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {rel.change >= 0 ? '+' : ''}{rel.change}
              </span>
            </div>
          );
        })}

        {effects.teamMorale !== undefined && renderEffectItem('😊 团队士气', effects.teamMorale)}
        {effects.leadership !== undefined && renderEffectItem('👑 领导力', effects.leadership)}
      </div>

      {/* 继续按钮 */}
      <button
        onClick={onContinue}
        className="w-full py-3 px-6 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600 active:scale-[0.98] transition-all"
      >
        继续 →
      </button>
    </div>
  );
}
```

**Step 2: 验证编译**

Run: `cd frontend && npm run build`
Expected: 编译成功

**Step 3: 提交**

```bash
cd frontend
git add src/components/EventResultCard.tsx
git commit -m "feat(components): add EventResultCard component"
```

---

## Task 8: 更新 EventsPage 集成新组件

**文件:**
- 修改: `frontend/src/pages/EventsPage.tsx`

**Step 1: 添加新导入**

替换现有导入：

```typescript
import { useNavigate } from 'react-router-dom';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { GameStatus } from '@shared/types';
import { EventCard } from '@/components/EventCard';
import { EventResultCard } from '@/components/EventResultCard';
```

**Step 2: 添加新的 state 选择器**

在组件内添加：

```typescript
export function EventsPage() {
  const navigate = useNavigate();

  // 现有选择器
  const eventHistory = useGameStoreNew((state) => state.eventHistory);
  const currentEvent = useGameStoreNew((state) => state.currentEvent);
  const status = useGameStoreNew((state) => state.status);
  const selectOption = useGameStoreNew((state) => state.selectOption);
  const actionPoints = useGameStoreNew((state) => state.actionPoints);
  const maxActionPoints = useGameStoreNew((state) => state.maxActionPoints);
  const finishQuarter = useGameStoreNew((state) => state.finishQuarter);
  const nextQuarter = useGameStoreNew((state) => state.nextQuarter);
  const currentQuarter = useGameStoreNew((state) => state.currentQuarter);

  // 新事件系统选择器
  const quarterEvents = useGameStoreNew((state) => state.quarterEvents);
  const currentEventIndex = useGameStoreNew((state) => state.currentEventIndex);
  const getCurrentEvent = useGameStoreNew((state) => state.getCurrentEvent);
  const getCurrentEventResult = useGameStoreNew((state) => state.getCurrentEventResult);
  const showEventResult = useGameStoreNew((state) => state.showEventResult);
  const isAllEventsCompleted = useGameStoreNew((state) => state.isAllEventsCompleted);

  // 新的 actions
  const selectEventOption = useGameStoreNew((state) => state.selectEventOption);
  const continueToNextEvent = useGameStoreNew((state) => state.continueToNextEvent);
```

**Step 3: 添加事件处理函数**

```typescript
  const handleSelectOption = (optionId: string) => {
    selectEventOption(optionId);
  };

  const handleContinue = () => {
    continueToNextEvent();
  };

  // 旧的 selectOption 调用改为新的
  const handleOldSelectOption = (optionId: string) => {
    selectOption(optionId);
  };
```

**Step 4: 更新 JSX 渲染**

在返回的 JSX 中，更新事件显示部分：

```tsx
  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-40">
      <div className="max-w-md mx-auto px-4">
        {/* 返回按钮 */}
        <button onClick={() => navigate(-1)} className="mb-4 text-slate-600 hover:text-slate-900 flex items-center gap-1">
          ← 返回
        </button>

        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">第 {currentQuarter} 季度</h1>
          <span className="text-sm text-slate-800">
            行动点: {actionPoints}/{maxActionPoints}
          </span>
        </div>

        {/* 新事件系统 - 进度指示器 */}
        {quarterEvents.length > 0 && (
          <div className="mb-6 bg-white rounded-xl p-3 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">本季度事件进度</span>
              <span className="text-sm text-slate-600">
                {currentEventIndex + 1} / {quarterEvents.length}
              </span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all"
                style={{ width: `${((currentEventIndex + 1) / quarterEvents.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 新事件系统 - 当前事件卡片 */}
        {getCurrentEvent() && !showEventResult && (
          <section className="mb-6">
            <EventCard
              event={getCurrentEvent()!}
              onSelectOption={handleSelectOption}
            />
          </section>
        )}

        {/* 新事件系统 - 结果卡片 */}
        {showEventResult && getCurrentEventResult() && (
          <section className="mb-6">
            <EventResultCard
              result={getCurrentEventResult()!}
              onContinue={handleContinue}
            />
          </section>
        )}

        {/* 新事件系统 - 全部完成提示 */}
        {isAllEventsCompleted() && quarterEvents.length > 0 && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 text-center mb-6">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-bold text-emerald-800 mb-2">
              本季度事件已全部处理完成！
            </h3>
            <p className="text-sm text-emerald-700">
              你可以继续使用行动点，或直接完成本季度
            </p>
          </div>
        )}

        {/* 保留旧的事件显示（兼容性） */}
        {status === GameStatus.PLAYING && currentEvent && quarterEvents.length === 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">当前事件</h2>
            <div className="bg-gradient-to-br from-brand-50 to-engineering-50 border-2 border-brand-200 rounded-xl p-5">
              <h3 className="font-bold text-slate-900 text-lg mb-2">{currentEvent.title}</h3>
              <p className="text-sm text-slate-700 mb-4">{currentEvent.description}</p>
              {currentEvent.options && currentEvent.options.length > 0 && (
                <div className="space-y-2">
                  {currentEvent.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOldSelectOption(option.id)}
                      className="w-full py-3 px-4 bg-white border-2 border-slate-200 rounded-lg hover:border-brand-400 hover:bg-brand-50 active:scale-[0.98] transition-all text-left"
                    >
                      <div className="font-medium text-slate-900 mb-1">{option.text}</div>
                      {option.feedback && (
                        <div className="text-xs text-slate-500">{option.feedback}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 事件历史 - 保持不变 */}
        <section className="mb-6">
          {/* ... 现有的事件历史代码 ... */}
        </section>

        {/* 完成本季度按钮 - 更新条件 */}
        {status === GameStatus.PLAYING && (isAllEventsCompleted() || quarterEvents.length === 0) && (
          <div className="mb-4">
            <button
              onClick={handleFinishQuarter}
              className="w-full py-4 px-6 bg-gradient-to-r from-brand-600 to-brand-700 text-slate-800 font-bold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] border-2 border-brand-800"
            >
              完成本季度
            </button>
          </div>
        )}

        {/* 下一季度按钮 - 保持不变 */}
        {status === GameStatus.SETTLEMENT && (
          <div className="mb-4">
            <button
              onClick={handleNextQuarter}
              className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-800 font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              下一季度 →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

**Step 5: 验证编译**

Run: `cd frontend && npm run build`
Expected: 编译成功

**Step 6: 提交**

```bash
cd frontend
git add src/pages/EventsPage.tsx
git commit -m "feat(pages): integrate new event system into EventsPage"
```

---

## Task 9: 创建示例事件（实习生）

**文件:**
- 创建: `frontend/src/data/events/internEvents.ts`

**Step 1: 创建实习生事件文件**

```typescript
/**
 * 实习生专属事件
 *
 * 共10个事件，5个专业型 + 5个职场型
 */

import { DecisionEvent } from './eventTypes';
import { Rank } from '@shared/types';

export const internEvents: DecisionEvent[] = [
  // 专业型事件 (5个)
  {
    id: 'int_001_prof',
    title: '工地上的失误',
    description: '你在检查工地时发现一处钢筋绑扎不符合规范，如果不及时处理可能会影响结构安全。但是指出这个问题会让施工队很没面子。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    flavorText: '刚来工地没几天，你就遇到了这样的两难处境...',
    options: [
      {
        id: 'int_001_opt_a',
        text: '立即要求返工，坚持规范标准',
        feedback: '你坚持原则，施工队虽然不满但最终还是返工了。监理对你的认真态度表示认可。',
        effects: {
          reputation: 5,
          health: -2,
          relationships: [
            { type: 'labor', change: -5 },
            { type: 'supervision', change: 3 }
          ]
        }
      },
      {
        id: 'int_001_opt_b',
        text: '私下找工头协商，提出折中方案',
        feedback: '你用灵活的方式解决了问题，工头感激你的理解，监理也没有深究。',
        effects: {
          reputation: 2,
          relationships: [
            { type: 'labor', change: 3 }
          ]
        }
      },
      {
        id: 'int_001_opt_c',
        text: '默不作声，当作没看见',
        feedback: '你选择了沉默，虽然避免了冲突，但心里总觉得不安。结构安全无小事...',
        effects: {
          reputation: -3,
          health: 2
        }
      }
    ]
  },

  {
    id: 'int_002_prof',
    title: '图纸疑问',
    description: '在看施工图纸时，你发现一个尺寸标注似乎有矛盾。但这可能是设计院的笔误，直接指出来会不会让人觉得你多事？',
    category: 'professional',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_002_opt_a',
        text: '向带教工程师请教',
        feedback: '带教工程师夸你细心，解释说这是常用的简化标注法。',
        effects: {
          reputation: 3,
          health: 1
        }
      },
      {
        id: 'int_002_opt_b',
        text: '直接联系设计院确认',
        feedback: '设计院回复这是规范做法，但带教工程师觉得你越级了。',
        effects: {
          reputation: -2,
          relationships: [
            { type: 'design', change: 2 }
          ]
        }
      },
      {
        id: 'int_002_opt_c',
        text: '先记下来，观察实际施工情况',
        feedback: '你谨慎地记录下来，后来发现确实是简化标注，学到了新知识。',
        effects: {
          health: 2,
          progress: 3
        }
      }
    ]
  },

  {
    id: 'int_003_prof',
    title: '材料验收',
    description: '一批水泥运到现场，外观看起来有些受潮。供应商说没问题，可以继续使用，但你觉得不保险。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_003_opt_a',
        text: '坚持要求退换',
        feedback: '供应商很不情愿，但还是同意了。项目经理觉得你原则性强。',
        effects: {
          reputation: 4,
          relationships: [
            { type: 'client', change: -2 }
          ]
        }
      },
      {
        id: 'int_003_opt_b',
        text: '取样送检后再决定',
        feedback: '检测结果合格，但耽误了两天工期。大家觉得你太谨慎了。',
        effects: {
          reputation: 1,
          progress: -5,
          quality: 5
        }
      },
      {
        id: 'int_003_opt_c',
        text: '按供应商说的使用',
        feedback: '你选择了信任供应商，但后来这批水泥确实出现了一些问题...',
        effects: {
          reputation: -4,
          quality: -5
        }
      }
    ]
  },

  {
    id: 'int_004_prof',
    title: '施工延误',
    description: '连续下了三天雨，室外施工无法进行，工期可能会延误。甲方打电话来询问情况。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_004_opt_a',
        text: '如实汇报雨天影响',
        feedback: '甲方表示理解，说会在工期上适当考虑。',
        effects: {
          reputation: 3,
          relationships: [
            { type: 'client', change: 2 }
          ]
        }
      },
      {
        id: 'int_004_opt_b',
        text: '承诺会加班赶工期',
        feedback: '甲方很满意，但你不知道这个承诺怎么兑现，压力很大。',
        effects: {
          reputation: 5,
          health: -5
        }
      },
      {
        id: 'int_004_opt_c',
        text: '推说需要项目经理汇报',
        feedback: '甲方让你找项目经理说话，但你在中间夹着不是滋味。',
        effects: {
          reputation: -1
        }
      }
    ]
  },

  {
    id: 'int_005_prof',
    title: '安全隐患',
    description: '你发现工地上几个工人没戴安全帽，按理说应该制止，但都是老工人，怕得罪人。',
    category: 'professional',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_005_opt_a',
        text: '友好提醒，说明安全重要性',
        feedback: '工人们接受了你的建议，觉得你这个小实习生还挺会说话。',
        effects: {
          reputation: 3,
          health: 1,
          relationships: [
            { type: 'labor', change: 2 }
          ]
        }
      },
      {
        id: 'int_005_opt_b',
        text: '向安全员报告',
        feedback: '安全员批评了工人，他们知道是你举报的，对你的态度变差了。',
        effects: {
          reputation: 1,
          relationships: [
            { type: 'labor', change: -5 }
          ]
        }
      },
      {
        id: 'int_005_opt_c',
        text: '装作没看见',
        feedback: '你选择了明哲保身，但万一出事你会很内疚。',
        effects: {
          reputation: -2,
          health: -1
        }
      }
    ]
  },

  // 职场型事件 (5个)
  {
    id: 'int_001_work',
    title: '办公室琐事',
    description: '带教工程师让你帮忙复印材料，但这本来是行政的工作。你觉得自己是来学技术的，不是来打杂的。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_001_opt_a',
        text: '欣然接受，复印时顺便学习材料内容',
        feedback: '带教工程师很满意，觉得你态度端正，愿意多教你一些东西。',
        effects: {
          reputation: 4,
          progress: 3
        }
      },
      {
        id: 'int_001_opt_b',
        text: '答应但面露难色',
        feedback: '带教工程师看出了你的不情愿，觉得你有些眼高手低。',
        effects: {
          reputation: -2
        }
      },
      {
        id: 'int_001_opt_c',
        text: '婉拒说在忙别的事',
        feedback: '带教工程师没说什么，但后来对你的态度冷淡了些。',
        effects: {
          reputation: -3,
          relationships: []  // 可以添加特定关系影响
        }
      }
    ]
  },

  {
    id: 'int_002_work',
    title: '前辈指导',
    description: '一位老工程师主动来指导你的工作，但他的方法比较过时，和你在学校学的有些冲突。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_002_opt_a',
        text: '虚心学习，但私下思考差异',
        feedback: '老工程师很高兴，你也在对比中学到了实践经验。',
        effects: {
          reputation: 4,
          progress: 3,
          quality: 2
        }
      },
      {
        id: 'int_002_opt_b',
        text: '委婉提出新方法',
        feedback: '老工程师有些不快，说你有想法是好事，但要多听多看。',
        effects: {
          reputation: 1,
          health: 1
        }
      },
      {
        id: 'int_002_opt_c',
        text: '直接按学校学的做',
        feedback: '老工程师摇摇头走了，你失去了一个学习经验的机会。',
        effects: {
          reputation: -2,
          progress: -2
        }
      }
    ]
  },

  {
    id: 'int_003_work',
    title: '加班文化',
    description: '周五下午5点，大家都准备下班了，带教工程师说有个紧急方案要今天做完，问你能不能一起加班。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_003_opt_a',
        text: '积极加入，展现工作热情',
        feedback: '你们加班到晚上9点，带教工程师请你吃了宵夜，关系拉近了很多。',
        effects: {
          reputation: 5,
          health: -3,
          cash: 200  // 加班餐补
        }
      },
      {
        id: 'int_003_opt_b',
        text: '说自己有安排，但可以明天早点来',
        feedback: '带教工程师表示理解，但你感觉他有点失望。',
        effects: {
          reputation: -1,
          health: 1
        }
      },
      {
        id: 'int_003_opt_c',
        text: '直接拒绝说已经约了人',
        feedback: '你准时下班了，但后来发现其他实习生都留下了...',
        effects: {
          reputation: -3,
          health: 2
        }
      }
    ]
  },

  {
    id: 'int_004_work',
    title: '食堂偶遇',
    description: '在食堂排队时，你听到项目经理在和别人讨论公司的发展前景。这个话题你很感兴趣，但插话似乎不太合适。',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_004_opt_a',
        text: '安静地在一旁听',
        feedback: '你听到了一些有用的信息，对公司的方向有了更多了解。',
        effects: {
          progress: 3,
          health: 1
        }
      },
      {
        id: 'int_004_opt_b',
        text: '找个机会搭话请教',
        feedback: '项目经理和你聊了几句，对你的主动留下了印象。',
        effects: {
          reputation: 3,
          relationships: [
            // 如果有项目经理关系类型
          ]
        }
      },
      {
        id: 'int_004_opt_c',
        text: '换个位置，避免尴尬',
        feedback: '你避开了，但也失去了交流的机会。',
        effects: {
          // 无影响
        }
      }
    ]
  },

  {
    id: 'int_005_work',
    title: '团建活动',
    description: '部门组织周末去爬山团建，但你本来计划周末回家看父母。团建不是强制的，但不去会不会不好？',
    category: 'workplace',
    requiredRank: Rank.INTERN,
    options: [
      {
        id: 'int_005_opt_a',
        text: '参加团建，和同事多交流',
        feedback: '你在爬山中和同事们增进了了解，回来后工作配合更默契了。',
        effects: {
          reputation: 4,
          health: 3,
          relationships: [
            { type: 'labor', change: 2 }
          ],
          cash: -500  // 团建费用分摊
        }
      },
      {
        id: 'int_005_opt_b',
        text: '向带教工程师说明情况',
        feedback: '带教工程师表示理解，让你多在群里发言保持存在感。',
        effects: {
          reputation: 1,
          health: 1  // 回家休息
        }
      },
      {
        id: 'int_005_opt_c',
        text: '找借口说不去',
        feedback: '你的借口很拙劣，大家都能看出来，但也没说什么。',
        effects: {
          reputation: -2,
          health: 1
        }
      }
    ]
  }
];
```

**Step 2: 更新 index.ts 导入实习生事件**

修改 `frontend/src/data/events/index.ts`：

```typescript
import { internEvents } from './internEvents';

// 并在函数中已有逻辑会自动包含
```

**Step 3: 验证编译**

Run: `cd frontend && npm run build`
Expected: 编译成功

**Step 4: 提交**

```bash
cd frontend
git add src/data/events/
git commit -m "feat(events): add 10 intern events (5 professional + 5 workplace)"
```

---

## Task 10: 测试事件系统基本流程

**Step 1: 启动开发服务器**

Run: `cd frontend && npm run dev`

**Step 2: 手动测试流程**

测试步骤：
1. 开始新游戏（实习生职级）
2. 进入"事件"tab
3. 验证进度条显示 "1/2" 或 "1/3" 或 "1/4"
4. 验证事件卡片正确显示
5. 点击一个选项
6. 验证结果卡片显示正确的反馈和影响
7. 点击"继续"按钮
8. 验证下一个事件出现
9. 重复直到所有事件完成
10. 验证"本季度事件已全部处理完成"提示
11. 验证"完成本季度"按钮可点击

**Step 3: 检查浏览器控制台**

- 确认没有错误
- 检查事件数据正确加载
- 检查状态更新正确

**Step 4: 修复发现的问题**

如果发现问题，记录并修复。如果是小问题直接修复，如果是设计问题需要调整方案。

**Step 5: 提交测试修复**

```bash
cd frontend
git add -A
git commit -m "fix(events): fix issues found in basic event flow testing"
```

---

## 完成检查清单

- [ ] 事件类型定义完整
- [ ] 事件池管理逻辑正确
- [ ] gameStoreNew 状态扩展完成
- [ ] 事件初始化在 nextQuarter 中正确调用
- [ ] EventCard 组件正确显示
- [ ] EventResultCard 组件正确显示影响
- [ ] EventsPage 集成新事件系统
- [ ] 至少创建10个实习生事件
- [ ] 基本流程测试通过
- [ ] 浏览器控制台无错误

---

## 后续步骤

完成 MVP 后，可以继续添加：
1. 其他职级的事件（助理工程师、工程师等）
2. 通用事件池
3. EventHistoryItem 可展开组件
4. 更多事件影响属性（团队士气、领导力等）
5. 事件联动机制（前一个事件影响后续事件）

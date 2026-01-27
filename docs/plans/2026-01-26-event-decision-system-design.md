# 事件决策系统设计方案

## 概述

构建一个季度制的叙事决策系统，每季度随机抽取 2-4 个事件，玩家必须完成所有事件的选择决策才能进入下一季度。每个事件有 3 个选项，采用"得失权衡"设计，玩家根据当前资源状况做出最优决策。

**数据流向**：
```
新季度开始 → 随机抽取事件 → 逐个展示 → 玩家选择 → 显示结果卡片 → 应用影响 → 下一个事件 → 全部完成 → 解锁"完成本季度"按钮
```

---

## 一、整体架构

### 文件结构

```
frontend/src/data/events/
  ├── index.ts                    # 导出所有事件
  ├── eventTypes.ts               # 事件类型定义
  ├── commonEvents.ts             # 通用事件（所有职级共享）
  ├── internEvents.ts             # 实习生事件 (10个)
  ├── assistantEngineerEvents.ts  # 助理工程师事件 (10个)
  ├── engineerEvents.ts           # 工程师事件 (10个)
  ├── seniorEngineerEvents.ts     # 高级工程师事件 (10个)
  ├── managerEvents.ts            # 项目经理事件 (10个)
  ├── directorEvents.ts           # 项目总监事件 (10个)
  └── partnerEvents.ts            # 合伙人事件 (10个)
```

### 状态管理扩展

在 `gameStoreNew.ts` 中添加：

```typescript
interface GameStore {
  // 事件系统
  quarterEvents: DecisionEvent[];        // 本季度待处理事件
  currentEventIndex: number;             // 当前事件索引
  completedEventResults: EventResult[];  // 本季度已完成事件结果
  allEventHistory: EventResult[];        // 全局事件历史
  pendingEventResult: EventResult | null; // 待确认的结果
  showEventResult: boolean;             // 是否显示结果卡片

  // Actions
  initializeQuarterEvents: () => void;
  selectEventOption: (optionId: string) => void;
  continueToNextEvent: () => void;
  isAllEventsCompleted: () => boolean;
}
```

---

## 二、数据结构

### 事件类型定义

```typescript
// frontend/src/data/events/eventTypes.ts

export interface DecisionEvent {
  id: string;
  title: string;
  description: string;
  category: 'professional' | 'workplace';  // 专业型 / 职场型
  requiredRank: Rank;                       // 最低职级要求
  options: DecisionOption[];
  flavorText?: string;                      // 背景描述文字（可选）
}

export interface DecisionOption {
  id: string;
  text: string;           // 选项描述（不显示数值）
  feedback: string;       // 选择后的简短反馈
  effects: EventEffects;  // 具体的影响数值
}

export interface EventEffects {
  cash?: number;
  health?: number;
  reputation?: number;
  progress?: number;      // 项目进度
  quality?: number;       // 项目质量
  relationships?: {
    type: RelationshipType;
    change: number;
  }[];
  teamMorale?: number;    // 团队士气（后期）
  leadership?: number;    // 领导力（后期）
}

export interface EventResult {
  eventId: string;
  eventTitle: string;
  selectedOptionId: string;
  selectedOptionText: string;
  feedback: string;
  effects: EventEffects;
  timestamp: number;
}
```

### 事件示例

```typescript
{
  id: 'int_001',
  title: '工地上的失误',
  description: '你在检查工地时发现一处钢筋绑扎不符合规范，如果不及时处理可能会影响结构安全。但是指出这个问题会让施工队很没面子。',
  category: 'professional',
  requiredRank: Rank.INTERN,
  options: [
    {
      id: 'opt_a',
      text: '立即要求返工，坚持规范标准',
      feedback: '你坚持原则，施工队虽然不满但最终还是返工了。监理对你的认真态度表示认可。',
      effects: {
        reputation: 5,
        health: -2,
        relationships: [
          { type: RelationshipType.LABOR, change: -5 },
          { type: RelationshipType.SUPERVISION, change: 3 }
        ]
      }
    },
    {
      id: 'opt_b',
      text: '私下找工头协商，提出折中方案',
      feedback: '你用灵活的方式解决了问题，工头 appreciative 你的理解，监理也没有深究。',
      effects: {
        reputation: 2,
        relationships: [
          { type: RelationshipType.LABOR, change: 3 }
        ]
      }
    },
    {
      id: 'opt_c',
      text: '默不作声，当作没看见',
      feedback: '你选择了沉默，虽然避免了冲突，但心里总觉得不安。结构安全无小事...',
      effects: {
        reputation: -3,
        health: 2
      }
    }
  ]
}
```

### 事件抽取逻辑

```typescript
// 在 gameStoreNew.ts 中的 nextQuarter() 方法中

// 1. 获取当前职级可用的所有事件
function getEventsForRank(rank: Rank): DecisionEvent[] {
  const events = [
    ...COMMON_EVENTS,           // 通用事件
    ...getRankSpecificEvents(rank)  // 职级专属事件
  ];
  return events.filter(e => e.requiredRank <= rank);
}

// 2. 随机抽取 2-4 个不重复事件
function shuffleQuarterEvents(availableEvents: DecisionEvent[]): DecisionEvent[] {
  const eventCount = Math.floor(Math.random() * 3) + 2; // 2-4个
  const shuffled = [...availableEvents].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, eventCount);
}
```

---

## 三、UI组件设计

### EventsPage 页面结构

```tsx
<div className="min-h-screen bg-slate-50 pb-20 pt-40">
  {/* 顶部状态栏 */}
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold">第 {currentQuarter} 季度</h1>
    <span className="text-sm">行动点: {actionPoints}/{maxActionPoints}</span>
  </div>

  {/* 进度指示器 */}
  {quarterEvents.length > 0 && (
    <div className="mb-6 bg-white rounded-xl p-3 border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">本季度事件进度</span>
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

  {/* 当前事件卡片 */}
  {currentEvent && !showResult && <EventCard event={currentEvent} onSelectOption={handleSelectOption} />}

  {/* 结果卡片 */}
  {showResult && currentResult && <EventResultCard result={currentResult} onContinue={handleContinue} />}

  {/* 全部完成提示 */}
  {allEventsCompleted && (
    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6 text-center mb-6">
      <div className="text-4xl mb-3">🎉</div>
      <h3 className="text-lg font-bold text-emerald-800 mb-2">本季度事件已全部处理完成！</h3>
      <p className="text-sm text-emerald-700">你可以继续使用行动点，或直接完成本季度</p>
    </div>
  )}

  {/* 完成本季度按钮 */}
  {allEventsCompleted && <button onClick={handleFinishQuarter}>完成本季度</button>}
</div>
```

### EventCard 组件

```tsx
<div className="bg-gradient-to-br from-brand-50 to-engineering-50 border-2 border-brand-200 rounded-xl p-5">
  {/* 事件类别标签 */}
  <div className="flex items-center justify-between mb-3">
    <span className={`text-xs px-2 py-1 rounded-full ${
      event.category === 'professional'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-purple-100 text-purple-700'
    }`}>
      {event.category === 'professional' ? '🔧 专业问题' : '💼 职场博弈'}
    </span>
  </div>

  {/* 事件标题和描述 */}
  <h3 className="font-bold text-lg mb-2">{event.title}</h3>
  <p className="text-sm text-slate-700 mb-4">{event.description}</p>

  {/* 背景描述（可选） */}
  {event.flavorText && <p className="text-xs text-slate-500 italic mb-4">{event.flavorText}</p>}

  {/* 三个选项 */}
  <div className="space-y-2">
    {event.options.map((option) => (
      <button
        key={option.id}
        onClick={() => onSelectOption(option.id)}
        className="w-full py-3 px-4 bg-white border-2 border-slate-200 rounded-lg hover:border-brand-400 hover:bg-brand-50 transition-all text-left"
      >
        <div className="font-medium text-slate-900">{option.text}</div>
      </button>
    ))}
  </div>
</div>
```

### EventResultCard 组件

```tsx
<div className="bg-white border-2 border-brand-200 rounded-xl p-5">
  {/* 结果标题 */}
  <div className="flex items-center gap-2 mb-3">
    <span className="text-2xl">📋</span>
    <h3 className="font-bold text-lg">决策结果</h3>
  </div>

  {/* 选择的选项 */}
  <div className="bg-slate-50 rounded-lg p-3 mb-4">
    <div className="text-xs text-slate-500 mb-1">你的选择</div>
    <div className="font-medium text-slate-900">{result.selectedOptionText}</div>
  </div>

  {/* 反馈文字 */}
  <p className="text-sm text-slate-700 mb-4">{result.feedback}</p>

  {/* 影响列表 */}
  <div className="space-y-2 mb-4">
    <div className="text-xs text-slate-500 mb-2">影响详情</div>
    {result.effects.cash !== undefined && renderEffectItem('💰 现金', result.effects.cash)}
    {result.effects.health !== undefined && renderEffectItem('❤️ 健康', result.effects.health)}
    {result.effects.reputation !== undefined && renderEffectItem('⭐ 声誉', result.effects.reputation)}
    {result.effects.progress !== undefined && renderEffectItem('📈 进度', result.effects.progress)}
    {result.effects.quality !== undefined && renderEffectItem('📊 质量', result.effects.quality)}

    {/* 关系影响 - 明确显示具体关系 */}
    {result.effects.relationships?.map(rel => {
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
  </div>

  {/* 继续按钮 */}
  <button
    onClick={onContinue}
    className="w-full py-3 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600 transition-all"
  >
    继续 →
  </button>
</div>
```

### 事件历史展示（可展开模式）

```tsx
<section className="mb-6">
  <h2 className="text-lg font-bold mb-3">事件历史 ({eventHistory.length})</h2>

  <div className="space-y-3">
    {eventHistory.slice().reverse().map((result, index) => (
      <EventHistoryItem
        key={result.id}
        result={result}
        index={eventHistory.length - index}
      />
    ))}
  </div>
</section>

// EventHistoryItem 组件
<div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
  {/* 默认展开的简洁视图 */}
  <div className="p-4 cursor-pointer" onClick={() => toggleExpand()}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">#{index}</span>
        <span className="font-medium">{result.eventTitle}</span>
      </div>
      <span className="text-sm text-slate-400">{isExpanded ? '▼' : '▶'}</span>
    </div>
  </div>

  {/* 展开的详细视图 */}
  {isExpanded && (
    <div className="p-4 pt-0 border-t border-slate-100">
      <p className="text-sm text-slate-600 mb-2">{event?.description}</p>

      <div className="bg-slate-50 rounded p-2 mb-2">
        <div className="text-xs text-slate-500">你的选择</div>
        <div className="text-sm">{result.selectedOptionText}</div>
      </div>

      <p className="text-xs text-slate-600 mb-2">{result.feedback}</p>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {renderEffectBadge('💰', result.effects.cash)}
        {renderEffectBadge('❤️', result.effects.health)}
        {renderEffectBadge('⭐', result.effects.reputation)}
        {/* ...其他影响 */}
      </div>
    </div>
  )}
</div>
```

---

## 四、状态管理实现

### 初始化季度事件

```typescript
initializeQuarterEvents: () => {
  const state = get();
  const rank = state.rank;

  // 获取当前职级可用的事件
  const availableEvents = getEventsForRank(rank);

  // 随机抽取 2-4 个
  const eventCount = Math.floor(Math.random() * 3) + 2;
  const shuffled = [...availableEvents].sort(() => Math.random() - 0.5);
  const selectedEvents = shuffled.slice(0, eventCount);

  set({
    quarterEvents: selectedEvents,
    currentEventIndex: 0,
    completedEventResults: [],
  });
}
```

### 选择事件选项

```typescript
selectEventOption: (optionId: string) => {
  const state = get();
  const currentEvent = state.quarterEvents[state.currentEventIndex];
  const selectedOption = currentEvent.options.find(o => o.id === optionId);

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

  // 暂存结果，等待玩家确认
  set({
    pendingEventResult: result,
    showEventResult: true,
  });
}
```

### 继续下一个事件

```typescript
continueToNextEvent: () => {
  const state = get();

  // 应用当前事件的影响
  applyEventEffects(state.pendingEventResult.effects);

  // 添加到已完成列表
  const newCompleted = [...state.completedEventResults, state.pendingEventResult];
  const newIndex = state.currentEventIndex + 1;

  // 检查是否还有更多事件
  if (newIndex < state.quarterEvents.length) {
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
      quarterEvents: [],
      pendingEventResult: null,
      showEventResult: false,
    });
  }
}
```

### nextQuarter() 修改

```typescript
nextQuarter: () => {
  // ... 现有的季度开始逻辑 ...

  // 初始化本季度事件
  get().initializeQuarterEvents();

  // ... 其他逻辑 ...
}
```

---

## 五、事件平衡性设计

### 数值影响范围指南

| 属性 | 小影响 | 中等影响 | 大影响 |
|------|--------|----------|--------|
| 现金 | ±1,000-3,000 | ±3,000-8,000 | ±8,000-15,000 |
| 健康 | ±1-2 | ±3-5 | ±6-10 |
| 声誉 | ±1-3 | ±4-7 | ±8-15 |
| 进度/质量 | ±2-5 | ±6-12 | ±13-20 |
| 关系值 | ±1-3 | ±4-8 | ±9-15 |

### 平衡原则

1. **得失相当**：如果一个选项给很多现金（+10000），必然在其他方面有损失（声誉-5 或健康-3）
2. **风险回报**：高风险选项应该有潜在高回报，但也有失败概率
3. **职级适配**：实习生时期的影响要小一些，高职级的影响可以更大
4. **避免极端**：单一选项的影响不应导致游戏立即失败或获胜

### MVP 事件列表建议

**实习生 (10个)**：
- 专业型：工地失误、图纸疑问、材料验收、施工延误、安全隐患
- 职场型：办公室琐事、前辈指导、加班文化、食堂偶遇、团建活动

**助理工程师 (10个)**：
- 专业型：方案变更、质量争议、进度协调、技术交底、成本控制
- 职场型：甲方沟通、监理关系、跨部门协作、新人带教、晋升机会

**工程师 (10个)**：
- 专业型：设计优化、工期压缩、预算超支、技术难题、验收准备
- 职场型：团队冲突、客户投诉、绩效考核、培训机会、行业交流

**高级工程师 (10个)**：
- 专业型：重大项目决策、技术方案评审、危机处理、创新提案、标准制定
- 职场型：晋升竞争、下属培养、部门协调、资源争取、声誉建立

**项目经理 (10个)**：
- 专业型：项目投标、合同谈判、风险管理、成本控制、质量保证
- 职场型：团队建设、客户关系、资源分配、绩效考核、向上管理

**项目总监 (10个)**：
- 专业型：战略规划、多项目协调、重大决策、风险管控、业务拓展
- 职场型：高管沟通、团队激励、危机公关、资源调配、组织变革

**合伙人 (10个)**：
- 专业型：公司战略、重大投资、业务转型、创新方向、风险决策
- 职场型：股权分配、高管团队、行业影响、资源整合、企业文化

---

## 六、实现步骤

### Phase 1: 数据结构搭建
1. 创建 `frontend/src/data/events/` 目录
2. 定义类型文件 `eventTypes.ts`
3. 创建各职级事件文件（先留空，写好注释）
4. 在 `index.ts` 中导出所有内容

### Phase 2: 状态管理
1. 扩展 `gameStoreNew.ts` 添加事件相关状态和方法
2. 实现 `initializeQuarterEvents`
3. 实现 `selectEventOption` 和 `continueToNextEvent`
4. 修改 `nextQuarter` 集成事件初始化

### Phase 3: UI 组件
1. 创建 `EventCard` 组件
2. 创建 `EventResultCard` 组件
3. 创建 `EventHistoryItem` 组件
4. 更新 `EventsPage.tsx` 集成所有组件

### Phase 4: 事件内容创作
1. 从实习生事件开始（10个）
2. 每个职级逐步添加
3. 测试数值平衡
4. 补充通用事件池

### Phase 5: 测试与迭代
1. 玩一整周游戏，测试事件体验
2. 调整数值平衡
3. 补充边缘情况处理

---

## 七、关键设计决策总结

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 事件数量 | 每季度 2-4 个（随机） | 平衡节奏和内容消耗 |
| 职级影响 | 职级解锁机制 | 升级时有解锁新事件的成就感 |
| 事件类型 | 平衡型（专业+职场） | 游戏内容更丰富 |
| 触发方式 | 季度初序列式触发 | 流程清晰，便于设计联动 |
| 选项设计 | 得失权衡型 | 每个选项都有合理性 |
| 反馈方式 | 混合式（结果卡片） | 清晰展示影响，不打断节奏 |
| 进度显示 | 顶部进度条 | 直观了解完成进度 |
| 历史展示 | 可展开模式 | 默认简洁，需要时查看详情 |
| 文件组织 | 按职级分文件 | 便于维护和扩展 |

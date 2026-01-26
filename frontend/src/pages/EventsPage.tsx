import { useNavigate } from 'react-router-dom';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { GameStatus } from '@shared/types';
import { EventCard } from '@/components/EventCard';
import { EventResultCard } from '@/components/EventResultCard';

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

  const handleFinishQuarter = () => {
    if (actionPoints > 0 && actionPoints < maxActionPoints) {
      if (!confirm(`还有 ${actionPoints} 点行动点未使用，确定要完成本季度吗？`)) {
        return;
      }
    }
    finishQuarter();
    navigate('/game-new/settlement');
  };

  const handleNextQuarter = () => {
    nextQuarter();
    navigate('/game-new/actions');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-40">
      <div className="max-w-md mx-auto px-4">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
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

        {/* 保留旧的事件显示（兼容性）- 仅在没有新事件时显示 */}
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

        {/* 事件历史 */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            事件历史 ({eventHistory.length})
          </h2>

          {eventHistory.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
              <p className="text-slate-500">暂无事件记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventHistory.slice().reverse().map((event, index) => (
                <div
                  key={`${event.id}-${index}`}
                  className="bg-white rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">
                      #{eventHistory.length - index}
                    </span>
                    <span className="text-xs text-slate-400">
                      {event.options && event.options.length > 0 ? '事件' : '特殊'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{event.description}</p>

                  {/* 选择的选项 */}
                  {event.options && event.options.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      <div className="text-xs text-slate-500 mb-1">选项数: {event.options.length}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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

        {/* 下一季度按钮（结算后显示） */}
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

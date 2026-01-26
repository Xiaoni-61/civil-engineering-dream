import { useNavigate } from 'react-router-dom';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { GameStatus } from '@shared/types';

export function EventsPage() {
  const navigate = useNavigate();
  const eventHistory = useGameStoreNew((state) => state.eventHistory);
  const currentEvent = useGameStoreNew((state) => state.currentEvent);
  const status = useGameStoreNew((state) => state.status);
  const selectOption = useGameStoreNew((state) => state.selectOption);
  const actionPoints = useGameStoreNew((state) => state.actionPoints);
  const maxActionPoints = useGameStoreNew((state) => state.maxActionPoints);
  const finishQuarter = useGameStoreNew((state) => state.finishQuarter);
  const nextQuarter = useGameStoreNew((state) => state.nextQuarter);
  const currentQuarter = useGameStoreNew((state) => state.currentQuarter);

  const handleSelectOption = (optionId: string) => {
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

        {/* 当前事件 */}
        {status === GameStatus.PLAYING && currentEvent && (
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
                      onClick={() => handleSelectOption(option.id)}
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

        {/* 完成本季度按钮 */}
        {status === GameStatus.PLAYING && (
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

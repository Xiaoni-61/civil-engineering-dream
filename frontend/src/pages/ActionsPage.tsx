import { useNavigate } from 'react-router-dom';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { ACTIONS } from '@/data/constants';
import { ActionType, Rank, GameStatus } from '@shared/types';
import { TrainingActionCard } from '@/components/TrainingActionCard';

export function ActionsPage() {
  const navigate = useNavigate();
  const currentQuarter = useGameStoreNew((state) => state.currentQuarter);
  const actionPoints = useGameStoreNew((state) => state.actionPoints);
  const maxActionPoints = useGameStoreNew((state) => state.maxActionPoints);
  const stats = useGameStoreNew((state) => state.stats);
  const rank = useGameStoreNew((state) => state.rank);
  const doAction = useGameStoreNew((state) => state.doAction);
  const finishQuarter = useGameStoreNew((state) => state.finishQuarter);
  const currentEvent = useGameStoreNew((state) => state.currentEvent);
  const status = useGameStoreNew((state) => state.status);
  const selectOption = useGameStoreNew((state) => state.selectOption);

  const isLateGame = rank === Rank.PROJECT_MANAGER ||
                     rank === Rank.PROJECT_DIRECTOR ||
                     rank === Rank.PARTNER;

  const availableActions = Object.values(ACTIONS).filter(action => {
    if (action.phase === 'late') return isLateGame;
    if (action.phase === 'early') return !isLateGame;
    return true;
  });

  const handleAction = (actionType: ActionType) => {
    if (actionPoints <= 0) {
      alert('行动点已用完，请点击"完成本季度"进入结算');
      return;
    }

    const result = doAction(actionType);

    if (!result.success) {
      alert(result.message);
      return;
    }

    // 行动成功，检查事件触发
    // 事件通过 checkEventTrigger 自动触发
    // 如果有事件，会在状态中显示
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

  const handleSelectOption = (optionId: string) => {
    selectOption(optionId);
  };

  const canAfford = (cost?: number) => {
    return cost === undefined || stats.cash >= cost;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-40">
      <div className="max-w-md mx-auto px-4">
        {/* 季度和状态信息 */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            第 {currentQuarter} 季度
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-800">
            <span>⚡ 行动点：{actionPoints}/{maxActionPoints}</span>
            <span>❤️ 健康：{stats.health}/100</span>
          </div>
        </div>

        {/* 当前事件卡片 */}
        {status === GameStatus.PLAYING && currentEvent && (
          <div className="mb-6 bg-gradient-to-br from-brand-50 to-engineering-50 border-2 border-brand-200 rounded-xl p-5">
            <h2 className="text-lg font-bold text-slate-900 mb-2">{currentEvent.title}</h2>
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
        )}

        {/* 基础行动 */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">基础行动</h2>
          <div className="grid grid-cols-2 gap-3">
            {availableActions
              .filter(a => [ActionType.DO_PROJECT, ActionType.TRAINING, ActionType.REST].includes(a.type))
              .map((action) => {
                const affordable = canAfford(action.costCash);
                const hasEnoughAP = actionPoints > 0;

                return (
                  <button
                    key={action.type}
                    onClick={() => handleAction(action.type)}
                    disabled={!hasEnoughAP || !affordable}
                    className={`
                      p-4 rounded-xl border-2 transition-all
                      ${hasEnoughAP && affordable
                        ? 'border-brand-200 bg-white hover:border-brand-400 hover:shadow-md active:scale-[0.98]'
                        : 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{action.icon}</div>
                    <div className="font-bold text-slate-900">{action.name}</div>
                    {action.costCash && (
                      <div className={`text-sm ${affordable ? 'text-slate-600' : 'text-red-600'}`}>
                        💰 {action.costCash.toLocaleString()}
                      </div>
                    )}
                    {action.effects && (
                      <div className="text-xs text-slate-500 mt-1">
                        {action.effects.health !== undefined && (
                          <span className={action.effects.health > 0 ? 'text-green-600' : 'text-red-600'}>
                            ❤️ {action.effects.health > 0 ? '+' : ''}{action.effects.health}
                          </span>
                        )}
                        {action.effects.progress && (
                          <span className="text-brand-600 ml-2">
                            📈 +{action.effects.progress}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        </section>

        {/* 属性训练 */}
        <section className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">属性训练</h2>
          <div className="grid grid-cols-2 gap-3">
            <TrainingActionCard trainingType="basic_work" />
            <TrainingActionCard trainingType="advanced_work" />
            <TrainingActionCard trainingType="basic_luck" />
            <TrainingActionCard trainingType="advanced_luck" />
          </div>
        </section>

        {/* 团队行动（后期） */}
        {isLateGame && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">团队行动</h2>
            <div className="grid grid-cols-2 gap-3">
              {availableActions
                .filter(a => [ActionType.RECRUIT, ActionType.TEAM_PROJECT, ActionType.RESOLVE_ISSUE].includes(a.type))
                .map((action) => {
                  const hasEnoughAP = actionPoints > 0;

                  return (
                    <button
                      key={action.type}
                      onClick={() => handleAction(action.type)}
                      disabled={!hasEnoughAP}
                      className={`
                        p-4 rounded-xl border-2 transition-all
                        ${hasEnoughAP
                          ? 'border-purple-200 bg-white hover:border-purple-400 hover:shadow-md active:scale-[0.98]'
                          : 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                        }
                      `}
                    >
                      <div className="text-2xl mb-1">{action.icon}</div>
                      <div className="font-bold text-slate-900">{action.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{action.description}</div>
                    </button>
                  );
                })}
            </div>
          </section>
        )}

        {/* 完成本季度按钮 */}
        <div className="mt-8">
          <button
            onClick={handleFinishQuarter}
            className="w-full py-4 px-6 bg-gradient-to-r from-brand-600 to-brand-700 text-slate-800 font-bold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] border-2 border-brand-800"
          >
            完成本季度
          </button>
        </div>
      </div>
    </div>
  );
}

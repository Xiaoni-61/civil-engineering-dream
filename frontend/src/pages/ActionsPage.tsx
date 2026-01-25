import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { ACTIONS } from '@/data/constants';
import { ActionType, Rank } from '@shared/types';

export function ActionsPage() {
  const navigate = useNavigate();
  const currentQuarter = useGameStore((state) => state.currentQuarter);
  const actionPoints = useGameStore((state) => state.actionPoints);
  const maxActionPoints = useGameStore((state) => state.maxActionPoints);
  const stats = useGameStore((state) => state.stats);
  const rank = useGameStore((state) => state.rank);
  // TODO: 迁移到 gameStoreNew.ts 后启用
  // const doAction = useGameStore((state) => state.doAction);
  // const finishQuarter = useGameStore((state) => state.finishQuarter);

  const isLateGame = rank === Rank.PROJECT_MANAGER ||
                     rank === Rank.PROJECT_DIRECTOR ||
                     rank === Rank.PARTNER;

  const availableActions = Object.values(ACTIONS).filter(action => {
    if (action.phase === 'late') return isLateGame;
    if (action.phase === 'early') return !isLateGame;
    return true;
  });

  const handleAction = (_actionType: ActionType) => {
    // TODO: 迁移到 gameStoreNew.ts 后启用
    alert('行动系统正在开发中，请等待完整实现');

    /* 完整实现逻辑：
    if (actionPoints <= 0) {
      alert('行动点已用完，将进入季度结算');
      return;
    }

    const result = doAction(actionType);
    if (result.success) {
      // 检查是否行动点归零
      const newActionPoints = useGameStore.getState().actionPoints;
      if (newActionPoints <= 0) {
        finishQuarter();
        navigate('/settlement');
      }
    }
    */
  };

  const handleFinishQuarter = () => {
    // TODO: 迁移到 gameStoreNew.ts 后启用
    alert('完成季度功能正在开发中');
    // finishQuarter();
    // navigate('/settlement');
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
          <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
            <span>⚡ 行动点：{actionPoints}/{maxActionPoints}</span>
            <span>❤️ 健康：{stats.health}/100</span>
          </div>
        </div>

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
            className="w-full py-3 px-6 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            完成本季度
          </button>
        </div>
      </div>
    </div>
  );
}

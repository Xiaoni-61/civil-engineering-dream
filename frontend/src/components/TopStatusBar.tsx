import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { RANK_CONFIGS } from '@shared/types';

export function TopStatusBar() {
  const stats = useGameStoreNew((state) => state.stats);
  const rank = useGameStoreNew((state) => state.rank);
  const actualSalary = useGameStoreNew((state) => state.actualSalary);
  const actionPoints = useGameStoreNew((state) => state.actionPoints);
  const maxActionPoints = useGameStoreNew((state) => state.maxActionPoints);

  const rankConfig = RANK_CONFIGS[rank];
  const hasRaise = actualSalary > rankConfig.minQuarterlySalary;

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-brand-50 to-engineering-50 border-b border-slate-200 z-40">
      <div className="max-w-md mx-auto px-4 py-2">
        {/* 职级和工资 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
            <span className="text-sm">👔</span>
            <span className="text-sm font-bold text-amber-900">{rankConfig.name}</span>
            {hasRaise && (
              <>
                <span className="text-xs text-amber-700">📈</span>
                <span className="text-xs text-slate-500">
                  ({rankConfig.minQuarterlySalary})
                </span>
              </>
            )}
          </div>
          <div className="px-2 py-1 bg-white rounded-lg border border-slate-200">
            <span className={`text-sm font-bold ${actualSalary >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {actualSalary >= 0 ? '+' : ''}{actualSalary.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 核心数值 */}
        <div className="flex items-center gap-2">
          {/* 现金 */}
          <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">💰 现金</span>
              <span className={`text-sm font-bold ${stats.cash < 10000 ? 'text-red-600' : 'text-slate-900'}`}>
                {(stats.cash / 10000).toFixed(1)}万
              </span>
            </div>
          </div>

          {/* 健康 */}
          <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">❤️ 健康</span>
              <span className={`text-sm font-bold ${stats.health < 30 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats.health}
              </span>
            </div>
            <div className="mt-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  stats.health < 30 ? 'bg-red-500' : stats.health < 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${stats.health}%` }}
              />
            </div>
          </div>

          {/* 声誉 */}
          <div className="flex-1 bg-white rounded-lg p-2 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">⭐ 声誉</span>
              <span className={`text-sm font-bold ${stats.reputation < 30 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats.reputation}
              </span>
            </div>
            <div className="mt-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  stats.reputation < 30 ? 'bg-red-500' : stats.reputation < 60 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${stats.reputation}%` }}
              />
            </div>
          </div>
        </div>

        {/* 行动点 */}
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg p-2 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-800">⚡ 行动点</span>
              <span className="text-lg font-bold text-slate-800">
                {actionPoints} / {maxActionPoints}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

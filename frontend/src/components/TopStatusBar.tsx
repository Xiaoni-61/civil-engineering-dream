import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { RANK_CONFIGS } from '@shared/types';

export function TopStatusBar() {
  const stats = useGameStoreNew((state) => state.stats);
  const rank = useGameStoreNew((state) => state.rank);
  const actualSalary = useGameStoreNew((state) => state.actualSalary);
  const actionPoints = useGameStoreNew((state) => state.actionPoints);
  const maxActionPoints = useGameStoreNew((state) => state.maxActionPoints);
  const workAbility = useGameStoreNew((state) => state.stats.workAbility);
  const luck = useGameStoreNew((state) => state.stats.luck);
  const pricePredictionBonus = useGameStoreNew((state) => state.pricePredictionBonus);
  const storageFeeDiscount = useGameStoreNew((state) => state.storageFeeDiscount);
  const gameStats = useGameStoreNew((state) => state.gameStats);

  const rankConfig = RANK_CONFIGS[rank];
  const hasRaise = actualSalary > rankConfig.minQuarterlySalary;

  return (
    <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-brand-50 to-engineering-50 border-b border-slate-200 z-40">
      <div className="max-w-md mx-auto px-3 py-1.5">
        {/* 职级和工资 */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded border border-amber-200">
            <span className="text-xs">👔</span>
            <span className="text-xs font-bold text-amber-900">{rankConfig.name}</span>
            {hasRaise && (
              <span className="text-xs text-amber-700">📈</span>
            )}
          </div>
          <div className="px-2 py-0.5 bg-white rounded border border-slate-200">
            <span className={`text-xs font-bold ${actualSalary >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {actualSalary >= 0 ? '+' : ''}{actualSalary.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 核心数值 - 手机端3列布局 */}
        <div className="grid grid-cols-3 gap-1.5 mb-1">
          {/* 现金 */}
          <div className="bg-white rounded px-1.5 py-1 border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-600">💰</span>
              <span className={`text-xs font-bold ${stats.cash < 10000 ? 'text-red-600' : 'text-slate-900'}`}>
                {(stats.cash / 10000).toFixed(1)}万
              </span>
            </div>
          </div>

          {/* 健康 */}
          <div className="bg-white rounded px-1.5 py-1 border border-slate-200">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-slate-600">❤️</span>
              <span className={`text-xs font-bold ${stats.health < 30 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats.health}
              </span>
            </div>
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  stats.health < 30 ? 'bg-red-500' : stats.health < 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${stats.health}%` }}
              />
            </div>
          </div>

          {/* 声誉 */}
          <div className="bg-white rounded px-1.5 py-1 border border-slate-200">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-slate-600">⭐</span>
              <span className={`text-xs font-bold ${stats.reputation < 30 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats.reputation}
              </span>
            </div>
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  stats.reputation < 30 ? 'bg-red-500' : stats.reputation < 60 ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${stats.reputation}%` }}
              />
            </div>
          </div>
        </div>

        {/* 人物属性 - 手机端2列布局 */}
        <div className="grid grid-cols-2 gap-1.5 mb-1">
          {/* 工作能力 */}
          <div className="bg-white rounded px-1.5 py-1 border border-slate-200">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-slate-600">💼 工作能力</span>
              <span className={`text-xs font-bold ${workAbility < 30 ? 'text-red-600' : workAbility >= 70 ? 'text-brand-600' : 'text-slate-900'}`}>
                {workAbility}
              </span>
            </div>
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  workAbility < 30 ? 'bg-red-500' : workAbility < 60 ? 'bg-yellow-500' : 'bg-brand-500'
                }`}
                style={{ width: `${workAbility}%` }}
              />
            </div>
          </div>

          {/* 幸运 */}
          <div className="bg-white rounded px-1.5 py-1 border border-slate-200">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-slate-600">🍀 幸运</span>
              <span className={`text-xs font-bold ${luck < 30 ? 'text-red-600' : luck >= 70 ? 'text-purple-600' : 'text-slate-900'}`}>
                {luck}
              </span>
            </div>
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  luck < 30 ? 'bg-red-500' : luck < 60 ? 'bg-yellow-500' : 'bg-purple-500'
                }`}
                style={{ width: `${luck}%` }}
              />
            </div>
          </div>
        </div>

        {/* 行动点 */}
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded px-2 py-1 text-white">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium">⚡ 行动点</span>
            <span className="text-sm font-bold">
              {actionPoints} / {maxActionPoints}
            </span>
          </div>
        </div>

        {/* 特殊效果提示 - 只在有加成时显示 */}
        {(pricePredictionBonus > 0 || storageFeeDiscount > 0) && (
          <div className="mt-1 bg-gradient-to-r from-purple-50 to-blue-50 rounded px-2 py-1 border border-purple-200 animate-fade-in">
            {pricePredictionBonus > 0 && (
              <div className="text-[10px] text-purple-700 flex items-center gap-1">
                <span>✨</span>
                <span>设计优化方案：预测准确率 +{pricePredictionBonus}%</span>
              </div>
            )}
            {storageFeeDiscount > 0 && (
              <div className="text-[10px] text-blue-700 flex items-center gap-1">
                <span>📖</span>
                <span>政策解读：仓储费 -{storageFeeDiscount}%</span>
              </div>
            )}
          </div>
        )}

        {/* 项目统计 */}
        <div className="mt-1 bg-gradient-to-r from-emerald-50 to-teal-50 rounded px-2 py-1 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-emerald-700 flex items-center gap-1">
              <span>🏗️</span>
              <span>已完成项目/优质</span>
            </div>
            <div className="text-[10px] text-slate-700">
              <span className="font-bold text-slate-900">{gameStats.completedProjects}</span>
              <span className="text-slate-500 mx-0.5">/</span>
              <span className={`font-bold ${gameStats.qualityProjects > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                {gameStats.qualityProjects}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

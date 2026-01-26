import { useNavigate } from 'react-router-dom';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { GameStatus } from '@shared/types';
import { RANK_CONFIGS } from '@shared/types';

export function QuarterlySettlementPage() {
  const navigate = useNavigate();
  const status = useGameStoreNew((state) => state.status);
  const currentSettlement = useGameStoreNew((state) => state.currentSettlement);
  const nextQuarter = useGameStoreNew((state) => state.nextQuarter);
  const executePromotion = useGameStoreNew((state) => state.executePromotion);

  if (!currentSettlement || status !== GameStatus.SETTLEMENT) {
    return null;
  }

  const { promotionCheck, quarterStartEvents } = currentSettlement;
  const extendedSettlement = currentSettlement as any;
  const bonusEvent = extendedSettlement.bonusEvent;
  const disasterEvent = extendedSettlement.disasterEvent;

  const handleNextQuarter = () => {
    // 如果可以晋升，自动晋升
    if (promotionCheck.canPromote && promotionCheck.nextRank) {
      executePromotion(promotionCheck.nextRank);
    }
    nextQuarter();
    navigate('/game-new/actions');
  };

  const canPromote = promotionCheck.canPromote && promotionCheck.nextRank;
  const nextRankConfig = promotionCheck.nextRank ? RANK_CONFIGS[promotionCheck.nextRank] : null;

  // 格式化生活费详情
  const formatLivingCostsBreakdown = () => {
    const salary = currentSettlement.expenses.salary;
    const livingCosts = currentSettlement.expenses.livingCosts;
    const total = salary + livingCosts;
    const salaryPercent = Math.round((salary / total) * 100);
    const livingCostsPercent = Math.round((livingCosts / total) * 100);
    return [
      { label: '季度工资', amount: salary, percent: salaryPercent, color: salary >= 0 ? 'text-emerald-600' : 'text-red-600' },
      { label: '生活费', amount: livingCosts, percent: livingCostsPercent, color: 'text-slate-600' },
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pb-20 pt-40">
      {/* 顶部装饰条 */}
      <div className={`h-1.5 ${
        canPromote
          ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600'
          : 'bg-gradient-to-r from-brand-500 to-brand-600'
      }`}></div>

      <div className="max-w-md mx-auto px-4 py-8">
        {/* 主卡片 */}
        <div className={`bg-white rounded-feishu-lg shadow-feishu-xl overflow-hidden animate-scale-in ${
          canPromote ? 'ring-4 ring-amber-400 ring-opacity-50' : ''
        }`}>
          {/* 顶部状态区域 */}
          <div className={`p-6 text-center ${
            canPromote
              ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-b-2 border-amber-200'
              : 'bg-gradient-to-br from-brand-50 to-engineering-50 border-b-2 border-brand-200'
          }`}>
            <div className="text-6xl mb-3">
              {canPromote ? '🎉' : '📊'}
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${
              canPromote ? 'text-amber-700' : 'text-brand-700'
            }`}>
              {canPromote ? '恭喜晋升！' : `第 ${currentSettlement.quarter} 季度结算`}
            </h1>
            <p className="text-sm text-slate-600">
              {canPromote && nextRankConfig
                ? `成功晋升为 ${nextRankConfig.name}！`
                : '本季度收支情况如下'
              }
            </p>
          </div>

          {/* 季度开始事件 */}
          {quarterStartEvents && quarterStartEvents.length > 0 && (
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                <span className="mr-2">🎬</span>
                季度开始事件
              </h3>
              <div className="space-y-2">
                {quarterStartEvents.map((event, index) => (
                  <div
                    key={`${event.id}-${index}`}
                    className={`p-3 rounded-lg border ${
                      event.isPositive
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${
                        event.isPositive ? 'text-emerald-700' : 'text-red-700'
                      }`}>
                        {event.isPositive ? '📈' : '⚠️'} {event.title}
                      </span>
                      <span className={`text-xs font-bold ${
                        event.isPositive ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {event.isPositive ? '+' : ''}
                        {event.effects.cash ? event.effects.cash : ''}
                        {event.effects.health ? (event.effects.health > 0 ? ' +' : '') + event.effects.health + ' 健康' : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 结算详情 */}
          <div className="p-6">
            {/* 收支明细 */}
            <div className="bg-slate-50 rounded-feishu p-4 mb-4 border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                <span className="mr-2">💰</span>
                收支明细
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">项目收入</span>
                  <span className={`text-sm font-bold ${currentSettlement.income > 0 ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {currentSettlement.income > 0 ? '+' : ''}{currentSettlement.income.toLocaleString()}
                  </span>
                </div>

                {/* 工资和生活费详情 */}
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="text-xs text-slate-500 mb-2">工资与生活费</div>
                  {formatLivingCostsBreakdown().map((item) => (
                    <div key={item.label} className="flex justify-between items-center mb-1 last:mb-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">{item.label}</span>
                        <span className="text-xs text-slate-400">({item.percent}%)</span>
                      </div>
                      <span className={`text-sm font-bold ${item.color}`}>
                        {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">仓储费用</span>
                  <span className="text-sm font-bold text-red-600">
                    -{currentSettlement.expenses.storage.toLocaleString()}
                  </span>
                </div>

                {/* 奖金事件 */}
                {bonusEvent && (
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-feishu border border-emerald-200">
                    <span className="text-sm text-emerald-700">🎁 {bonusEvent.name}</span>
                    <span className="text-sm font-bold text-emerald-600">
                      +{bonusEvent.cashReward.toLocaleString()}
                    </span>
                  </div>
                )}

                {/* 天灾事件 */}
                {disasterEvent && (
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded-feishu border border-red-200">
                    <span className="text-sm text-red-700">⚠️ {disasterEvent.name}</span>
                    <span className="text-sm font-bold text-red-600">
                      -{disasterEvent.cashPenalty.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-300 pt-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">净变化</span>
                  <span className={`text-base font-bold ${currentSettlement.netChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {currentSettlement.netChange >= 0 ? '+' : ''}{currentSettlement.netChange.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* 关系衰减 */}
            {Object.keys(currentSettlement.relationshipDecay).length > 0 && (
              <div className="bg-slate-50 rounded-feishu p-4 mb-4 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                  <span className="mr-2">📉</span>
                  关系衰减
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(currentSettlement.relationshipDecay).map(([type, decay]) => (
                    <div key={type} className="flex justify-between items-center p-2 bg-white rounded-feishu border border-slate-200">
                      <span className="text-xs text-slate-600">{type}</span>
                      <span className="text-xs font-bold text-red-500">-{decay}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 晋升检查 */}
            {canPromote && nextRankConfig ? (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-feishu p-4 mb-4 border-2 border-amber-200">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎖️</div>
                  <h3 className="text-base font-bold text-amber-800 mb-1">
                    晋升条件达成！
                  </h3>
                  <p className="text-sm text-amber-700">
                    你已晋升为 <span className="font-bold">{nextRankConfig.name}</span>
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    薪资: {nextRankConfig.minQuarterlySalary.toLocaleString()}/季度
                  </p>
                </div>
              </div>
            ) : promotionCheck.missingRequirements && promotionCheck.missingRequirements.length > 0 ? (
              <div className="bg-slate-50 rounded-feishu p-4 mb-4 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                  <span className="mr-2">📋</span>
                  晋升进度
                </h3>
                <div className="space-y-2">
                  {promotionCheck.missingRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center p-2 bg-white rounded-feishu border border-slate-200">
                      <span className="text-amber-500 mr-2">⏳</span>
                      <span className="text-xs text-slate-600">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* 操作按钮 */}
            <button
              onClick={handleNextQuarter}
              className={`w-full py-4 px-6 rounded-feishu font-bold text-slate-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]
                ${canPromote
                  ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 focus:ring-orange-500 border-2 border-orange-700'
                  : 'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 focus:ring-brand-500 border-2 border-brand-800'
                }`}
            >
              <span className="flex items-center justify-center">
                <span className="mr-2">{canPromote ? '🚀' : '➡️'}</span>
                {canPromote ? '接受晋升并继续' : '进入下一季度'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { RANK_DISPLAY } from '@/data/constants';

const QuarterlySettlement = () => {
  const navigate = useNavigate();
  const {
    status,
    currentRound,
    currentSettlement,
    nextQuarter,
    executePromotion,
  } = useGameStore();

  useEffect(() => {
    if (status !== 'settlement') {
      navigate('/game');
    }
  }, [status, navigate]);

  if (!currentSettlement || status !== 'settlement') {
    return null;
  }

  const { promotionCheck } = currentSettlement;
  // 扩展结算数据类型以包含新字段
  const extendedSettlement = currentSettlement as any;
  const bonusEvent = extendedSettlement.bonusEvent;
  const disasterEvent = extendedSettlement.disasterEvent;
  const livingCost = extendedSettlement.livingCost || 0;

  const handlePromotion = () => {
    if (promotionCheck.canPromote && promotionCheck.nextRank) {
      executePromotion(promotionCheck.nextRank);
    }
    nextQuarter();
    navigate('/game');
  };

  const canPromote = promotionCheck.canPromote && promotionCheck.nextRank;
  const nextRankDisplay = promotionCheck.nextRank ? RANK_DISPLAY[promotionCheck.nextRank] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* 顶部装饰条 */}
      <div className={`h-1.5 ${
        canPromote
          ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600'
          : 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600'
      }`}></div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* 主卡片 */}
          <div className={`bg-white rounded-feishu-lg shadow-feishu-xl overflow-hidden animate-scale-in ${
            canPromote ? 'ring-4 ring-amber-400 ring-opacity-50' : ''
          }`}>
            {/* 顶部状态区域 */}
            <div className={`p-8 text-center ${
              canPromote
                ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-b-2 border-amber-200'
                : 'bg-gradient-to-br from-slate-50 to-gray-50 border-b-2 border-slate-200'
            }`}>
              <div className="text-7xl mb-4">
                {canPromote ? '🎉' : '📊'}
              </div>
              <h1 className={`text-3xl font-bold mb-3 ${
                canPromote ? 'text-amber-700' : 'text-slate-700'
              }`}>
                {canPromote ? '恭喜晋升！' : `第 ${currentRound} 季度结算`}
              </h1>
              <p className="text-base text-slate-600 leading-relaxed">
                {canPromote
                  ? `你的表现非常出色，成功晋升为 ${nextRankDisplay?.label}！`
                  : '本季度收支情况如下'}
              </p>
            </div>

            {/* 结算详情 */}
            <div className="p-8">
              {/* 收支明细 */}
              <div className="bg-slate-50 rounded-feishu p-5 mb-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                  <span className="mr-2">💰</span>
                  收支明细
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">项目收入</span>
                    <span className={`font-bold ${currentSettlement.income > 0 ? 'text-green-600' : 'text-slate-600'}`}>
                      {currentSettlement.income > 0 ? '+' : ''}{currentSettlement.income}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">季度工资</span>
                    <span className={`font-bold ${currentSettlement.expenses.salary > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {currentSettlement.expenses.salary > 0 ? '+' : ''}{currentSettlement.expenses.salary}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">生活成本</span>
                    <span className="font-bold text-red-600">
                      -{livingCost}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">仓储费用</span>
                    <span className="font-bold text-red-600">
                      -{currentSettlement.expenses.storage}
                    </span>
                  </div>
                  {/* 奖金事件 */}
                  {bonusEvent && (
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded-feishu border border-green-200">
                      <span className="text-green-700">🎁 {bonusEvent.name}</span>
                      <span className="font-bold text-green-600">
                        +{bonusEvent.cashReward}
                      </span>
                    </div>
                  )}
                  {/* 天灾事件 */}
                  {disasterEvent && (
                    <div className="flex justify-between items-center p-2 bg-red-50 rounded-feishu border border-red-200">
                      <span className="text-red-700">⚠️ {disasterEvent.name}</span>
                      <span className="font-bold text-red-600">
                        -{disasterEvent.cashPenalty}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                    <span className="font-medium text-slate-700">净变化</span>
                    <span className={`text-lg font-bold ${currentSettlement.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {currentSettlement.netChange >= 0 ? '+' : ''}{currentSettlement.netChange}
                    </span>
                  </div>
                </div>
              </div>

              {/* 关系衰减 */}
              <div className="bg-slate-50 rounded-feishu p-5 mb-6 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                  <span className="mr-2">📉</span>
                  关系衰减
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(currentSettlement.relationshipDecay).map(([type, decay]) => (
                    <div key={type} className="flex justify-between items-center p-2 bg-white rounded-feishu">
                      <span className="text-sm text-slate-600">{type}</span>
                      <span className="text-sm font-bold text-red-500">-{decay}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 晋升检查 */}
              {promotionCheck.canPromote ? (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-feishu p-5 mb-6 border-2 border-amber-200">
                  <div className="text-center">
                    <div className="text-5xl mb-2">🎖️</div>
                    <h3 className="text-lg font-bold text-amber-800 mb-2">
                      晋升条件达成！
                    </h3>
                    <p className="text-sm text-amber-700">
                      你已晋升为 <span className="font-bold">{nextRankDisplay?.label}</span>
                    </p>
                  </div>
                </div>
              ) : promotionCheck.missingRequirements && promotionCheck.missingRequirements.length > 0 ? (
                <div className="bg-slate-50 rounded-feishu p-5 mb-6 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                    <span className="mr-2">📋</span>
                    晋升进度
                  </h3>
                  <div className="space-y-2">
                    {promotionCheck.missingRequirements.map((req, idx) => (
                      <div key={idx} className="flex items-center p-2 bg-white rounded-feishu">
                        <span className="text-amber-500 mr-2">⏳</span>
                        <span className="text-sm text-slate-600">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* 操作按钮 */}
              <div className="space-y-3">
                <button
                  onClick={handlePromotion}
                  className={`w-full py-4 px-6 rounded-feishu font-bold text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2
                            shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]
                            ${canPromote
                              ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 focus:ring-orange-500 border-2 border-orange-700'
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 focus:ring-blue-500 border-2 border-blue-800'
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
      </div>
    </div>
  );
};

export default QuarterlySettlement;

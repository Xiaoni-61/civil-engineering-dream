import { useNavigate } from 'react-router-dom';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { GameStatus } from '@shared/types';
import { RANK_CONFIGS } from '@shared/types';
import { QUARTER_HEALTH_REGEN } from '@/data/constants';

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
  const salaryRaise = extendedSettlement.salaryRaise;
  const nextQuarterStartEvents = extendedSettlement.nextQuarterStartEvents || [];
  const nextQuarterTotalEffects = extendedSettlement.nextQuarterTotalEffects || {};

  // 计算本季度所有属性的变化
  const calculateAttributeChanges = () => {
    const changes: { label: string; value: number; color: string; section?: string }[] = [];

    // 第一部分：本季度开始时的事件（已经应用）
    if (quarterStartEvents && quarterStartEvents.length > 0) {
      changes.push({ label: '【本季度开始事件】(已生效)', value: 0, color: 'text-slate-500', section: 'header' } as any);
      quarterStartEvents.forEach(event => {
        const effects = event.effects;
        if (effects.cash) changes.push({ label: `  ${event.title}(现金)`, value: effects.cash, color: effects.cash > 0 ? 'text-emerald-600' : 'text-red-600' });
        if (effects.health) changes.push({ label: `  ${event.title}(健康)`, value: effects.health, color: effects.health > 0 ? 'text-emerald-600' : 'text-red-600' });
        if (effects.reputation) changes.push({ label: `  ${event.title}(声誉)`, value: effects.reputation, color: effects.reputation > 0 ? 'text-emerald-600' : 'text-red-600' });
        if (effects.workAbility) changes.push({ label: `  ${event.title}(工作能力)`, value: effects.workAbility, color: effects.workAbility > 0 ? 'text-brand-600' : 'text-red-600' });
        if (effects.luck) changes.push({ label: `  ${event.title}(幸运)`, value: effects.luck, color: effects.luck > 0 ? 'text-purple-600' : 'text-red-600' });
      });
    }

    // 第二部分：本季度结算变化
    changes.push({ label: '【本季度收支结算】', value: 0, color: 'text-slate-500', section: 'header' } as any);

    // 季度自然恢复健康
    changes.push({ label: '  季度自然恢复(健康)', value: QUARTER_HEALTH_REGEN, color: 'text-emerald-600' });

    // 季度涨薪
    if (salaryRaise && salaryRaise > 0) {
      changes.push({ label: '  季度涨薪(下季度生效)', value: salaryRaise, color: 'text-emerald-600' });
    }

    // 收支净变化（这是本季度的实际财务变化）
    changes.push({ label: '  收支净变化(工资+生活费+项目等)', value: currentSettlement.netChange, color: currentSettlement.netChange > 0 ? 'text-emerald-600' : 'text-red-600' });

    // 天灾事件的非现金效果（现金效果已包含在净变化中）
    if (disasterEvent) {
      if (disasterEvent.healthPenalty) changes.push({ label: `  ${disasterEvent.name}(健康)`, value: -disasterEvent.healthPenalty, color: 'text-red-600' });
      if (disasterEvent.reputationPenalty) changes.push({ label: `  ${disasterEvent.name}(声誉)`, value: -disasterEvent.reputationPenalty, color: 'text-red-600' });
      if (disasterEvent.progressPenalty) changes.push({ label: `  ${disasterEvent.name}(进度)`, value: -disasterEvent.progressPenalty, color: 'text-red-600' });
    }

    return changes;
  };

  const attributeChanges = calculateAttributeChanges();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 pb-20 pt-44">
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
                本季度开始事件
              </h3>
              <div className="space-y-2">
                {quarterStartEvents.map((event, index) => {
                  const effects = event.effects;
                  // 构建效果显示字符串
                  const effectParts: string[] = [];
                  if (effects.cash) effectParts.push(`${effects.cash > 0 ? '+' : ''}${effects.cash}现金`);
                  if (effects.health) effectParts.push(`${effects.health > 0 ? '+' : ''}${effects.health}健康`);
                  if (effects.reputation) effectParts.push(`${effects.reputation > 0 ? '+' : ''}${effects.reputation}声誉`);
                  if (effects.workAbility) effectParts.push(`${effects.workAbility > 0 ? '+' : ''}${effects.workAbility}工作能力`);
                  if (effects.luck) effectParts.push(`${effects.luck > 0 ? '+' : ''}${effects.luck}幸运`);
                  if (effects.progress) effectParts.push(`${effects.progress > 0 ? '+' : ''}${effects.progress}进度`);
                  if (effects.quality) effectParts.push(`${effects.quality > 0 ? '+' : ''}${effects.quality}质量`);

                  return (
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
                          {effectParts.join(' · ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">{event.description}</p>
                    </div>
                  );
                })}
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
                  <div className="p-2 bg-red-50 rounded-feishu border border-red-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-red-700 font-medium">⚠️ {disasterEvent.name}</span>
                    </div>
                    <div className="text-xs text-slate-600 mb-1">{disasterEvent.description}</div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                      {disasterEvent.cashPenalty && (
                        <span className="text-red-600 font-bold">-{disasterEvent.cashPenalty.toLocaleString()}现金</span>
                      )}
                      {disasterEvent.healthPenalty && (
                        <span className="text-red-600 font-bold">-{disasterEvent.healthPenalty}健康</span>
                      )}
                      {disasterEvent.reputationPenalty && (
                        <span className="text-red-600 font-bold">-{disasterEvent.reputationPenalty}声誉</span>
                      )}
                      {disasterEvent.progressPenalty && (
                        <span className="text-red-600 font-bold">-{disasterEvent.progressPenalty}进度</span>
                      )}
                    </div>
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

            {/* 本季度属性变化汇总 */}
            {attributeChanges.length > 0 && (
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-feishu p-4 mb-4 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                  <span className="mr-2">📊</span>
                  本季度属性变化汇总
                </h3>
                <div className="space-y-2">
                  {attributeChanges.map((change, index) => {
                    if ((change as any).section === 'header') {
                      return (
                        <div key={index} className={`text-xs font-bold ${change.color} mt-3 first:mt-0`}>
                          {change.label}
                        </div>
                      );
                    }
                    return (
                      <div key={index} className="flex justify-between items-center text-sm pl-2">
                        <span className="text-slate-600">{change.label}</span>
                        <span className={`font-bold ${change.color}`}>
                          {change.value > 0 ? '+' : ''}{change.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                  ✅ 以上所有变化已应用到当前属性值，请查看顶部状态栏
                </div>
              </div>
            )}

            {/* 下季度开始事件预告 */}
            {nextQuarterStartEvents.length > 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-feishu p-4 mb-4 border-2 border-amber-300">
                <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center">
                  <span className="mr-2">🔮</span>
                  下季度开始事件预告
                </h3>
                <div className="space-y-2 mb-3">
                  {nextQuarterStartEvents.map((event: any, index: number) => {
                    const effects = event.effects;
                    // 构建效果显示字符串
                    const effectParts: string[] = [];
                    if (effects.cash) effectParts.push(`${effects.cash > 0 ? '+' : ''}${effects.cash}现金`);
                    if (effects.health) effectParts.push(`${effects.health > 0 ? '+' : ''}${effects.health}健康`);
                    if (effects.reputation) effectParts.push(`${effects.reputation > 0 ? '+' : ''}${effects.reputation}声誉`);
                    if (effects.workAbility) effectParts.push(`${effects.workAbility > 0 ? '+' : ''}${effects.workAbility}工作能力`);
                    if (effects.luck) effectParts.push(`${effects.luck > 0 ? '+' : ''}${effects.luck}幸运`);
                    if (effects.progress) effectParts.push(`${effects.progress > 0 ? '+' : ''}${effects.progress}进度`);
                    if (effects.quality) effectParts.push(`${effects.quality > 0 ? '+' : ''}${effects.quality}质量`);

                    return (
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
                            {effectParts.join(' · ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{event.description}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-white rounded-lg p-3 border border-amber-200">
                  <div className="text-xs text-amber-700 mb-2 font-medium">💡 进入下季度后的预期变化：</div>
                  <div className="grid grid-cols-2 gap-2">
                    {nextQuarterTotalEffects.cash !== 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">💰 现金</span>
                        <span className={`font-bold ${nextQuarterTotalEffects.cash > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {nextQuarterTotalEffects.cash > 0 ? '+' : ''}{nextQuarterTotalEffects.cash}
                        </span>
                      </div>
                    )}
                    {nextQuarterTotalEffects.health !== 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">❤️ 健康</span>
                        <span className={`font-bold ${nextQuarterTotalEffects.health > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {nextQuarterTotalEffects.health > 0 ? '+' : ''}{nextQuarterTotalEffects.health}
                        </span>
                      </div>
                    )}
                    {nextQuarterTotalEffects.reputation !== 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">⭐ 声誉</span>
                        <span className={`font-bold ${nextQuarterTotalEffects.reputation > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {nextQuarterTotalEffects.reputation > 0 ? '+' : ''}{nextQuarterTotalEffects.reputation}
                        </span>
                      </div>
                    )}
                    {nextQuarterTotalEffects.workAbility !== 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">💼 工作能力</span>
                        <span className={`font-bold ${nextQuarterTotalEffects.workAbility > 0 ? 'text-brand-600' : 'text-red-600'}`}>
                          {nextQuarterTotalEffects.workAbility > 0 ? '+' : ''}{nextQuarterTotalEffects.workAbility}
                        </span>
                      </div>
                    )}
                    {nextQuarterTotalEffects.luck !== 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">🍀 幸运</span>
                        <span className={`font-bold ${nextQuarterTotalEffects.luck > 0 ? 'text-purple-600' : 'text-red-600'}`}>
                          {nextQuarterTotalEffects.luck > 0 ? '+' : ''}{nextQuarterTotalEffects.luck}
                        </span>
                      </div>
                    )}
                  </div>
                  {nextQuarterTotalEffects.cash && (
                    <div className="mt-2 pt-2 border-t border-amber-200 text-xs">
                      <span className="text-slate-600">预期进入下季度后现金：</span>
                      <span className={`font-bold ml-2 ${
                        (useGameStoreNew.getState().stats.cash + nextQuarterTotalEffects.cash) < 10000
                          ? 'text-red-600'
                          : 'text-emerald-600'
                      }`}>
                        {((useGameStoreNew.getState().stats.cash + nextQuarterTotalEffects.cash) / 10000).toFixed(1)}万
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStoreNew';
import {
  MaterialType,
  MATERIAL_CONFIGS,
  RelationshipType,
} from '@shared/types';
import { MATERIAL_DISPLAY, RELATIONSHIP_DISPLAY } from '@/data/constants';
import { ACTIONS_BY_RELATIONSHIP, RelationshipAction } from '@/data/relationshipActions';
import PriceChartModal from '@/components/PriceChartModal';

const StrategyPhase = () => {
  const navigate = useNavigate();
  const {
    stats,
    inventory,
    materialPrices,
    materialPriceHistory,
    relationships,
    buyMaterial,
    sellMaterial,
    maintainRelationship,
    finishQuarter,
    maintenanceCount,
    getMaxMaintenanceCount,
    isRelationshipUnlocked,
    materialTradeCount,
    getMaxMaterialTradeCount,
    getMaxBuyableAmount,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'material' | 'relationship'>('material');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>(MaterialType.CEMENT);
  const [tradeAmount, setTradeAmount] = useState<number>(10);
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipType>(RelationshipType.CLIENT);
  const [tradeMessage, setTradeMessage] = useState<string>('');
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('');
  const [showPriceChart, setShowPriceChart] = useState(false);

  // 常量定义
  const MESSAGE_DURATION = 3000;

  const handleTrade = (type: 'buy' | 'sell') => {
    const result = type === 'buy'
      ? buyMaterial(selectedMaterial, tradeAmount)
      : sellMaterial(selectedMaterial, tradeAmount);

    setTradeMessage(result.message);
    setTimeout(() => setTradeMessage(''), MESSAGE_DURATION);
  };

  const handleMaintain = (action: RelationshipAction) => {
    // 检查是否可以使用该动作
    const { canUse, reason } = canUseAction(action);
    if (!canUse) {
      setMaintenanceMessage(reason || '无法使用此维护方式');
      setTimeout(() => setMaintenanceMessage(''), MESSAGE_DURATION);
      return;
    }

    // 计算基础关系变化
    const [minChange, maxChange] = action.baseEffects.relationshipChange;
    let relationshipChange = Math.floor(Math.random() * (maxChange - minChange + 1)) + minChange;

    // 计算消耗
    let cashCost = action.cost.cash || 0;
    let healthCost = action.cost.health || 0;

    // 检查资源是否足够（再次检查，防止并发问题）
    if (stats.cash < cashCost) {
      setMaintenanceMessage('现金不足');
      setTimeout(() => setMaintenanceMessage(''), MESSAGE_DURATION);
      return;
    }
    if (stats.health < healthCost) {
      setMaintenanceMessage('健康不足');
      setTimeout(() => setMaintenanceMessage(''), MESSAGE_DURATION);
      return;
    }

    // ========== 1. 检查并应用加成效果 ==========
    let hasBonus = false;
    let bonusMultiplier = 1;
    let bonusExtraChange = 0;
    let riskProbabilityReduction = 0;

    if (action.bonuses?.ability && action.bonuses.effect) {
      const { ability, effect } = action.bonuses;

      // 检查是否满足加成条件（直接使用 workAbility 和 luck）
      const meetsWorkAbility = !ability.workAbility || stats.workAbility >= ability.workAbility;
      const meetsReputation = !ability.reputation || stats.reputation >= ability.reputation;
      const meetsLuck = !ability.luck || stats.luck >= ability.luck;

      hasBonus = meetsWorkAbility && meetsReputation && meetsLuck;

      if (hasBonus) {
        // 应用加成效果
        if (effect.multiplier) {
          bonusMultiplier = effect.multiplier;
          relationshipChange = Math.floor(relationshipChange * bonusMultiplier);
        }
        if (effect.extraChange) {
          bonusExtraChange = effect.extraChange;
          relationshipChange += bonusExtraChange;
        }
        if (effect.probabilityReduction) {
          riskProbabilityReduction = effect.probabilityReduction;
        }
      }
    }

    // ========== 2. 风险判定 ==========
    let riskTriggered = false;
    let riskConsequences: { cash?: number; health?: number; reputation?: number; relationship?: number; } = {};
    let riskDescription = '';

    if (action.risks) {
      // 计算最终风险概率（基础概率 - 幸运降低）
      let finalRiskProbability = action.risks.probability - riskProbabilityReduction;
      finalRiskProbability = Math.max(0, Math.min(1, finalRiskProbability)); // 限制在 0-1 之间

      // 掷骰子判定是否触发风险
      if (Math.random() < finalRiskProbability) {
        riskTriggered = true;
        riskDescription = action.risks.description;
        riskConsequences = action.risks.consequences;

        // 应用风险惩罚
        if (riskConsequences.cash) cashCost += riskConsequences.cash;
        if (riskConsequences.health) healthCost += riskConsequences.health;
      }
    }

    // ========== 3. 特殊效果判定 ==========
    let specialEffectTriggered = false;
    let specialEffectDescription = '';
    let specialEffectEffects: { quality?: number; progress?: number; workAbility?: number; luck?: number; } = {};
    let newPricePredictionBonus = useGameStore.getState().pricePredictionBonus;
    let newStorageFeeDiscount = useGameStore.getState().storageFeeDiscount;

    if (action.specialEffects) {
      // 特殊效果概率（workAbility 高时可能有加成）
      let specialEffectProbability = action.specialEffects.probability;

      // 检查是否有工作能力加成
      if (action.bonuses?.ability?.workAbility && stats.workAbility >= action.bonuses.ability.workAbility) {
        // workAbility ≥ 60 时，设计优化方案概率提升
        if (action.specialEffects.type === 'design_optimization' && stats.workAbility >= 60) {
          specialEffectProbability = 0.2; // 20%
        }
      }

      // 检查政府政策学习的条件
      if (action.specialEffects.type === 'policy_interpretation' && stats.workAbility >= 70) {
        specialEffectProbability = 0.1; // 10%
      }

      if (Math.random() < specialEffectProbability) {
        specialEffectTriggered = true;
        specialEffectDescription = action.specialEffects.description;
        specialEffectEffects = action.specialEffects.effects || {};

        // 应用特殊效果
        if (action.specialEffects.type === 'design_optimization') {
          newPricePredictionBonus = 50; // 价格预测准确率 +50%
        }
        if (action.specialEffects.type === 'policy_interpretation') {
          newStorageFeeDiscount = 50; // 仓储费 -50%
        }
      }
    }

    // ========== 4. 应用所有变化到游戏状态 ==========
    // 扣除消耗
    const newStats = { ...stats };
    newStats.cash = Math.max(0, stats.cash - cashCost);
    newStats.health = Math.max(0, stats.health - healthCost);

    // 更新关系值
    const newRelationships = { ...relationships };
    const finalRelationshipChange = riskTriggered && riskConsequences.relationship
      ? relationshipChange - riskConsequences.relationship
      : relationshipChange;
    newRelationships[selectedRelationship] = Math.max(0, Math.min(100, relationships[selectedRelationship] + finalRelationshipChange));

    // 应用基础效果（workAbility, luck, quality, progress）
    if (action.baseEffects.workAbility) {
      newStats.workAbility = Math.min(100, stats.workAbility + action.baseEffects.workAbility);
    }
    if (action.baseEffects.luck) {
      newStats.luck = Math.min(100, stats.luck + action.baseEffects.luck);
    }
    if (action.baseEffects.quality) {
      newStats.quality = Math.min(100, stats.quality + action.baseEffects.quality);
    }
    if (action.baseEffects.progress) {
      newStats.progress = Math.min(100, stats.progress + action.baseEffects.progress);
    }

    // 应用特殊效果
    if (specialEffectTriggered) {
      if (specialEffectEffects.quality) {
        newStats.quality = Math.min(100, newStats.quality + specialEffectEffects.quality);
      }
      if (specialEffectEffects.progress) {
        newStats.progress = Math.min(100, newStats.progress + specialEffectEffects.progress);
      }
      if (specialEffectEffects.workAbility) {
        newStats.workAbility = Math.min(100, newStats.workAbility + specialEffectEffects.workAbility);
      }
      if (specialEffectEffects.luck) {
        newStats.luck = Math.min(100, newStats.luck + specialEffectEffects.luck);
      }
      // TODO: storageDiscount 需要在季度结算时处理
    }

    // 应用风险惩罚（除了现金和健康）
    if (riskTriggered) {
      if (riskConsequences.reputation) {
        newStats.reputation = Math.max(0, stats.reputation - riskConsequences.reputation);
      }
    }

    // 更新状态（通过 maintainRelationship 函数）
    // 我们需要手动更新状态，因为 maintainRelationship 函数使用的是旧的维护方式
    // 所以我们直接使用 set 方法更新状态
    const {
      maintainRelationship: _maintainRelationship,
      ...storeWithoutMaintain
    } = useGameStore.getState();

    // 记录已维护的关系
    const newMaintained = new Set(storeWithoutMaintain.maintainedRelationships);
    newMaintained.add(selectedRelationship);

    useGameStore.setState({
      stats: newStats,
      relationships: newRelationships,
      maintenanceCount: storeWithoutMaintain.maintenanceCount + 1,
      maintainedRelationships: newMaintained,
      pricePredictionBonus: newPricePredictionBonus,
      storageFeeDiscount: newStorageFeeDiscount,
    });

    // ========== 5. 构建综合反馈消息 ==========
    const messageParts: string[] = [];

    // 基础收益
    messageParts.push(`关系值 +${finalRelationshipChange}`);

    // 消耗
    if (cashCost > 0) messageParts.push(`现金 -${cashCost}`);
    if (healthCost > 0) messageParts.push(`健康 -${healthCost}`);

    // 基础效果
    if (action.baseEffects.workAbility) messageParts.push(`工作能力 +${action.baseEffects.workAbility}`);
    if (action.baseEffects.quality) messageParts.push(`质量 +${action.baseEffects.quality}`);
    if (action.baseEffects.progress) messageParts.push(`进度 +${action.baseEffects.progress}`);

    // 加成提示
    if (hasBonus) {
      if (bonusMultiplier > 1) messageParts.push(`🔥 加成效果触发！收益×${bonusMultiplier}`);
      if (bonusExtraChange > 0) messageParts.push(`🔥 额外+${bonusExtraChange}`);
    }

    // 风险提示
    if (riskTriggered) {
      messageParts.push(`⚠️ ${riskDescription}`);
      if (riskConsequences.reputation) messageParts.push(`声誉-${riskConsequences.reputation}`);
    }

    // 特殊效果提示
    if (specialEffectTriggered) {
      messageParts.push(`✨ ${specialEffectDescription}`);
    }

    setMaintenanceMessage(messageParts.join(' | '));
    setTimeout(() => setMaintenanceMessage(''), MESSAGE_DURATION);
  };

  const getRelationshipLevel = (value: number) => {
    if (value >= 80) return { label: '亲密', color: 'text-green-600' };
    if (value >= 60) return { label: '良好', color: 'text-blue-600' };
    if (value >= 40) return { label: '一般', color: 'text-yellow-600' };
    if (value >= 20) return { label: '紧张', color: 'text-orange-600' };
    return { label: '敌对', color: 'text-red-600' };
  };

  // 格式化金额显示
  const formatAmount = (amount: number) => {
    if (Math.abs(amount) >= 10000) {
      return (amount / 10000).toFixed(1) + '万';
    }
    return amount.toString();
  };

  // 检查维护方式是否可用
  const canUseAction = (action: RelationshipAction): { canUse: boolean; reason?: string } => {
    // 检查维护次数
    if (maintenanceCount >= getMaxMaintenanceCount()) {
      return { canUse: false, reason: '本季度维护次数已达上限' };
    }

    // 检查现金
    if (action.cost.cash && stats.cash < action.cost.cash) {
      return { canUse: false, reason: '现金不足' };
    }

    // 检查健康
    if (action.cost.health && stats.health < action.cost.health) {
      return { canUse: false, reason: '健康不足' };
    }

    // 检查关系值条件
    if (action.conditions) {
      const currentRelationship = relationships[action.relationshipType];

      if (action.conditions.minRelationship && currentRelationship < action.conditions.minRelationship) {
        return { canUse: false, reason: `关系值需达到 ${action.conditions.minRelationship}` };
      }

      if (action.conditions.maxRelationship && currentRelationship > action.conditions.maxRelationship) {
        return { canUse: false, reason: `关系值需低于 ${action.conditions.maxRelationship}` };
      }

      if (action.conditions.minHealth && stats.health < action.conditions.minHealth) {
        return { canUse: false, reason: `健康需达到 ${action.conditions.minHealth}` };
      }

      // 检查项目进度条件
      if (action.conditions.minProgress && stats.progress < action.conditions.minProgress) {
        return { canUse: false, reason: `项目进度需达到 ${action.conditions.minProgress}%` };
      }
    }

    return { canUse: true };
  };

  // 检查是否有加成
  const hasBonus = (action: RelationshipAction): boolean => {
    if (!action.bonuses?.ability) return false;

    const { workAbility, reputation, luck } = action.bonuses.ability;

    // 检查工作能力
    if (workAbility && stats.workAbility < workAbility) return false;

    // 检查声誉
    if (reputation && stats.reputation < reputation) return false;

    // 检查幸运
    if (luck && stats.luck < luck) return false;

    return true;
  };

  // 获取加成描述
  const getBonusDescription = (action: RelationshipAction): string | null => {
    if (!action.bonuses) return null;

    const parts: string[] = [];

    if (action.bonuses.ability) {
      const { workAbility, reputation, luck } = action.bonuses.ability;

      if (workAbility) {
        parts.push(`🔧 工作能力≥${workAbility}`);
      }
      if (reputation) {
        parts.push(`⭐ 声誉≥${reputation}`);
      }
      if (luck) {
        parts.push(`🍀 幸运≥${luck}`);
      }
    }

    if (action.bonuses.effect) {
      if (action.bonuses.effect.multiplier) {
        parts.push(`收益×${action.bonuses.effect.multiplier}`);
      }
      if (action.bonuses.effect.extraChange) {
        parts.push(`额外+${action.bonuses.effect.extraChange}`);
      }
      if (action.bonuses.effect.probabilityReduction) {
        const reducedProb = action.risks ? Math.round((action.risks.probability - action.bonuses.effect.probabilityReduction) * 100) : 0;
        parts.push(`风险降至${reducedProb}%`);
      }
    }

    return parts.length > 0 ? parts.join(' ') : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* 顶部装饰条 */}
      <div className="h-1 bg-gradient-to-r from-brand-500 via-engineering-safety to-brand-600"></div>

      {/* 顶部导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => {
                finishQuarter();
                navigate('/settlement');
              }}
              className="flex items-center space-x-2 text-slate-600 hover:text-brand-600 transition-colors group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded px-2 py-1 -ml-2 active:scale-95"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span className="text-sm font-medium">完成季度</span>
            </button>

            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-base font-bold text-slate-800 flex items-center">
                <span className="mr-2">📊</span>
                策略阶段
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        {/* 当前状态 */}
        <div className="bg-white rounded-feishu-lg shadow-feishu p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-xs text-slate-500">现金</div>
              <div className="text-lg font-bold text-emerald-600">{stats.cash}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">📦</div>
              <div className="text-xs text-slate-500">库存价值</div>
              <div className="text-lg font-bold text-blue-600">
                {Object.values(MaterialType).reduce((sum, type) => {
                  const amount = inventory[type];
                  const price = materialPrices[type]?.currentPrice || MATERIAL_CONFIGS[type].basePrice;
                  return sum + amount * price;
                }, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* 标签切换 */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('material')}
            className={`flex-1 py-3 px-4 rounded-feishu font-bold text-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              activeTab === 'material'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 border-2 border-blue-500'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-300'
            }`}
            style={activeTab === 'material' ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}}
          >
            🏗️ 材料市场
          </button>
          <button
            onClick={() => setActiveTab('relationship')}
            className={`flex-1 py-3 px-4 rounded-feishu font-bold text-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              activeTab === 'relationship'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 border-2 border-blue-500'
                : 'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-300'
            }`}
            style={activeTab === 'relationship' ? { textShadow: '0 1px 2px rgba(0,0,0,0.3)' } : {}}
          >
            🤝 关系维护
          </button>
        </div>

        {/* 材料市场 */}
        {activeTab === 'material' && (
          <div className="bg-white rounded-feishu-lg shadow-feishu p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">材料市场</h2>
              <div className="flex items-center gap-3">
                <div className="text-sm bg-slate-100 px-3 py-1 rounded-full">
                  <span className="text-slate-600">本季度已交易：</span>
                  <span className="font-bold text-brand-600">{materialTradeCount}/{getMaxMaterialTradeCount()}</span>
                  <span className="text-slate-600 ml-1">次</span>
                </div>
                <button
                  onClick={() => setShowPriceChart(true)}
                  className="text-sm text-brand-600 hover:text-brand-700 cursor-pointer flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  价格走势
                </button>
              </div>
            </div>

            {/* 材料选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">选择材料</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.values(MaterialType).map((type) => {
                  const display = MATERIAL_DISPLAY[type];
                  const price = materialPrices[type];
                  const config = MATERIAL_CONFIGS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedMaterial(type)}
                      className={`p-4 rounded-feishu border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        selectedMaterial === type
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-2xl mb-1">{display.icon}</div>
                      <div className={`text-sm font-semibold ${selectedMaterial === type ? 'text-brand-900' : 'text-slate-800'}`}>{display.label}</div>
                      <div className={`text-sm font-bold ${price?.trend === 'up' ? 'text-red-600' : price?.trend === 'down' ? 'text-green-600' : 'text-slate-800'}`}>
                        {price?.currentPrice || config.basePrice}/{config.unit}
                      </div>
                      <div className={`text-xs font-medium ${price?.trend === 'up' ? 'text-red-500' : price?.trend === 'down' ? 'text-green-500' : 'text-slate-600'}`}>
                        {price?.trend === 'up' ? '↑' : price?.trend === 'down' ? '↓' : '─'}
                        {price?.priceChange ? `${price.priceChange > 0 ? '+' : ''}${price.priceChange}%` : '0%'}
                      </div>
                      <div className={`text-xs mt-1 ${selectedMaterial === type ? 'text-brand-700' : 'text-slate-600'}`}>
                        库存: {inventory[type]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 交易操作 */}
            {materialTradeCount >= getMaxMaterialTradeCount() ? (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-feishu p-6 text-center">
                <div className="text-2xl mb-2">🔒</div>
                <div className="text-sm font-medium text-orange-800">本季度交易次数已达上限</div>
                <div className="text-xs text-orange-600 mt-1">下季度将重置交易次数</div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-feishu p-4">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">交易数量</label>
                    <input
                      type="number"
                      min={MATERIAL_CONFIGS[selectedMaterial].minTrade}
                      max={MATERIAL_CONFIGS[selectedMaterial].maxTrade}
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-feishu focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      最大可买: {getMaxBuyableAmount(selectedMaterial)} {MATERIAL_CONFIGS[selectedMaterial].unit}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTrade('buy')}
                      disabled={stats.cash < (materialPrices[selectedMaterial]?.currentPrice || MATERIAL_CONFIGS[selectedMaterial].basePrice) * tradeAmount || materialTradeCount >= getMaxMaterialTradeCount()}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white rounded-feishu cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed active:scale-95"
                    >
                      买入
                    </button>
                    <button
                      onClick={() => handleTrade('sell')}
                      disabled={inventory[selectedMaterial] < tradeAmount || materialTradeCount >= getMaxMaterialTradeCount()}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white rounded-feishu cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed active:scale-95"
                    >
                      卖出
                    </button>
                  </div>
                </div>
                {tradeMessage && (
                  <div className="mt-3 text-sm text-center text-slate-600">{tradeMessage}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 关系维护 */}
        {activeTab === 'relationship' && (
          <div className="bg-white rounded-feishu-lg shadow-feishu p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">关系维护</h2>
              <div className="text-sm bg-slate-100 px-3 py-1 rounded-full">
                <span className="text-slate-600">本季度已维护：</span>
                <span className="font-bold text-brand-600">{maintenanceCount}/{getMaxMaintenanceCount()}</span>
                <span className="text-slate-600 ml-1">次</span>
              </div>
            </div>

            {/* 关系选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">选择关系对象</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(RelationshipType).map((type) => {
                  const display = RELATIONSHIP_DISPLAY[type];
                  const value = relationships[type];
                  const level = getRelationshipLevel(value);
                  const isUnlocked = isRelationshipUnlocked(type);
                  return (
                    <button
                      key={type}
                      onClick={() => isUnlocked && setSelectedRelationship(type)}
                      disabled={!isUnlocked}
                      className={`p-4 rounded-feishu border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed relative ${
                        selectedRelationship === type
                          ? 'border-brand-500 bg-brand-50'
                          : isUnlocked
                          ? 'border-slate-200 hover:border-slate-300 bg-white'
                          : 'border-slate-200 bg-slate-50 opacity-60'
                      }`}
                    >
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 rounded-feishu">
                          <div className="text-center">
                            <div className="text-2xl mb-1">🔒</div>
                            <div className="text-xs font-semibold text-slate-700">未解锁</div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl">{display.icon}</div>
                        <div className={`text-sm font-bold ${level.color}`}>{level.label}</div>
                      </div>
                      <div className={`text-sm font-semibold ${selectedRelationship === type ? 'text-brand-900' : 'text-slate-800'}`}>{display.label}</div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${
                            value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-blue-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <div className={`text-xs font-medium mt-1 ${selectedRelationship === type ? 'text-brand-700' : 'text-slate-600'}`}>关系值: {value}/100</div>

                      {/* 关系预警提示系统 */}
                      {isUnlocked && value < 50 && (
                        <div className={`mt-2 px-2 py-1.5 rounded text-xs ${
                          value <= 15
                            ? 'bg-red-100 border border-red-300 text-red-800'
                            : value <= 30
                            ? 'bg-orange-100 border border-orange-300 text-orange-800'
                            : 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                        }`}>
                          <div className="flex items-start">
                            <span className="mr-1">
                              {value <= 15 ? '🚨' : value <= 30 ? '⚠️' : '⚡'}
                            </span>
                            <span className="flex-1">
                              {value <= 15
                                ? `关系崩溃！功能已受限`
                                : value <= 30
                                ? `关系危急，可能触发负面事件`
                                : `关系紧张，建议维护`}
                            </span>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 维护方式 */}
            {maintenanceCount >= getMaxMaintenanceCount() ? (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-feishu p-6 text-center">
                <div className="text-2xl mb-2">⚠️</div>
                <div className="text-sm font-medium text-orange-800">本季度维护次数已达上限</div>
                <div className="text-xs text-orange-600 mt-1">下季度将根据您的职级获得新的维护次数</div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 获取当前选中关系的维护方式 */}
                {(() => {
                  const actions = ACTIONS_BY_RELATIONSHIP[selectedRelationship];
                  const display = RELATIONSHIP_DISPLAY[selectedRelationship];

                  return (
                    <div key={selectedRelationship}>
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <span className="mr-2">{display.icon}</span>
                        {display.label}维护方式
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {actions.map((action) => {
                          const { canUse, reason } = canUseAction(action);
                          const hasBonusEffect = hasBonus(action);
                          const bonusDesc = getBonusDescription(action);
                          const [minChange, maxChange] = action.baseEffects.relationshipChange;

                          return (
                            <button
                              key={action.id}
                              onClick={() => canUse && handleMaintain(action)}
                              disabled={!canUse}
                              className={`p-4 rounded-feishu border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed active:scale-95 text-left ${
                                canUse
                                  ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                                  : 'bg-slate-50 border-slate-200 opacity-60'
                              }`}
                            >
                              {/* 标题和图标 */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center">
                                  <span className="text-2xl mr-2">{action.icon}</span>
                                  <span className="text-base font-bold text-slate-800">{action.name}</span>
                                </div>
                                {!canUse && reason && (
                                  <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                                    {reason}
                                  </span>
                                )}
                              </div>

                              {/* 描述 */}
                              <div className="text-xs text-slate-600 mb-3">{action.description}</div>

                              {/* 消耗 */}
                              <div className="space-y-1 mb-3">
                                {(action.cost.cash || action.cost.health) && (
                                  <div className="text-xs font-semibold text-slate-700 mb-1">消耗：</div>
                                )}
                                {action.cost.cash && (
                                  <div className="flex items-center text-xs">
                                    <span className="mr-2">💰</span>
                                    <span className={`font-bold ${stats.cash >= action.cost.cash ? 'text-red-600' : 'text-red-400'}`}>
                                      -{formatAmount(action.cost.cash)}
                                    </span>
                                  </div>
                                )}
                                {action.cost.health && (
                                  <div className="flex items-center text-xs">
                                    <span className="mr-2">❤️</span>
                                    <span className={`font-bold ${stats.health >= action.cost.health ? 'text-red-500' : 'text-red-300'}`}>
                                      -{action.cost.health}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* 收益 */}
                              <div className="space-y-1 mb-3">
                                <div className="text-xs font-semibold text-slate-700 mb-1">收益：</div>
                                <div className="flex items-center text-xs">
                                  <span className="mr-2">🤝</span>
                                  <span className="font-bold text-green-600">
                                    +{minChange}~{maxChange}
                                  </span>
                                </div>
                                {action.baseEffects.workAbility && (
                                  <div className="flex items-center text-xs">
                                    <span className="mr-2">🔧</span>
                                    <span className="font-bold text-blue-600">
                                      质量+{action.baseEffects.workAbility}
                                    </span>
                                  </div>
                                )}
                                {action.baseEffects.quality && (
                                  <div className="flex items-center text-xs">
                                    <span className="mr-2">⭐</span>
                                    <span className="font-bold text-purple-600">
                                      质量+{action.baseEffects.quality}
                                    </span>
                                  </div>
                                )}
                                {action.baseEffects.progress && (
                                  <div className="flex items-center text-xs">
                                    <span className="mr-2">📈</span>
                                    <span className="font-bold text-emerald-600">
                                      进度+{action.baseEffects.progress}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* 风险提示 */}
                              {action.risks && (
                                <div className="bg-orange-50 border border-orange-200 rounded px-2 py-1.5 mb-2">
                                  <div className="flex items-start text-xs">
                                    <span className="mr-1">⚠️</span>
                                    <div className="flex-1">
                                      <span className="font-semibold text-orange-800">
                                        {Math.round(action.risks.probability * 100)}% 概率
                                      </span>
                                      <span className="text-orange-700 ml-1">{action.risks.description}</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* 加成提示 */}
                              {bonusDesc && (
                                <div className={`flex items-start text-xs px-2 py-1.5 rounded ${
                                  hasBonusEffect ? 'bg-green-50 border border-green-200' : 'bg-slate-100 border border-slate-200'
                                }`}>
                                  <span className="mr-1">{hasBonusEffect ? '🔥' : '🔒'}</span>
                                  <span className={hasBonusEffect ? 'text-green-700' : 'text-slate-600'}>
                                    {bonusDesc}
                                  </span>
                                </div>
                              )}

                              {/* 特殊效果 */}
                              {action.specialEffects && (
                                <div className="mt-2 bg-blue-50 border border-blue-200 rounded px-2 py-1.5">
                                  <div className="flex items-start text-xs">
                                    <span className="mr-1">✨</span>
                                    <div className="flex-1">
                                      <span className="font-semibold text-blue-800">
                                        {Math.round(action.specialEffects.probability * 100)}% 概率
                                      </span>
                                      <span className="text-blue-700 ml-1">{action.specialEffects.description}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            {maintenanceMessage && (
              <div className="mt-4 text-center text-sm text-slate-600 bg-slate-50 p-3 rounded-feishu">
                {maintenanceMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 价格走势弹窗 */}
      <PriceChartModal
        isOpen={showPriceChart}
        onClose={() => setShowPriceChart(false)}
        materialType={selectedMaterial}
        priceHistory={materialPriceHistory[selectedMaterial]}
        currentPrice={materialPrices[selectedMaterial]?.currentPrice || MATERIAL_CONFIGS[selectedMaterial].basePrice}
      />
    </div>
  );
};

export default StrategyPhase;

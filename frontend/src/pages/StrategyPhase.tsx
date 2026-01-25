import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import {
  MaterialType,
  MATERIAL_CONFIGS,
  RelationshipType,
} from '@shared/types';
import { MATERIAL_DISPLAY, RELATIONSHIP_DISPLAY, MAINTENANCE_OPTIONS } from '@/data/constants';
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
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'material' | 'relationship'>('material');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>(MaterialType.CEMENT);
  const [tradeAmount, setTradeAmount] = useState<number>(10);
  const [selectedRelationship, setSelectedRelationship] = useState<RelationshipType>(RelationshipType.CLIENT);
  const [tradeMessage, setTradeMessage] = useState<string>('');
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('');
  const [showPriceChart, setShowPriceChart] = useState(false);

  const handleTrade = (type: 'buy' | 'sell') => {
    const result = type === 'buy'
      ? buyMaterial(selectedMaterial, tradeAmount)
      : sellMaterial(selectedMaterial, tradeAmount);

    setTradeMessage(result.message);
    setTimeout(() => setTradeMessage(''), 3000);
  };

  const handleMaintain = (method: 'dinner' | 'gift' | 'favor' | 'solidarity') => {
    const result = maintainRelationship(selectedRelationship, method);
    setMaintenanceMessage(result.message);
    setTimeout(() => setMaintenanceMessage(''), 3000);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* 顶部装饰条 */}
      <div className="h-1 bg-gradient-to-r from-brand-500 via-engineering-safety to-brand-600"></div>

      {/* 顶部导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={() => navigate('/game')}
              className="flex items-center space-x-2 text-slate-600 hover:text-brand-600 transition-colors group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded px-2 py-1 -ml-2 active:scale-95"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span className="text-sm font-medium">返回游戏</span>
            </button>

            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-base font-bold text-slate-800 flex items-center">
                <span className="mr-2">📊</span>
                策略阶段
              </h1>
            </div>

            <button
              onClick={() => {
                finishQuarter();
                navigate('/settlement');
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-feishu cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-95"
            >
              <span>完成季度</span>
            </button>
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
            className={`flex-1 py-3 px-4 rounded-feishu font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              activeTab === 'material'
                ? 'bg-brand-500 text-white shadow-feishu'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            🏗️ 材料市场
          </button>
          <button
            onClick={() => setActiveTab('relationship')}
            className={`flex-1 py-3 px-4 rounded-feishu font-medium transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${
              activeTab === 'relationship'
                ? 'bg-brand-500 text-white shadow-feishu'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            🤝 关系维护
          </button>
        </div>

        {/* 材料市场 */}
        {activeTab === 'material' && (
          <div className="bg-white rounded-feishu-lg shadow-feishu p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">材料市场</h2>
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
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{display.icon}</div>
                      <div className="text-sm font-medium">{display.label}</div>
                      <div className={`text-sm font-bold ${price?.trend === 'up' ? 'text-red-600' : price?.trend === 'down' ? 'text-green-600' : 'text-slate-700'}`}>
                        {price?.currentPrice || config.basePrice} {config.unit}
                      </div>
                      <div className={`text-xs ${price?.trend === 'up' ? 'text-red-500' : price?.trend === 'down' ? 'text-green-500' : 'text-slate-400'}`}>
                        {price?.trend === 'up' ? '↑' : price?.trend === 'down' ? '↓' : '─'}
                        {price?.priceChange ? `${price.priceChange > 0 ? '+' : ''}${price.priceChange}%` : '0%'}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        库存: {inventory[type]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 交易操作 */}
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
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTrade('buy')}
                    disabled={stats.cash < (materialPrices[selectedMaterial]?.currentPrice || MATERIAL_CONFIGS[selectedMaterial].basePrice) * tradeAmount}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 text-white rounded-feishu cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed active:scale-95"
                  >
                    买入
                  </button>
                  <button
                    onClick={() => handleTrade('sell')}
                    disabled={inventory[selectedMaterial] < tradeAmount}
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
          </div>
        )}

        {/* 关系维护 */}
        {activeTab === 'relationship' && (
          <div className="bg-white rounded-feishu-lg shadow-feishu p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">关系维护</h2>

            {/* 关系选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">选择关系对象</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.values(RelationshipType).map((type) => {
                  const display = RELATIONSHIP_DISPLAY[type];
                  const value = relationships[type];
                  const level = getRelationshipLevel(value);
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedRelationship(type)}
                      className={`p-4 rounded-feishu border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                        selectedRelationship === type
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl">{display.icon}</div>
                        <div className={`text-sm font-medium ${level.color}`}>{level.label}</div>
                      </div>
                      <div className="text-sm font-medium">{display.label}</div>
                      <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${
                            value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-blue-500' : value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${value}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">关系值: {value}/100</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 维护方式 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(MAINTENANCE_OPTIONS).map(([key, option]) => {
                const canAfford = stats.cash >= option.cost;
                return (
                  <button
                    key={key}
                    onClick={() => handleMaintain(key as 'dinner' | 'gift' | 'favor' | 'solidarity')}
                    disabled={!canAfford}
                    className={`p-4 rounded-feishu border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:cursor-not-allowed active:scale-95 ${
                      canAfford
                        ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                        : 'bg-slate-100 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <div className="text-sm font-medium mb-2">{option.name}</div>

                    {/* 花费和收获 */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">💰花费</span>
                        <span className={`font-bold ${canAfford ? 'text-red-600' : 'text-red-400'}`}>
                          -{formatAmount(option.cost)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">🤝关系</span>
                        <span className="font-bold text-green-600">
                          +{option.relationshipGain}
                        </span>
                      </div>
                      {'healthCost' in option && option.healthCost && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">❤️健康</span>
                          <span className="font-bold text-red-500">
                            -{option.healthCost}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

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

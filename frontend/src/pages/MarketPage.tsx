import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { MaterialType } from '@shared/types';
import { MATERIAL_DISPLAY } from '@/data/constants';

type TabType = MaterialType;

export function MarketPage() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<TabType>(MaterialType.CEMENT);
  const [tradeAmount, setTradeAmount] = useState<string>('1');

  const materialPrices = useGameStoreNew((state) => state.materialPrices);
  const inventory = useGameStoreNew((state) => state.inventory);
  const stats = useGameStoreNew((state) => state.stats);
  const materialPriceHistory = useGameStoreNew((state) => state.materialPriceHistory);
  const actionPoints = useGameStoreNew((state) => state.actionPoints);
  const maxActionPoints = useGameStoreNew((state) => state.maxActionPoints);
  const buyMaterial = useGameStoreNew((state) => state.buyMaterial);
  const sellMaterial = useGameStoreNew((state) => state.sellMaterial);
  const finishQuarter = useGameStoreNew((state) => state.finishQuarter);
  const generatePricePrediction = useGameStoreNew((state) => state.generatePricePrediction);

  const currentMaterial = selectedTab;
  const display = MATERIAL_DISPLAY[currentMaterial];
  const price = materialPrices[currentMaterial];
  const currentInventory = inventory[currentMaterial];
  const priceHistory = materialPriceHistory[currentMaterial] || [];

  // 计算最大可买数量
  const maxBuyable = Math.floor(stats.cash / price.currentPrice);

  const handleFinishQuarter = () => {
    if (actionPoints > 0 && actionPoints < maxActionPoints) {
      if (!confirm(`还有 ${actionPoints} 点行动点未使用，确定要完成本季度吗？`)) {
        return;
      }
    }
    finishQuarter();
    navigate('/game-new/settlement');
  };

  const handleTrade = (amount: number) => {
    if (amount > 0) {
      const result = buyMaterial(currentMaterial, amount);
      alert(result.message);
      if (!result.success) return;
    } else if (amount < 0) {
      const result = sellMaterial(currentMaterial, Math.abs(amount));
      alert(result.message);
      if (!result.success) return;
    }
    setTradeAmount('1');
  };

  // 计算价格统计
  const prices = priceHistory; // priceHistory 是 number[]
  const maxPrice = prices.length > 0 ? Math.max(...prices) : price.currentPrice;
  const minPrice = prices.length > 0 ? Math.min(...prices) : price.currentPrice;
  const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : price.currentPrice;

  // 计算盈亏
  const profitPerUnit = price.currentPrice - avgPrice;
  const totalProfit = profitPerUnit * currentInventory;

  // 折线图颜色：比前一天高用红色，低用绿色
  const getLineColor = () => {
    if (priceHistory.length < 2) return '#94a3b8';
    const first = priceHistory[0];
    const last = priceHistory[priceHistory.length - 1];
    return last > first ? '#ef4444' : last < first ? '#22c55e' : '#94a3b8';
  };

  const getPointColor = (index: number) => {
    if (index === 0) return '#94a3b8';
    const prev = priceHistory[index - 1];
    const curr = priceHistory[index];
    return curr > prev ? '#ef4444' : curr < prev ? '#22c55e' : '#94a3b8';
  };

  // 计算Y轴刻度
  const yTicks = 5;
  const yAxisRange = maxPrice - minPrice || 1;
  const yAxisSteps = Array.from({ length: yTicks }, (_, i) => {
    const value = maxPrice - (i * yAxisRange / (yTicks - 1));
    return Math.round(value);
  });

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
        <h1 className="text-2xl font-bold text-slate-900 mb-4">材料市场</h1>

        {/* 现金显示 */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 flex items-center justify-between shadow-sm">
          <span className="text-sm text-slate-600">💰 可用资金</span>
          <span className={`font-bold ${stats.cash < 10000 ? 'text-red-600' : 'text-emerald-600'}`}>
            {stats.cash.toLocaleString()}
          </span>
        </div>

        {/* 商品 Tab */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {Object.values(MaterialType).map((type) => {
            const d = MATERIAL_DISPLAY[type];
            const isSelected = selectedTab === type;
            return (
              <button
                key={type}
                onClick={() => {
                  setSelectedTab(type);
                  setTradeAmount('1');
                }}
                className={`
                  flex-1 min-w-[70px] py-2 px-3 rounded-lg text-center transition-all
                  ${isSelected
                    ? 'bg-brand-500 text-white font-bold shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }
                `}
              >
                <div className="text-lg">{d.icon}</div>
                <div className="text-xs mt-1">{d.shortLabel}</div>
              </button>
            );
          })}
        </div>

        {/* 当前商品信息 */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{display.icon}</span>
              <div>
                <div className="font-bold text-lg text-slate-900">{display.label}</div>
                <div className={`text-xs flex items-center gap-1 ${
                  price.trend === 'up' ? 'text-red-500' :
                  price.trend === 'down' ? 'text-emerald-500' :
                  'text-slate-400'
                }`}>
                  {price.trend === 'up' && '↑'}
                  {price.trend === 'down' && '↓'}
                  {price.trend === 'stable' && '→'}
                  {Math.abs(price.priceChange)}%
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900">{price.currentPrice}</div>
              <div className="text-xs text-slate-500">元/吨</div>
            </div>
          </div>

          {/* 价格统计 */}
          <div className="grid grid-cols-3 gap-2 text-xs mb-3">
            <div className="text-center p-2 bg-slate-50 rounded border border-slate-200">
              <div className="text-slate-500">最高</div>
              <div className="text-red-500 font-bold">{maxPrice}</div>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded border border-slate-200">
              <div className="text-slate-500">平均</div>
              <div className="text-slate-900 font-bold">{avgPrice}</div>
            </div>
            <div className="text-center p-2 bg-slate-50 rounded border border-slate-200">
              <div className="text-slate-500">最低</div>
              <div className="text-emerald-500 font-bold">{minPrice}</div>
            </div>
          </div>

          {/* 持仓信息 */}
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
            <div>
              <div className="text-xs text-slate-500">持仓</div>
              <div className="text-lg font-bold text-slate-900">{currentInventory} 吨</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-500">持仓盈亏</div>
              <div className={`text-lg font-bold ${totalProfit >= 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 价格预测 */}
          {(() => {
            const prediction = generatePricePrediction(currentMaterial);
            return (
              <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                <div className="text-xs text-slate-500 mb-2">📊 价格预测（准确率：{prediction.accuracy}%）</div>
                <div className="text-sm font-medium mb-1">
                  预测：{prediction.trend === 'up' ? '上涨 📈' : prediction.trend === 'down' ? '下跌 📉' : '持平 ➡️'}
                </div>
                <div className="text-xs text-slate-600">
                  预测价格区间：{prediction.minPrice} - {prediction.maxPrice} 元/吨
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  ⚡ 特殊事件概率：+{prediction.eventChance}%（幸运加成）
                </div>
              </div>
            );
          })()}
        </div>

        {/* 价格走势图 */}
        {priceHistory.length > 0 && (
          <div className="bg-white rounded-xl p-4 mb-4 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 mb-3">价格走势</h3>
            <div className="h-36 relative">
              <svg className="w-full h-full" viewBox={`0 0 ${Math.max(priceHistory.length - 1, 1) * 50} 100`} preserveAspectRatio="none">
                {/* Y轴刻度线和标签 */}
                {yAxisSteps.map((value, i) => {
                  const y = (i / (yTicks - 1)) * 80 + 10;
                  return (
                    <g key={i}>
                      <line x1="0" y1={y} x2="100%" y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4"/>
                      <text x="0" y={y + 3} fill="#94a3b8" fontSize="8" className="text-[8px]">
                        {value}
                      </text>
                    </g>
                  );
                })}

                {/* 折线 */}
                {priceHistory.length > 1 && (
                  <polyline
                    fill="none"
                    stroke={getLineColor()}
                    strokeWidth="2"
                    points={priceHistory.map((priceVal, i) => {
                      const x = i * 50;
                      const range = maxPrice - minPrice || 1;
                      const y = 100 - ((priceVal - minPrice) / range) * 80 - 10;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                )}

                {/* 数据点 */}
                {priceHistory.map((priceVal, i) => {
                  const x = i * 50;
                  const range = maxPrice - minPrice || 1;
                  const y = 100 - ((priceVal - minPrice) / range) * 80 - 10;
                  const isLast = i === priceHistory.length - 1;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={isLast ? 4 : 2}
                      fill={isLast ? '#1f2937' : getPointColor(i)}
                      stroke={isLast ? '#fff' : undefined}
                      strokeWidth={isLast ? 2 : undefined}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        )}

        {/* 交易操作 */}
        <div className="bg-white rounded-xl p-4 mb-4 border border-slate-200 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-3">交易</h3>

          {/* 数量输入 */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                min="1"
                max={maxBuyable}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-slate-500 text-sm">吨</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              最大可买: {maxBuyable} 吨 | 持仓: {currentInventory} 吨
            </div>
          </div>

          {/* 快捷数量按钮 */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[1, 10, 50, 100].map((qty) => (
              <button
                key={qty}
                onClick={() => setTradeAmount(qty.toString())}
                className="py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-all text-slate-700"
              >
                {qty}
              </button>
            ))}
          </div>

          {/* 买入卖出按钮 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                const amount = parseInt(tradeAmount) || 0;
                if (amount <= 0) return alert('请输入有效数量');
                if (amount > maxBuyable) return alert('现金不足');
                handleTrade(amount);
              }}
              disabled={maxBuyable <= 0}
              className={`
                py-3 rounded-lg font-bold transition-all
                ${maxBuyable > 0
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              买入
            </button>
            <button
              onClick={() => {
                const amount = parseInt(tradeAmount) || 0;
                if (amount <= 0) return alert('请输入有效数量');
                if (amount > currentInventory) return alert('持仓不足');
                handleTrade(-amount);
              }}
              disabled={currentInventory <= 0}
              className={`
                py-3 rounded-lg font-bold transition-all
                ${currentInventory > 0
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }
              `}
            >
              卖出
            </button>
          </div>
        </div>

        {/* 完成本季度按钮 */}
        <div className="mt-4">
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

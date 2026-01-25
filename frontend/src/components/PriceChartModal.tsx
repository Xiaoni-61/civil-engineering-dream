import { MaterialType, MATERIAL_CONFIGS } from '@shared/types';
import { MATERIAL_DISPLAY } from '@/data/constants';

interface PriceChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialType: MaterialType;
  priceHistory: number[];
  currentPrice: number;
}

const PriceChartModal: React.FC<PriceChartModalProps> = ({
  isOpen,
  onClose,
  materialType,
  priceHistory,
  currentPrice,
}) => {
  if (!isOpen) return null;

  const display = MATERIAL_DISPLAY[materialType];
  const config = MATERIAL_CONFIGS[materialType];

  // 计算图表参数
  const minPrice = Math.min(...priceHistory, currentPrice) * 0.9;
  const maxPrice = Math.max(...priceHistory, currentPrice) * 1.1;
  const priceRange = maxPrice - minPrice;

  // 计算点的坐标
  const chartWidth = 400;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const allPrices = [...priceHistory, currentPrice];
  const points = allPrices.map((price, index) => {
    const x = padding.left + (index / (allPrices.length - 1)) * plotWidth;
    const y = padding.top + plotHeight - ((price - minPrice) / priceRange) * plotHeight;
    return { x, y, price };
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-feishu-lg shadow-feishu-xl max-w-2xl w-full animate-scale-in">
        {/* 标题 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center">
            <span className="text-2xl mr-2">{display.icon}</span>
            <h2 className="text-lg font-bold text-slate-800">{display.label}价格走势</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6">
          {/* 统计信息 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 rounded-feishu p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">当前价格</div>
              <div className="text-lg font-bold text-brand-600">{currentPrice} {config.unit}</div>
            </div>
            <div className="bg-slate-50 rounded-feishu p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">历史最低</div>
              <div className="text-lg font-bold text-green-600">{Math.min(...priceHistory)} {config.unit}</div>
            </div>
            <div className="bg-slate-50 rounded-feishu p-3 text-center">
              <div className="text-xs text-slate-500 mb-1">历史最高</div>
              <div className="text-lg font-bold text-red-600">{Math.max(...priceHistory)} {config.unit}</div>
            </div>
          </div>

          {/* SVG 图表 */}
          <div className="bg-slate-50 rounded-feishu p-4">
            <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
              {/* Y轴标签 */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const price = minPrice + priceRange * (1 - ratio);
                const y = padding.top + ratio * plotHeight;
                return (
                  <g key={ratio}>
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      className="text-xs fill-slate-500 text-right"
                    >
                      {Math.round(price)}
                    </text>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      className="stroke-slate-200"
                      strokeWidth={1}
                    />
                  </g>
                );
              })}

              {/* 折线 */}
              <polyline
                points={points.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke={display.color}
                strokeWidth={2}
                className="drop-shadow-sm"
              />

              {/* 数据点 */}
              {points.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill={display.color}
                  className="hover:r-6 transition-all cursor-pointer"
                >
                  <title>
                    季度 {index + 1}: {point.price} {config.unit}
                  </title>
                </circle>
              ))}

              {/* 当前价格标注 */}
              <text
                x={points[points.length - 1].x + 10}
                y={points[points.length - 1].y + 4}
                className="text-xs fill-slate-600 font-medium"
              >
                当前: {currentPrice}
              </text>

              {/* X轴标签 */}
              <text
                x={padding.left}
                y={chartHeight - 5}
                className="text-xs fill-slate-500"
              >
                Q1
              </text>
              <text
                x={chartWidth - padding.right - 10}
                y={chartHeight - 5}
                className="text-xs fill-slate-500 text-anchor-end"
              >
                当前
              </text>
            </svg>
          </div>

          {/* 价格变化说明 */}
          {priceHistory.length > 1 && (() => {
            const lastPrice = priceHistory[priceHistory.length - 1];
            const change = currentPrice - lastPrice;
            const changePercent = ((change / lastPrice) * 100).toFixed(1);
            const isUp = change >= 0;

            return (
              <div className="mt-4 flex items-center justify-center">
                <span className="text-sm text-slate-600 mr-2">相比上季度：</span>
                <span className={`text-sm font-bold ${isUp ? 'text-red-600' : 'text-green-600'}`}>
                  {isUp ? '↑' : '↓'} {Math.abs(change)} {config.unit} ({changePercent}%)
                </span>
              </div>
            );
          })()}
        </div>

        {/* 关闭按钮 */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-feishu cursor-pointer transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceChartModal;

/**
 * 股票风格的价格走势图组件
 * 特点：
 * - 动态 Y 轴自适应
 * - 渐变填充
 * - 十字光标交互
 * - 平滑触摸滑动
 */

import { useState, useRef } from 'react';
import { MaterialType } from '@shared/types';

interface StockChartProps {
  priceHistory: number[];
  currentPrice: number;
  costBasis: number;
  hasInventory: boolean;
  materialType: MaterialType;
  materialName: string;
}

export function StockChart({
  priceHistory,
  currentPrice,
  costBasis,
  hasInventory,
  materialName,
}: StockChartProps) {
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0); // 像素偏移，支持平滑滚动
  const [crosshair, setCrosshair] = useState<{ x: number; y: number; price: number; index: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 配置
  const MAX_VISIBLE_POINTS = 30; // 最多显示30个数据点
  const POINT_WIDTH = 20; // 每个数据点的宽度（px）
  const CHART_HEIGHT = 400; // 图表高度
  const PADDING = { top: 20, right: 60, bottom: 20, left: 10 };
  const CHART_WIDTH = MAX_VISIBLE_POINTS * POINT_WIDTH;

  // 计算可见数据窗口
  const getVisibleWindow = () => {
    if (priceHistory.length === 0) return { data: [], startIndex: 0, endIndex: 0 };

    // 计算基于像素偏移的数据索引
    const offsetInPoints = Math.floor(scrollOffset / POINT_WIDTH);
    const endIndex = Math.max(0, priceHistory.length - 1 - offsetInPoints);
    const startIndex = Math.max(0, endIndex - MAX_VISIBLE_POINTS + 1);

    return {
      data: priceHistory.slice(startIndex, endIndex + 1),
      startIndex,
      endIndex,
    };
  };

  const { data: visibleData, startIndex } = getVisibleWindow();

  // 动态计算 Y 轴范围
  const getYAxisRange = () => {
    if (visibleData.length === 0) {
      return { min: currentPrice - 10, max: currentPrice + 10 };
    }

    let min = Math.min(...visibleData);
    let max = Math.max(...visibleData);

    // 如果有持仓，确保成本价在范围内
    if (hasInventory && costBasis > 0) {
      min = Math.min(min, costBasis);
      max = Math.max(max, costBasis);
    }

    // 添加 15% padding
    const range = max - min;
    const padding = range * 0.15 || 10;

    return {
      min: Math.floor(min - padding),
      max: Math.ceil(max + padding),
    };
  };

  const yRange = getYAxisRange();
  const yScale = (price: number) => {
    const ratio = (yRange.max - price) / (yRange.max - yRange.min);
    return PADDING.top + ratio * (CHART_HEIGHT - PADDING.top - PADDING.bottom);
  };

  // 生成数据点坐标
  const dataPoints = visibleData.map((price, i) => ({
    x: PADDING.left + i * POINT_WIDTH,
    y: yScale(price),
    price,
    index: startIndex + i,
  }));

  // 生成折线路径
  const linePath = dataPoints.length > 0
    ? `M ${dataPoints.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  // 生成渐变填充路径
  const areaPath = dataPoints.length > 0
    ? `${linePath} L ${dataPoints[dataPoints.length - 1].x},${CHART_HEIGHT - PADDING.bottom} L ${dataPoints[0].x},${CHART_HEIGHT - PADDING.bottom} Z`
    : '';

  // 判断涨跌（相对于第一个数据点）
  const isRising = dataPoints.length > 1 && dataPoints[dataPoints.length - 1].price > dataPoints[0].price;

  // 成本价 Y 坐标
  const costBasisY = hasInventory && costBasis > 0 ? yScale(costBasis) : null;

  // Y 轴刻度
  const yTicks = 5;
  const yAxisSteps = Array.from({ length: yTicks }, (_, i) => {
    const value = yRange.max - (i * (yRange.max - yRange.min) / (yTicks - 1));
    return { value: Math.round(value), y: yScale(value) };
  });

  // 触摸滑动处理
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;

    const touchX = e.touches[0].clientX;
    const diff = touchStartX - touchX;

    // 更新滚动偏移（像素级）
    const newOffset = Math.max(0, scrollOffset + diff);
    const maxOffset = Math.max(0, (priceHistory.length - MAX_VISIBLE_POINTS) * POINT_WIDTH);

    setScrollOffset(Math.min(newOffset, maxOffset));
    setTouchStartX(touchX);
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };

  // 点击/长按显示十字光标
  const handleChartClick = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;

    // 找到最近的数据点
    const closestPoint = dataPoints.reduce((closest, point) => {
      const dist = Math.abs(point.x - x);
      return dist < Math.abs(closest.x - x) ? point : closest;
    }, dataPoints[0]);

    if (closestPoint) {
      setCrosshair({
        x: closestPoint.x,
        y: closestPoint.y,
        price: closestPoint.price,
        index: closestPoint.index,
      });
    }
  };

  const handleChartLeave = () => {
    setCrosshair(null);
  };

  // 快速跳转到最新
  const jumpToLatest = () => {
    setScrollOffset(0);
  };

  const canScrollLeft = scrollOffset < (priceHistory.length - MAX_VISIBLE_POINTS) * POINT_WIDTH;
  const canScrollRight = scrollOffset > 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 shadow-2xl">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-lg">{materialName} 价格走势</h3>
          <div className="text-slate-400 text-xs mt-1">
            {priceHistory.length > 0 && `共 ${priceHistory.length} 个季度数据`}
          </div>
        </div>
        <div className="text-right">
          <div className="text-slate-400 text-xs">当前价</div>
          <div className={`text-2xl font-bold ${isRising ? 'text-red-500' : 'text-green-500'}`}>
            {currentPrice}
          </div>
        </div>
      </div>

      {/* 图表主体 */}
      <div
        className="relative bg-slate-950 rounded-xl overflow-hidden"
        style={{ height: `${CHART_HEIGHT}px` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseLeave={handleChartLeave}
      >
        <svg
          ref={svgRef}
          width="100%"
          height={CHART_HEIGHT}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          preserveAspectRatio="none"
          className="touch-none"
          onClick={handleChartClick}
          onTouchStart={handleChartClick}
        >
          {/* 定义渐变 */}
          <defs>
            <linearGradient id="areaGradientRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="areaGradientGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Y 轴网格线 */}
          {yAxisSteps.map((tick, i) => (
            <g key={i}>
              <line
                x1={PADDING.left}
                y1={tick.y}
                x2={CHART_WIDTH - PADDING.right}
                y2={tick.y}
                stroke="#334155"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={CHART_WIDTH - PADDING.right + 5}
                y={tick.y + 4}
                fill="#94a3b8"
                fontSize="11"
                fontWeight="500"
              >
                {tick.value}
              </text>
            </g>
          ))}

          {/* 成本价线 */}
          {costBasisY !== null && (
            <>
              <line
                x1={PADDING.left}
                y1={costBasisY}
                x2={CHART_WIDTH - PADDING.right}
                y2={costBasisY}
                stroke="#f59e0b"
                strokeWidth="2"
                strokeDasharray="8 4"
              />
              <rect
                x={CHART_WIDTH - PADDING.right - 50}
                y={costBasisY - 12}
                width="48"
                height="20"
                fill="#f59e0b"
                rx="4"
              />
              <text
                x={CHART_WIDTH - PADDING.right - 26}
                y={costBasisY + 2}
                textAnchor="middle"
                fill="#000"
                fontSize="11"
                fontWeight="bold"
              >
                成本 {costBasis}
              </text>
            </>
          )}

          {/* 渐变填充 */}
          {dataPoints.length > 0 && (
            <path
              d={areaPath}
              fill={isRising ? 'url(#areaGradientRed)' : 'url(#areaGradientGreen)'}
            />
          )}

          {/* 折线 */}
          {dataPoints.length > 0 && (
            <path
              d={linePath}
              fill="none"
              stroke={isRising ? '#ef4444' : '#22c55e'}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 数据点 */}
          {dataPoints.map((point, i) => {
            const isLast = i === dataPoints.length - 1;
            return (
              <circle
                key={i}
                cx={point.x}
                cy={point.y}
                r={isLast ? 6 : 3}
                fill={isLast ? '#fff' : isRising ? '#ef4444' : '#22c55e'}
                stroke={isLast ? (isRising ? '#ef4444' : '#22c55e') : undefined}
                strokeWidth={isLast ? 2 : undefined}
              />
            );
          })}

          {/* 十字光标 */}
          {crosshair && (
            <g>
              {/* 竖线 */}
              <line
                x1={crosshair.x}
                y1={PADDING.top}
                x2={crosshair.x}
                y2={CHART_HEIGHT - PADDING.bottom}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              {/* 横线 */}
              <line
                x1={PADDING.left}
                y1={crosshair.y}
                x2={CHART_WIDTH - PADDING.right}
                y2={crosshair.y}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              {/* 价格标签 */}
              <rect
                x={crosshair.x - 30}
                y={crosshair.y - 25}
                width="60"
                height="20"
                fill="#1e293b"
                stroke="#94a3b8"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={crosshair.x}
                y={crosshair.y - 11}
                textAnchor="middle"
                fill="#fff"
                fontSize="12"
                fontWeight="bold"
              >
                {crosshair.price}
              </text>
              {/* 交点圆 */}
              <circle
                cx={crosshair.x}
                cy={crosshair.y}
                r="5"
                fill="#fff"
                stroke={isRising ? '#ef4444' : '#22c55e'}
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* 左右滑动提示 */}
        {priceHistory.length > MAX_VISIBLE_POINTS && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-slate-300">
            ← 左右滑动查看历史 →
          </div>
        )}
      </div>

      {/* 控制栏 */}
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => setScrollOffset(prev => Math.min(prev + POINT_WIDTH * 5, (priceHistory.length - MAX_VISIBLE_POINTS) * POINT_WIDTH))}
          disabled={!canScrollLeft}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            canScrollLeft
              ? 'bg-slate-700 text-white hover:bg-slate-600 active:scale-95'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          ← 更早
        </button>

        <div className="text-slate-400 text-xs">
          {scrollOffset > 0 && `回看 ${Math.floor(scrollOffset / POINT_WIDTH)} 季度`}
        </div>

        <button
          onClick={jumpToLatest}
          disabled={!canScrollRight}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            canScrollRight
              ? 'bg-slate-700 text-white hover:bg-slate-600 active:scale-95'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          最新 →
        </button>
      </div>

      {/* 数据信息 */}
      {crosshair && (
        <div className="mt-3 bg-slate-800 rounded-lg p-3 text-sm">
          <div className="flex items-center justify-between text-slate-300">
            <span>第 {crosshair.index + 1} 季度</span>
            <span className="font-mono font-bold text-white">{crosshair.price} 元</span>
          </div>
          {hasInventory && costBasis > 0 && (
            <div className={`mt-2 text-xs ${crosshair.price >= costBasis ? 'text-red-400' : 'text-green-400'}`}>
              {crosshair.price >= costBasis ? '盈利' : '亏损'} {Math.abs(crosshair.price - costBasis)} 元/单位
            </div>
          )}
        </div>
      )}
    </div>
  );
}

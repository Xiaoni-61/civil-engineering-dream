/**
 * 状态条组件 - 飞书风格
 */

import { memo } from 'react';
import { PlayerStats } from '@shared/types';
import { STAT_DISPLAY } from '@/data/constants';

interface StatusBarProps {
  stats: PlayerStats;
  round: number;
  maxRounds: number;
}

interface StatItemProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  dangerThreshold: number;
}

const StatItem: React.FC<StatItemProps> = memo(({
  label,
  value,
  icon,
  color,
  dangerThreshold,
}) => {
  const isDanger = value <= dangerThreshold;
  const percentage = Math.max(0, Math.min(100, value));

  // 根据数值确定状态
  const getStatusColor = () => {
    if (isDanger) return 'text-red-600';
    if (value >= 80) return 'text-emerald-600';
    if (value >= 50) return 'text-slate-700';
    return 'text-amber-600';
  };

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className={`w-7 h-7 rounded-feishu flex items-center justify-center text-base transition-transform group-hover:scale-110 ${
            isDanger ? 'bg-red-50 animate-pulse' : 'bg-slate-50'
          }`}>
            {icon}
          </div>
          <span className={`text-sm font-medium transition-colors ${getStatusColor()}`}>
            {label}
          </span>
        </div>
        <span className={`text-base font-bold tabular-nums ${getStatusColor()}`}>
          {value}
        </span>
      </div>

      {/* 进度条容器 */}
      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
        {/* 背景网格效果 */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 11px)'
        }}></div>

        {/* 进度条 */}
        <div
          className={`relative h-full rounded-full transition-all duration-500 ease-out ${
            isDanger ? 'animate-pulse' : ''
          }`}
          style={{
            width: `${percentage}%`,
            backgroundColor: isDanger ? '#EF4444' : color,
            boxShadow: isDanger ? '0 0 8px rgba(239, 68, 68, 0.4)' : `0 0 4px ${color}40`,
          }}
        >
          {/* 进度条光泽效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
      </div>
    </div>
  );
});

StatItem.displayName = 'StatItem';

const StatusBar: React.FC<StatusBarProps> = memo(({ stats, round, maxRounds }) => {
  // 计算完成进度百分比
  const roundProgress = (round / maxRounds) * 100;

  return (
    <div className="bg-white rounded-feishu-lg shadow-feishu p-5 animate-slide-up">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center">
            <span className="mr-2">📊</span>
            项目状态
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Project Status</p>
        </div>

        <div className="text-right">
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold text-brand-600 tabular-nums">{round}</span>
            <span className="text-sm text-slate-400">/</span>
            <span className="text-sm text-slate-500 tabular-nums">{maxRounds}</span>
          </div>
          <p className="text-xs text-slate-500">回合</p>
        </div>
      </div>

      {/* 回合进度条 */}
      <div className="mb-6 p-3 bg-brand-50/50 rounded-feishu border border-brand-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-brand-700">项目进度</span>
          <span className="text-xs font-bold text-brand-600 tabular-nums">{Math.round(roundProgress)}%</span>
        </div>
        <div className="h-1.5 bg-white rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500"
            style={{ width: `${roundProgress}%` }}
          />
        </div>
      </div>

      {/* 状态指标 */}
      <div className="space-y-4">
        <StatItem
          label={STAT_DISPLAY.cash.label}
          value={stats.cash}
          icon={STAT_DISPLAY.cash.icon}
          color={STAT_DISPLAY.cash.color}
          dangerThreshold={STAT_DISPLAY.cash.dangerThreshold}
        />
        <StatItem
          label={STAT_DISPLAY.health.label}
          value={stats.health}
          icon={STAT_DISPLAY.health.icon}
          color={STAT_DISPLAY.health.color}
          dangerThreshold={STAT_DISPLAY.health.dangerThreshold}
        />
        <StatItem
          label={STAT_DISPLAY.reputation.label}
          value={stats.reputation}
          icon={STAT_DISPLAY.reputation.icon}
          color={STAT_DISPLAY.reputation.color}
          dangerThreshold={STAT_DISPLAY.reputation.dangerThreshold}
        />
        <StatItem
          label={STAT_DISPLAY.progress.label}
          value={stats.progress}
          icon={STAT_DISPLAY.progress.icon}
          color={STAT_DISPLAY.progress.color}
          dangerThreshold={STAT_DISPLAY.progress.dangerThreshold}
        />
        <StatItem
          label={STAT_DISPLAY.quality.label}
          value={stats.quality}
          icon={STAT_DISPLAY.quality.icon}
          color={STAT_DISPLAY.quality.color}
          dangerThreshold={STAT_DISPLAY.quality.dangerThreshold}
        />
      </div>

      {/* 危险警告 */}
      {(stats.cash <= STAT_DISPLAY.cash.dangerThreshold ||
        stats.health <= STAT_DISPLAY.health.dangerThreshold) && (
        <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-feishu animate-pulse">
          <div className="flex items-start space-x-2">
            <span className="text-base flex-shrink-0">⚠️</span>
            <div>
              <p className="text-xs font-semibold text-red-800 mb-0.5">
                危险警告
              </p>
              <p className="text-xs text-red-600 leading-relaxed">
                关键指标过低，请谨慎选择！现金或健康归零将导致游戏失败。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 提示信息 */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <p className="text-xs text-slate-400 leading-relaxed flex items-start">
          <span className="mr-1.5 flex-shrink-0">💡</span>
          <span>保持各项指标平衡是通关的关键</span>
        </p>
      </div>
    </div>
  );
});

StatusBar.displayName = 'StatusBar';

export default StatusBar;

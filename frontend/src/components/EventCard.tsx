/**
 * 事件卡组件 - 飞书风格 + 工程主题
 */

import { memo } from 'react';
import { EventCard as EventCardType, EventOption } from '@shared/types';

interface EventCardProps {
  event: EventCardType;
  onSelectOption: (optionId: string) => void;
  disabled?: boolean;
}

interface OptionButtonProps {
  option: EventOption;
  onSelect: () => void;
  disabled?: boolean;
  index: number;
}

const OptionButton: React.FC<OptionButtonProps> = memo(({ option, onSelect, disabled, index }) => {
  // 为每个选项生成不同的边框颜色
  const borderColors = [
    'hover:border-brand-400',
    'hover:border-engineering-safety',
    'hover:border-status-quality',
  ];

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`group w-full text-left p-4 bg-white border-2 border-slate-200 rounded-feishu
                 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-slate-200
                 enabled:active:scale-[0.98] enabled:hover:shadow-feishu-lg enabled:hover:-translate-y-0.5
                 ${!disabled ? borderColors[index % borderColors.length] : ''}
                 animate-slide-up`}
      style={{ animationDelay: `${0.1 + index * 0.05}s` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-800 leading-relaxed group-enabled:group-hover:text-slate-900">
            {option.text}
          </p>
        </div>
        <div className="ml-3 flex-shrink-0 opacity-0 group-enabled:group-hover:opacity-100 transition-opacity">
          <span className="text-brand-500">→</span>
        </div>
      </div>

      {/* 效果标签 */}
      <div className="flex flex-wrap gap-1.5">
        {option.effects.cash && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            option.effects.cash > 0
              ? 'bg-status-cash/10 text-status-cash border border-status-cash/20'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <span className="mr-1">💰</span>
            {option.effects.cash > 0 ? '+' : ''}{option.effects.cash}
          </span>
        )}
        {option.effects.health && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            option.effects.health > 0
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <span className="mr-1">❤️</span>
            {option.effects.health > 0 ? '+' : ''}{option.effects.health}
          </span>
        )}
        {option.effects.reputation && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            option.effects.reputation > 0
              ? 'bg-status-reputation/10 text-status-reputation border border-status-reputation/20'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <span className="mr-1">⭐</span>
            {option.effects.reputation > 0 ? '+' : ''}{option.effects.reputation}
          </span>
        )}
        {option.effects.progress && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            option.effects.progress > 0
              ? 'bg-status-progress/10 text-status-progress border border-status-progress/20'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <span className="mr-1">📈</span>
            {option.effects.progress > 0 ? '+' : ''}{option.effects.progress}
          </span>
        )}
        {option.effects.quality && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            option.effects.quality > 0
              ? 'bg-status-quality/10 text-status-quality border border-status-quality/20'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <span className="mr-1">🏆</span>
            {option.effects.quality > 0 ? '+' : ''}{option.effects.quality}
          </span>
        )}
      </div>
    </button>
  );
});

OptionButton.displayName = 'OptionButton';

const EventCard: React.FC<EventCardProps> = memo(({ event, onSelectOption, disabled }) => {
  return (
    <div className="bg-white rounded-feishu-lg shadow-feishu-lg overflow-hidden animate-scale-in">
      {/* 顶部装饰条 */}
      <div className="h-1.5 bg-gradient-to-r from-brand-500 via-engineering-safety to-brand-600"></div>

      <div className="p-6">
        {/* 事件头部 */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-xl md:text-2xl font-bold text-slate-800">
                {event.title}
              </h3>

              {/* 标签 */}
              {event.llmEnhanced && (
                <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                  <span className="mr-1">✨</span>
                  AI增强
                </span>
              )}
              {event.isSpecialEvent && (
                <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                  <span className="mr-1">🌟</span>
                  特殊事件
                </span>
              )}
            </div>

            {/* 副标题 */}
            <p className="text-xs text-slate-500">Engineering Challenge</p>
          </div>

          {/* 事件图标 */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-feishu flex items-center justify-center text-2xl shadow-lg ml-4">
            🏗️
          </div>
        </div>

        {/* 事件描述 */}
        <div className="mb-6 p-4 bg-slate-50 rounded-feishu border border-slate-100">
          <p className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        </div>

        {/* 分隔线 */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 text-xs font-medium text-slate-500 bg-white">
              请选择你的应对方式
            </span>
          </div>
        </div>

        {/* 选项列表 */}
        <div className="space-y-3">
          {event.options.map((option, index) => (
            <OptionButton
              key={option.id}
              option={option}
              index={index}
              onSelect={() => onSelectOption(option.id)}
              disabled={disabled}
            />
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-start space-x-2 text-xs text-slate-500">
            <span className="flex-shrink-0">💡</span>
            <p className="leading-relaxed">
              <span className="font-medium text-slate-600">提示：</span>
              仔细权衡每个选项的利弊，考虑当前的资源状况做出明智决策。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;

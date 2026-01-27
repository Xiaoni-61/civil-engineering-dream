import { DecisionEvent } from '@/data/events/eventTypes';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';

interface EventCardProps {
  event: DecisionEvent;
  onSelectOption: (optionId: string) => void;
}

export function EventCard({ event, onSelectOption }: EventCardProps) {
  const stats = useGameStoreNew((state) => state.stats);

  // 过滤出当前属性可以使用的选项
  const availableOptions = event.options.filter(option => {
    if (!option.hidden) return true; // 非隐藏选项始终显示

    // 检查属性要求
    if (option.requiredAbility?.workAbility && stats.workAbility < option.requiredAbility.workAbility) {
      return false;
    }
    if (option.requiredAbility?.luck && stats.luck < option.requiredAbility.luck) {
      return false;
    }

    return true;
  });
  const categoryConfig = {
    professional: {
      label: '🔧 专业问题',
      className: 'bg-blue-100 text-blue-700',
    },
    workplace: {
      label: '💼 职场博弈',
      className: 'bg-purple-100 text-purple-700',
    },
  };

  const config = categoryConfig[event.category];

  return (
    <div className="bg-gradient-to-br from-brand-50 to-engineering-50 border-2 border-brand-200 rounded-xl p-5">
      {/* 事件类别标签 */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2 py-1 rounded-full ${config.className}`}>
          {config.label}
        </span>
      </div>

      {/* 事件标题和描述 */}
      <h3 className="font-bold text-lg mb-2 text-slate-900">{event.title}</h3>
      <p className="text-sm text-slate-700 mb-4">{event.description}</p>

      {/* 背景描述（可选） */}
      {event.flavorText && (
        <p className="text-xs text-slate-500 italic mb-4">{event.flavorText}</p>
      )}

      {/* 选项列表 */}
      <div className="space-y-2">
        {availableOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectOption(option.id)}
            className={`
              w-full py-3 px-4 bg-white border-2 rounded-lg
              ${option.hidden ? 'border-purple-400 bg-purple-50' : 'border-slate-200'}
              hover:bg-brand-50 active:scale-[0.98] transition-all text-left
            `}
          >
            <div className="font-medium text-slate-900">{option.text}</div>
            {option.hidden && (
              <div className="text-xs text-purple-600">✨ 特殊选项</div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

import { DecisionEvent } from '@/data/events/eventTypes';

interface EventCardProps {
  event: DecisionEvent;
  onSelectOption: (optionId: string) => void;
}

export function EventCard({ event, onSelectOption }: EventCardProps) {
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

      {/* 三个选项 */}
      <div className="space-y-2">
        {event.options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelectOption(option.id)}
            className="w-full py-3 px-4 bg-white border-2 border-slate-200 rounded-lg hover:border-brand-400 hover:bg-brand-50 active:scale-[0.98] transition-all text-left"
          >
            <div className="font-medium text-slate-900">{option.text}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

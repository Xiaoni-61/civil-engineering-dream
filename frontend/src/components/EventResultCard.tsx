import { EventResult, RelationshipEffect } from '@/data/events/eventTypes';
import { RELATIONSHIP_DISPLAY } from '@/data/constants';
import { RelationshipType } from '@shared/types';

interface EventResultCardProps {
  result: EventResult;
  onContinue: () => void;
}

function renderEffectItem(label: string, value?: number) {
  if (value === undefined) return null;
  const isPositive = value >= 0;
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-slate-600">{label}</span>
      <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{value.toLocaleString()}
      </span>
    </div>
  );
}

export function EventResultCard({ result, onContinue }: EventResultCardProps) {
  const { effects } = result;

  return (
    <div className="bg-white border-2 border-brand-200 rounded-xl p-5">
      {/* 结果标题 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">📋</span>
        <h3 className="font-bold text-lg text-slate-900">决策结果</h3>
      </div>

      {/* 选择的选项 */}
      <div className="bg-slate-50 rounded-lg p-3 mb-4">
        <div className="text-xs text-slate-500 mb-1">你的选择</div>
        <div className="font-medium text-slate-900">{result.selectedOptionText}</div>
      </div>

      {/* 反馈文字 */}
      <p className="text-sm text-slate-700 mb-4">{result.feedback}</p>

      {/* 影响列表 */}
      <div className="space-y-1 mb-4">
        <div className="text-xs text-slate-500 mb-2">影响详情</div>

        {renderEffectItem('💰 现金', effects.cash)}
        {renderEffectItem('❤️ 健康', effects.health)}
        {renderEffectItem('⭐ 声誉', effects.reputation)}
        {renderEffectItem('📈 进度', effects.progress)}
        {renderEffectItem('📊 质量', effects.quality)}
        {renderEffectItem('📚 工作能力', effects.workAbility)}
        {renderEffectItem('🎲 幸运', effects.luck)}

        {/* 关系影响 */}
        {effects.relationships?.map((rel: RelationshipEffect) => {
          const relInfo = RELATIONSHIP_DISPLAY[rel.type as RelationshipType];
          return (
            <div key={rel.type} className="flex justify-between items-center py-1">
              <span className="text-sm flex items-center gap-1">
                <span>{relInfo.icon}</span>
                <span>{relInfo.label}</span>
              </span>
              <span className={`text-sm font-bold ${rel.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {rel.change >= 0 ? '+' : ''}{rel.change}
              </span>
            </div>
          );
        })}

        {effects.teamMorale !== undefined && renderEffectItem('😊 团队士气', effects.teamMorale)}
        {effects.leadership !== undefined && renderEffectItem('👑 领导力', effects.leadership)}
      </div>

      {/* 继续按钮 */}
      <button
        onClick={onContinue}
        className="w-full py-3 px-6 bg-brand-500 text-white font-bold rounded-lg hover:bg-brand-600 active:scale-[0.98] transition-all"
      >
        继续 →
      </button>
    </div>
  );
}

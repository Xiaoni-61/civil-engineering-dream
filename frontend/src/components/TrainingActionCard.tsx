import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { TRAINING_CONFIG } from '@/data/constants';

interface TrainingActionCardProps {
  trainingType: 'basic_work' | 'advanced_work' | 'basic_luck' | 'advanced_luck';
}

export function TrainingActionCard({ trainingType }: TrainingActionCardProps) {
  const config = TRAINING_CONFIG[trainingType];
  const stats = useGameStoreNew((state) => state.stats);
  const luck = useGameStoreNew((state) => state.stats.luck);
  const currentQuarter = useGameStoreNew((state) => state.currentQuarter);
  const trainingCooldowns = useGameStoreNew((state) => state.trainingCooldowns) || {
    basic_work: 0,
    advanced_work: 0,
    basic_luck: 0,
    advanced_luck: 0,
  };

  // 计算高级训练的成功率
  const successRate = config.successRate === 'formula'
    ? 50 + luck / 2
    : config.successRate;

  // 检查冷却
  const cooldownQuarter = trainingCooldowns[trainingType] || 0;
  const isOnCooldown = cooldownQuarter > 0 && currentQuarter < cooldownQuarter;
  const cooldownRemaining = isOnCooldown ? cooldownQuarter - currentQuarter : 0;

  // 检查资源
  const canAfford = stats.cash >= config.cost.cash && stats.health >= config.cost.health;

  const handleClick = () => {
    if (!canAfford) {
      alert('资源不足');
      return;
    }

    if (isOnCooldown) {
      alert(`该训练需要冷却 ${cooldownRemaining} 个季度`);
      return;
    }

    // TODO: 调用训练执行函数（在 Task 8 实现）
    alert('训练功能将在后续任务中实现');
  };

  const abilityType = trainingType.includes('work') ? 'workAbility' : 'luck';
  const abilityName = abilityType === 'workAbility' ? '工作能力' : '幸运';
  const effectValue = config.effect[abilityType];

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
      <div className="flex justify-between mb-2">
        <div>
          <div className="text-lg font-bold text-slate-900">{config.icon} {config.name}</div>
          <div className="text-sm text-slate-500">
            {trainingType.includes('advanced') ? '高级' : '基础'}训练
          </div>
        </div>
        <div className="text-right">
          <div className="text-green-600 font-bold">
            {abilityName} +{effectValue}
          </div>
          <div className="text-xs text-slate-400">
            成功率: {typeof successRate === 'number' ? `${successRate}%` : '计算中'}
          </div>
        </div>
      </div>

      <div className="flex gap-2 text-sm mb-4">
        <span>💰 -{config.cost.cash}</span>
        <span>❤️ -{config.cost.health}</span>
      </div>

      <button
        onClick={handleClick}
        disabled={!canAfford || isOnCooldown}
        className={`w-full py-2 rounded-lg font-bold transition-all ${
          (!canAfford || isOnCooldown)
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isOnCooldown ? `冷却中 (${cooldownRemaining}季度)` : '开始训练'}
      </button>
    </div>
  );
}

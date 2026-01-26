import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { RelationshipType } from '@shared/types';
import { RELATIONSHIP_DISPLAY, MAINTENANCE_OPTIONS } from '@/data/constants';

type SelectedRelation = { type: RelationshipType; name: string; icon: string } | null;

export function RelationsPage() {
  const navigate = useNavigate();
  const [selectedRelation, setSelectedRelation] = useState<SelectedRelation>(null);

  const relationships = useGameStoreNew((state) => state.relationships);
  const stats = useGameStoreNew((state) => state.stats);
  const maintenanceCount = useGameStoreNew((state) => state.maintenanceCount);
  const getMaxMaintenanceCount = useGameStoreNew((state) => state.getMaxMaintenanceCount);
  const isRelationshipUnlocked = useGameStoreNew((state) => state.isRelationshipUnlocked);
  const maintainRelationship = useGameStoreNew((state) => state.maintainRelationship);
  const actionPoints = useGameStoreNew((state) => state.actionPoints);
  const maxActionPoints = useGameStoreNew((state) => state.maxActionPoints);
  const finishQuarter = useGameStoreNew((state) => state.finishQuarter);

  const maxMaintenance = getMaxMaintenanceCount();
  const maintenanceRemaining = maxMaintenance - maintenanceCount;

  const handleMaintainClick = (type: RelationshipType) => {
    if (!isRelationshipUnlocked(type)) return;
    const display = RELATIONSHIP_DISPLAY[type];
    setSelectedRelation({ type, name: display.label, icon: display.icon });
  };

  const handleMaintain = (method: 'dinner' | 'gift' | 'favor' | 'solidarity') => {
    if (!selectedRelation) return;

    const result = maintainRelationship(selectedRelation.type, method);
    alert(result.message);

    setSelectedRelation(null);
  };

  const handleFinishQuarter = () => {
    if (actionPoints > 0 && actionPoints < maxActionPoints) {
      if (!confirm(`还有 ${actionPoints} 点行动点未使用，确定要完成本季度吗？`)) {
        return;
      }
    }
    finishQuarter();
    navigate('/game-new/settlement');
  };

  const canMaintain = maintenanceRemaining > 0;

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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">关系维护</h1>

        {/* 维护次数显示 */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-slate-600">
            本季度已维护: {maintenanceCount}/{maxMaintenance} 次
          </span>
          {maintenanceRemaining === 0 && (
            <span className="text-xs text-amber-600 font-medium">
              🔒 本季度维护次数已用完
            </span>
          )}
        </div>

        {/* 现金显示 */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 mb-6 flex items-center justify-between">
          <span className="text-sm text-slate-600">💰 现金</span>
          <span className={`font-bold ${stats.cash < 10000 ? 'text-red-600' : 'text-emerald-600'}`}>
            {stats.cash.toLocaleString()}
          </span>
        </div>

        {/* 关系列表 */}
        <div className="space-y-3">
          {Object.values(RelationshipType).map((type) => {
            const display = RELATIONSHIP_DISPLAY[type];
            const value = relationships[type];
            const unlocked = isRelationshipUnlocked(type);

            return (
              <div
                key={type}
                className={`
                  bg-white rounded-xl border-2 p-4 transition-all
                  ${unlocked ? 'border-slate-200' : 'border-slate-100 opacity-60'}
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{display.icon}</span>
                    <span className="font-bold text-slate-900">{display.label}</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${
                      value >= 70 ? 'text-emerald-600' :
                      value >= 40 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {value}
                    </div>
                  </div>
                </div>

                {/* 关系值进度条 */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full transition-all ${
                      value >= 70 ? 'bg-emerald-500' :
                      value >= 40 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>

                {/* 未解锁提示或维护按钮 */}
                {!unlocked ? (
                  <div className="text-center py-3 text-sm text-slate-500 flex items-center justify-center gap-1 bg-slate-50 rounded-lg">
                    <span>🔒</span>
                    <span>未解锁 - {display.unlockHint}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleMaintainClick(type)}
                    disabled={!canMaintain}
                    className={`
                      w-full py-3 px-4 rounded-lg font-medium transition-all
                      ${canMaintain
                        ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700 active:scale-[0.98] shadow-md hover:shadow-lg'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {canMaintain ? '🤝 维护关系' : `本季度维护次数已用完`}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* 完成本季度按钮 */}
        <div className="mt-8">
          <button
            onClick={handleFinishQuarter}
            className="w-full py-4 px-6 bg-gradient-to-r from-brand-600 to-brand-700 text-slate-800 font-bold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] border-2 border-brand-800"
          >
            完成本季度
          </button>
        </div>
      </div>

      {/* 维护方式选择弹窗 */}
      {selectedRelation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedRelation.icon}</span>
                  <h2 className="text-lg font-bold text-slate-900">维护 {selectedRelation.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedRelation(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div className="p-4 space-y-2">
              {Object.entries(MAINTENANCE_OPTIONS).map(([key, option]) => {
                const canAfford = stats.cash >= option.cost;

                return (
                  <button
                    key={key}
                    onClick={() => handleMaintain(key as any)}
                    disabled={!canAfford}
                    className={`
                      w-full p-4 rounded-xl text-left transition-all
                      ${canAfford
                        ? 'bg-white border-2 border-slate-200 hover:border-brand-300 hover:bg-brand-50 active:scale-[0.98]'
                        : 'bg-slate-50 border border-slate-200 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{option.icon}</span>
                        <div>
                          <div className={`font-bold text-lg ${
                            canAfford ? 'text-slate-900' : 'text-slate-400'
                          }`}>
                            {option.name}
                          </div>
                          <div className="text-sm text-slate-600">
                            关系 +{option.relationshipGain}
                            {'healthCost' in option && option.healthCost && ` | 健康 -${option.healthCost}`}
                          </div>
                        </div>
                      </div>
                      <div className={`text-lg font-bold ${
                        canAfford ? 'text-slate-700' : 'text-red-400'
                      }`}>
                        💰 {option.cost.toLocaleString()}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 弹窗底部 */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 rounded-b-2xl">
              <button
                onClick={() => setSelectedRelation(null)}
                className="w-full py-3 px-6 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { PROJECT_COMPLETION } from '@/data/constants';

/**
 * 项目状态卡片组件
 * 显示当前项目的进度和质量
 */
export function ProjectCard() {
  const projectProgress = useGameStoreNew((state) => state.projectProgress);
  const projectQuality = useGameStoreNew((state) => state.projectQuality);

  const minProgress = PROJECT_COMPLETION.minProgress || 80;
  const minQuality = PROJECT_COMPLETION.minQuality || 70;
  const canComplete = projectProgress >= minProgress && projectQuality >= minQuality;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border-2 border-blue-200 shadow-sm">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏗️</span>
          <h3 className="text-base font-bold text-slate-900">当前项目</h3>
        </div>
        {canComplete && (
          <div className="px-2 py-1 bg-green-100 border border-green-300 rounded-full">
            <span className="text-xs font-bold text-green-700">✓ 可完成</span>
          </div>
        )}
      </div>

      {/* 进度条 */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-600">项目进度</span>
          <span className="text-sm font-bold text-blue-600">{projectProgress}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              projectProgress >= minProgress ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${projectProgress}%` }}
          />
        </div>
        {projectProgress < minProgress && (
          <div className="text-xs text-slate-500 mt-1">
            需达到 {minProgress}% 才能完成项目
          </div>
        )}
      </div>

      {/* 质量条 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-slate-600">项目质量</span>
          <span className="text-sm font-bold text-purple-600">{projectQuality}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              projectQuality >= minQuality ? 'bg-green-500' : 'bg-purple-500'
            }`}
            style={{ width: `${projectQuality}%` }}
          />
        </div>
        {projectQuality < minQuality && (
          <div className="text-xs text-slate-500 mt-1">
            需达到 {minQuality}% 才能完成项目
          </div>
        )}
      </div>

      {/* 完成阈值提示 */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <div className="text-xs text-slate-600 flex items-center gap-1">
          <span>📋 完成条件：</span>
          <span className={projectProgress >= minProgress ? 'text-green-600 font-bold' : 'text-slate-500'}>
            进度 ≥ {minProgress}%
          </span>
          <span className="text-slate-400">+</span>
          <span className={projectQuality >= minQuality ? 'text-green-600 font-bold' : 'text-slate-500'}>
            质量 ≥ {minQuality}%
          </span>
        </div>
      </div>
    </div>
  );
}

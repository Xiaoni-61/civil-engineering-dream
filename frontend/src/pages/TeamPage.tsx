import { useNavigate } from 'react-router-dom';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { Rank } from '@shared/types';
import { TeamMemberType } from '@shared/types';
import { RECRUIT_CONFIG } from '@/data/constants';

export function TeamPage() {
  const navigate = useNavigate();
  const rank = useGameStoreNew((state) => state.rank);
  const team = useGameStoreNew((state) => state.team);
  const stats = useGameStoreNew((state) => state.stats);
  const actionPoints = useGameStoreNew((state) => state.actionPoints);
  const maxActionPoints = useGameStoreNew((state) => state.maxActionPoints);
  const recruitMember = useGameStoreNew((state) => state.recruitMember);
  const resolveTeamIssue = useGameStoreNew((state) => state.resolveTeamIssue);
  const finishQuarter = useGameStoreNew((state) => state.finishQuarter);

  const isLateGame = rank === Rank.PROJECT_MANAGER ||
                     rank === Rank.PROJECT_DIRECTOR ||
                     rank === Rank.PARTNER;

  const handleFinishQuarter = () => {
    if (actionPoints > 0 && actionPoints < maxActionPoints) {
      if (!confirm(`还有 ${actionPoints} 点行动点未使用，确定要完成本季度吗？`)) {
        return;
      }
    }
    finishQuarter();
    navigate('/game-new/settlement');
  };

  const handleRecruit = (memberType: TeamMemberType) => {
    const result = recruitMember(memberType);
    alert(result.message);

    // 如果招募成功且行动点足够，可以考虑触发事件
    // 暂时不自动触发，让玩家自己决定
  };

  const handleResolveIssue = (issueId: string) => {
    const result = resolveTeamIssue(issueId);
    alert(result.message);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-52">
      <div className="max-w-md mx-auto px-4">
        {/* 返回按钮 */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-slate-600 hover:text-slate-900 flex items-center gap-1"
        >
          ← 返回
        </button>

        {/* 页面标题 */}
        <h1 className="text-2xl font-bold text-slate-900 mb-6">团队管理</h1>

        {/* 团队系统锁定提示 */}
        {!isLateGame && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6 text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h2 className="text-lg font-bold text-amber-900 mb-2">团队系统未解锁</h2>
            <p className="text-sm text-amber-700">
              晋升到项目经理后，即可组建和管理自己的团队
            </p>
          </div>
        )}

        {/* 领导力卡片 */}
        <div className="bg-white rounded-xl border-2 border-purple-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">👑 领导力</span>
            <span className="text-lg font-bold text-purple-900">{team.leadership}</span>
          </div>
          <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${team.leadership}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">
            团队效率: {team.teamEfficiency}%
          </p>
        </div>

        {/* 团队成员列表 */}
        {isLateGame && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">团队成员 ({team.members.length})</h2>

            {team.members.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <p className="text-slate-500">暂无团队成员</p>
                <p className="text-sm text-slate-400 mt-1">点击下方按钮招募成员</p>
              </div>
            ) : (
              <div className="space-y-3">
                {team.members.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-xl border-2 border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {member.type === TeamMemberType.ENGINEER && '👨‍🔧'}
                          {member.type === TeamMemberType.SALESPERSON && '💼'}
                          {member.type === TeamMemberType.WORKER && '👷'}
                          {member.type === TeamMemberType.DESIGNER && '🎨'}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{member.name}</div>
                          <div className="text-xs text-slate-500">
                            {member.type === TeamMemberType.ENGINEER && '工程师'}
                            {member.type === TeamMemberType.SALESPERSON && '业务员'}
                            {member.type === TeamMemberType.WORKER && '劳务工'}
                            {member.type === TeamMemberType.DESIGNER && '设计师'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-700">
                          技能: {member.skill}/5
                        </div>
                        <div className="text-xs text-slate-500">
                          效率: {member.efficiency}%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">士气: {member.morale}/100</span>
                      <span className="text-slate-600">
                        工资: {member.salary.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 招募按钮 */}
        {isLateGame && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">招募成员</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(RECRUIT_CONFIG).map(([type, config]) => {
                const canAfford = stats.cash >= config.recruitCost;

                return (
                  <button
                    key={type}
                    onClick={() => handleRecruit(type as TeamMemberType)}
                    disabled={!canAfford}
                    className={`
                      p-4 rounded-xl border-2 transition-all
                      ${canAfford
                        ? 'border-purple-200 bg-white hover:border-purple-400 hover:shadow-md active:scale-[0.98]'
                        : 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">
                      {type === TeamMemberType.ENGINEER && '👨‍🔧'}
                      {type === TeamMemberType.SALESPERSON && '💼'}
                      {type === TeamMemberType.WORKER && '👷'}
                      {type === TeamMemberType.DESIGNER && '🎨'}
                    </div>
                    <div className="font-bold text-slate-900">{config.name}</div>
                    <div className={`text-sm ${canAfford ? 'text-slate-600' : 'text-red-600'}`}>
                      💰 {config.recruitCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      工资: {config.baseSalary.toLocaleString()}/季度
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 团队问题 */}
        {isLateGame && team.pendingIssues.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">
              待处理问题 ({team.pendingIssues.length})
            </h2>
            <div className="space-y-3">
              {team.pendingIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="bg-red-50 border-2 border-red-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-red-700">
                      {issue.type === 'conflict' && '⚔️ 冲突'}
                      {issue.type === 'burnout' && '😫 倦怠'}
                      {issue.type === 'mistake' && '❌ 失误'}
                      {issue.type === 'demand' && '📋 诉求'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      issue.severity === 'low' && 'bg-yellow-100 text-yellow-700'}
                      {issue.severity === 'medium' && 'bg-orange-100 text-orange-700'}
                      {issue.severity === 'high' && 'bg-red-100 text-red-700'}
                    `}>
                      {issue.severity === 'low' && '低'}
                      {issue.severity === 'medium' && '中'}
                      {issue.severity === 'high' && '高'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-3">{issue.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      需要领导力: {issue.requiredLeadership}
                    </span>
                    <button
                      onClick={() => handleResolveIssue(issue.id)}
                      className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 active:scale-95 transition-all text-sm font-medium"
                    >
                      解决
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
    </div>
  );
}

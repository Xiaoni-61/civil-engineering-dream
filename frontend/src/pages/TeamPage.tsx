import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { Rank, ActionType } from '@shared/types';
import { TeamMemberType } from '@shared/types';
import { RECRUIT_CONFIG } from '@/data/constants';

// 职业功能说明
const ROLE_INFO = {
  [TeamMemberType.ENGINEER]: {
    icon: '👨‍🔧',
    name: '工程师',
    effect: '项目进度 +4% × 技能',
    desc: '技能越高，项目进度加成越大',
  },
  [TeamMemberType.SALESPERSON]: {
    icon: '💼',
    name: '业务员',
    effect: '项目收益 +2000 × 技能',
    desc: '完成团队项目时获得额外现金',
  },
  [TeamMemberType.WORKER]: {
    icon: '👷',
    name: '劳务工',
    effect: '项目成本 -500 × 技能',
    desc: '降低团队项目的执行成本',
  },
  [TeamMemberType.DESIGNER]: {
    icon: '🎨',
    name: '设计师',
    effect: '项目质量 +2 × 技能',
    desc: '提升项目最终质量分数',
  },
};

export function TeamPage() {
  const navigate = useNavigate();
  const rank = useGameStoreNew((state) => state.rank);
  const team = useGameStoreNew((state) => state.team);
  const stats = useGameStoreNew((state) => state.stats);
  const actionPoints = useGameStoreNew((state) => state.actionPoints);
  const maxActionPoints = useGameStoreNew((state) => state.maxActionPoints);
  const recruitMember = useGameStoreNew((state) => state.recruitMember);
  const resolveTeamIssue = useGameStoreNew((state) => state.resolveTeamIssue);
  const doAction = useGameStoreNew((state) => state.doAction);
  const finishQuarter = useGameStoreNew((state) => state.finishQuarter);

  const [message, setMessage] = useState<string | null>(null);
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  const isLateGame = rank === Rank.PROJECT_MANAGER ||
                     rank === Rank.PROJECT_DIRECTOR ||
                     rank === Rank.PARTNER;

  // 检查低士气警告
  const lowMoraleMembers = team.members.filter(m => m.morale < 30);
  const criticalMoraleMembers = team.members.filter(m => m.morale < 20);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
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

  const handleRecruit = (memberType: TeamMemberType) => {
    if (actionPoints <= 0) {
      alert('行动点已用完');
      return;
    }
    const result = recruitMember(memberType);
    if (result.success) {
      showMessage(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleResolveIssue = (issueId: string) => {
    if (actionPoints <= 0) {
      alert('行动点已用完');
      return;
    }
    const result = resolveTeamIssue(issueId);
    if (result.success) {
      showMessage(`问题已解决！领导力 +${result.rewards?.leadership || 0}`);
    } else {
      alert(result.message);
    }
  };

  const handleTeamAction = (actionType: ActionType) => {
    if (actionPoints <= 0) {
      alert('行动点已用完');
      return;
    }
    const result = doAction(actionType);
    if (result.success) {
      showMessage(result.message);
    } else {
      alert(result.message);
    }
  };

  const canAfford = (cost?: number) => {
    return cost === undefined || stats.cash >= cost;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-52">
      <div className="max-w-md mx-auto px-4">
        {/* 消息提示 */}
        {message && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
            {message}
          </div>
        )}

        {/* 页面标题 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">👥 团队管理</h1>
          {isLateGame && (
            <button
              onClick={() => setShowRoleInfo(true)}
              className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
              title="职业说明"
            >
              ❓
            </button>
          )}
        </div>

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

        {/* 士气警告 */}
        {isLateGame && lowMoraleMembers.length > 0 && (
          <div className={`mb-6 rounded-xl p-4 border-2 ${
            criticalMoraleMembers.length > 0
              ? 'bg-red-50 border-red-300'
              : 'bg-amber-50 border-amber-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚠️</span>
              <span className={`font-bold ${
                criticalMoraleMembers.length > 0 ? 'text-red-700' : 'text-amber-700'
              }`}>
                {criticalMoraleMembers.length > 0 ? '员工可能离职！' : '士气过低警告'}
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-2">
              {criticalMoraleMembers.length > 0
                ? `${criticalMoraleMembers.map(m => m.name).join('、')} 士气低于20，下季度有30%概率离职！`
                : `${lowMoraleMembers.map(m => m.name).join('、')} 士气低于30，请尽快进行团队培训。`
              }
            </p>
            <p className="text-xs text-slate-500">提示：团队培训可以提升士气</p>
          </div>
        )}

        {/* 领导力卡片 */}
        {isLateGame && (
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
        )}

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
                    className={`bg-white rounded-xl border-2 p-4 ${
                      member.morale < 20
                        ? 'border-red-300 bg-red-50'
                        : member.morale < 30
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{ROLE_INFO[member.type].icon}</span>
                        <div>
                          <div className="font-bold text-slate-900">{member.name}</div>
                          <div className="text-xs text-slate-500">{ROLE_INFO[member.type].name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-slate-700">
                          技能: {member.skill}/5
                        </div>
                        <div className="text-xs text-slate-500">
                          工资: {member.salary.toLocaleString()}/季
                        </div>
                      </div>
                    </div>
                    {/* 士气进度条 */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={member.morale < 30 ? 'text-red-600 font-medium' : 'text-slate-500'}>
                          士气: {member.morale}/100
                        </span>
                        {member.morale < 20 && (
                          <span className="text-red-600 font-medium">⚠️ 可能离职</span>
                        )}
                        {member.morale >= 20 && member.morale < 30 && (
                          <span className="text-amber-600">⚠️ 需关注</span>
                        )}
                      </div>
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            member.morale < 20
                              ? 'bg-red-500'
                              : member.morale < 30
                              ? 'bg-amber-500'
                              : member.morale < 50
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${member.morale}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* 团队行动 */}
        {isLateGame && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">团队行动</h2>
            <div className="grid grid-cols-2 gap-3">
              {/* 团队项目 */}
              <button
                onClick={() => handleTeamAction(ActionType.TEAM_PROJECT)}
                disabled={actionPoints <= 0 || team.members.length === 0}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${actionPoints > 0 && team.members.length > 0
                    ? 'border-purple-200 bg-white hover:border-purple-400 hover:shadow-md active:scale-[0.98]'
                    : 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <div className="text-2xl mb-1">🎯</div>
                <div className="font-bold text-slate-900">团队项目</div>
                <div className="text-xs text-slate-500">委派团队执行项目</div>
                {team.members.length === 0 && (
                  <div className="text-xs text-red-500 mt-1">需要先招募成员</div>
                )}
              </button>

              {/* 团队培训 */}
              <button
                onClick={() => handleTeamAction(ActionType.TEAM_TRAINING)}
                disabled={actionPoints <= 0 || !canAfford(5000) || team.members.length === 0}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${actionPoints > 0 && canAfford(5000) && team.members.length > 0
                    ? 'border-purple-200 bg-white hover:border-purple-400 hover:shadow-md active:scale-[0.98]'
                    : 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <div className="text-2xl mb-1">📚</div>
                <div className="font-bold text-slate-900">团队培训</div>
                <div className={`text-xs ${canAfford(5000) ? 'text-slate-500' : 'text-red-500'}`}>
                  💰 5,000
                </div>
                <div className="text-xs text-slate-400">士气+10 领导力+3</div>
              </button>
            </div>
          </section>
        )}

        {/* 招募成员 */}
        {isLateGame && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">招募成员</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(RECRUIT_CONFIG).map(([type, config]) => {
                const canRecruit = stats.cash >= config.recruitCost && actionPoints > 0;
                const roleType = type as TeamMemberType;

                return (
                  <button
                    key={type}
                    onClick={() => handleRecruit(roleType)}
                    disabled={!canRecruit}
                    className={`
                      p-4 rounded-xl border-2 transition-all text-left
                      ${canRecruit
                        ? 'border-purple-200 bg-white hover:border-purple-400 hover:shadow-md active:scale-[0.98]'
                        : 'border-slate-200 bg-slate-100 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="text-2xl mb-1">{ROLE_INFO[roleType].icon}</div>
                    <div className="font-bold text-slate-900">{config.name}</div>
                    <div className={`text-sm ${stats.cash >= config.recruitCost ? 'text-slate-600' : 'text-red-600'}`}>
                      💰 {config.recruitCost.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      工资: {config.baseSalary.toLocaleString()}/季
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
              ⚠️ 待处理问题 ({team.pendingIssues.length})
            </h2>
            <div className="space-y-3">
              {team.pendingIssues.map((issue) => {
                const canResolve = team.leadership >= issue.requiredLeadership && actionPoints > 0;

                return (
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
                        issue.severity === 'low' ? 'bg-yellow-100 text-yellow-700' :
                        issue.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {issue.severity === 'low' && '低'}
                        {issue.severity === 'medium' && '中'}
                        {issue.severity === 'high' && '高'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{issue.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${canResolve ? 'text-slate-500' : 'text-red-500'}`}>
                        需要领导力: {issue.requiredLeadership} (当前: {team.leadership})
                      </span>
                      <button
                        onClick={() => handleResolveIssue(issue.id)}
                        disabled={!canResolve}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          canResolve
                            ? 'bg-purple-500 text-white hover:bg-purple-600 active:scale-95'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {canResolve ? '解决' : '领导力不足'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 完成本季度按钮 */}
        <div className="mt-8">
          <button
            onClick={handleFinishQuarter}
            className="w-full py-4 px-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            完成本季度
          </button>
        </div>
      </div>

      {/* 职业功能说明弹窗 */}
      {showRoleInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">📋 职业功能说明</h3>
            <div className="space-y-4">
              {Object.values(ROLE_INFO).map((role) => (
                <div key={role.name} className="border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{role.icon}</span>
                    <span className="font-bold text-slate-900">{role.name}</span>
                  </div>
                  <div className="text-sm text-purple-600 font-medium">{role.effect}</div>
                  <div className="text-xs text-slate-500 mt-1">{role.desc}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-slate-100 rounded-lg">
              <p className="text-xs text-slate-600">
                💡 <strong>技能提升</strong>：团队培训时有20%概率随机提升一名成员技能
              </p>
              <p className="text-xs text-slate-600 mt-1">
                ⚠️ <strong>士气系统</strong>：每季度-5，士气&lt;30警告，&lt;20可能离职
              </p>
            </div>
            <button
              onClick={() => setShowRoleInfo(false)}
              className="w-full mt-4 py-2 text-slate-600 hover:text-slate-900"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

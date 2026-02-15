import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { Rank, GamePhase } from '@shared/types';

const RANK_OPTIONS = [
  { value: Rank.INTERN, label: '实习生' },
  { value: Rank.ENGINEER, label: '工程师' },
  { value: Rank.SENIOR_ENGINEER, label: '高级工程师' },
  { value: Rank.PROJECT_MANAGER, label: '项目经理' },
  { value: Rank.PROJECT_DIRECTOR, label: '项目总监' },
  { value: Rank.PARTNER, label: '合伙人' },
];

export function DebugPage() {
  const navigate = useNavigate();

  // 状态选择器
  const rank = useGameStoreNew((state) => state.rank);
  const stats = useGameStoreNew((state) => state.stats);
  const phase = useGameStoreNew((state) => state.phase);
  const currentQuarter = useGameStoreNew((state) => state.currentQuarter);
  const team = useGameStoreNew((state) => state.team);

  // Actions
  const setDebugState = useGameStoreNew((state) => state.setDebugState);
  const addTeamMember = useGameStoreNew((state) => state.addTeamMember);
  const startGame = useGameStoreNew((state) => state.startGame);

  // 本地表单状态
  const [formRank, setFormRank] = useState<Rank>(rank);
  const [formCash, setFormCash] = useState(stats.cash);
  const [formHealth, setFormHealth] = useState(stats.health);
  const [formReputation, setFormReputation] = useState(stats.reputation);
  const [formPhase, setFormPhase] = useState(phase);
  const [formQuarter, setFormQuarter] = useState(currentQuarter);

  // Admin 登录状态
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('debug_token', data.token);
        setIsLoggedIn(true);
        setLoginError('');
      } else {
        setLoginError('密码错误');
      }
    } catch (error) {
      setLoginError('登录失败');
    }
  };

  const handleApplyState = () => {
    setDebugState({
      rank: formRank,
      cash: formCash,
      health: formHealth,
      reputation: formReputation,
      phase: formPhase,
      currentQuarter: formQuarter,
    });
    alert('状态已更新！');
  };

  const handleAddTeamMember = () => {
    addTeamMember({
      name: `测试成员${team.members.length + 1}`,
      role: 'engineer',
      morale: 80,
      efficiency: 90,
    });
    alert('已添加团队成员！');
  };

  const handleJumpToLateGame = () => {
    setDebugState({
      rank: Rank.PROJECT_MANAGER,
      cash: 500000,
      health: 80,
      reputation: 70,
      phase: GamePhase.LATE,
      currentQuarter: 10,
    });
    setFormRank(Rank.PROJECT_MANAGER);
    setFormCash(500000);
    setFormHealth(80);
    setFormReputation(70);
    setFormPhase(GamePhase.LATE);
    setFormQuarter(10);
    alert('已跳转到后期阶段（项目经理）！');
  };

  const handleResetGame = () => {
    if (confirm('确定要重置游戏吗？')) {
      startGame();
      navigate('/');
    }
  };

  // 登录页面
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-xl p-6 w-full max-w-sm border border-slate-700">
          <h1 className="text-xl font-bold text-white mb-4 text-center">🔒 调试模式</h1>
          <p className="text-slate-400 text-sm mb-4 text-center">
            需要管理员权限才能访问
          </p>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            placeholder="输入管理员密码"
            className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-brand-500 focus:outline-none mb-3"
          />

          {loginError && (
            <p className="text-red-400 text-sm mb-3 text-center">{loginError}</p>
          )}

          <button
            onClick={handleLogin}
            className="w-full py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 transition-colors"
          >
            登录
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-2 mt-3 text-slate-400 hover:text-white transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  // 调试面板
  return (
    <div className="min-h-screen bg-slate-900 p-4 pb-20">
      <div className="max-w-md mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">🔧 调试面板</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white"
          >
            返回
          </button>
        </div>

        {/* 当前状态 */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-4">
          <h2 className="text-sm font-medium text-slate-400 mb-3">当前状态</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-slate-300">职级: <span className="text-white">{rank}</span></div>
            <div className="text-slate-300">阶段: <span className="text-white">{phase}</span></div>
            <div className="text-slate-300">现金: <span className="text-emerald-400">{stats.cash}</span></div>
            <div className="text-slate-300">健康: <span className="text-amber-400">{stats.health}</span></div>
            <div className="text-slate-300">声誉: <span className="text-blue-400">{stats.reputation}</span></div>
            <div className="text-slate-300">季度: <span className="text-white">{currentQuarter}</span></div>
            <div className="text-slate-300 col-span-2">团队成员: <span className="text-white">{team.members.length}</span></div>
          </div>
        </div>

        {/* 快捷操作 */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-4">
          <h2 className="text-sm font-medium text-slate-400 mb-3">快捷操作</h2>
          <div className="space-y-2">
            <button
              onClick={handleJumpToLateGame}
              className="w-full py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors"
            >
              🚀 跳转到后期（项目经理）
            </button>
            <button
              onClick={handleAddTeamMember}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
            >
              👥 添加团队成员
            </button>
            <button
              onClick={handleResetGame}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
            >
              🔄 重置游戏
            </button>
          </div>
        </div>

        {/* 自定义状态 */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-4">
          <h2 className="text-sm font-medium text-slate-400 mb-3">自定义状态</h2>

          <div className="space-y-3">
            <div>
              <label className="text-slate-300 text-sm">职级</label>
              <select
                value={formRank}
                onChange={(e) => setFormRank(e.target.value as Rank)}
                className="w-full mt-1 px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
              >
                {RANK_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 text-sm">阶段</label>
              <select
                value={formPhase}
                onChange={(e) => setFormPhase(e.target.value as GamePhase)}
                className="w-full mt-1 px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
              >
                <option value={GamePhase.EARLY}>Early（早期）</option>
                <option value={GamePhase.LATE}>Late（后期）</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 text-sm">现金</label>
              <input
                type="number"
                value={formCash}
                onChange={(e) => setFormCash(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
              />
            </div>

            <div>
              <label className="text-slate-300 text-sm">健康 (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formHealth}
                onChange={(e) => setFormHealth(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
              />
            </div>

            <div>
              <label className="text-slate-300 text-sm">声誉 (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={formReputation}
                onChange={(e) => setFormReputation(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
              />
            </div>

            <div>
              <label className="text-slate-300 text-sm">当前季度</label>
              <input
                type="number"
                min="1"
                value={formQuarter}
                onChange={(e) => setFormQuarter(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600"
              />
            </div>

            <button
              onClick={handleApplyState}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
            >
              ✅ 应用状态
            </button>
          </div>
        </div>

        {/* 跳转链接 */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h2 className="text-sm font-medium text-slate-400 mb-3">快速跳转</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/game-new')}
              className="py-2 px-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm"
            >
              事件页面
            </button>
            <button
              onClick={() => navigate('/game-new/actions')}
              className="py-2 px-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm"
            >
              行动页面
            </button>
            <button
              onClick={() => navigate('/game-new/settlement')}
              className="py-2 px-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm"
            >
              结算页面
            </button>
            <button
              onClick={() => navigate('/')}
              className="py-2 px-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 text-sm"
            >
              首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

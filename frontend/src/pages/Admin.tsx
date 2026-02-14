import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface OverviewData {
  todayDau: number;
  wau: number;
  mau: number;
  totalSaves: number;
}

interface TrendData {
  dau: { date: string; count: number }[];
  games: { date: string; count: number }[];
  newUsers: { date: string; count: number }[];
}

interface RankDistribution {
  ranks: { rank: string; count: number }[];
}

interface StatsResponse {
  overview: OverviewData;
  trends: TrendData;
  distribution: RankDistribution;
  events: { event_type: string; count: number }[];
  leaderboard: any[];
}

const RANK_NAMES: Record<string, string> = {
  INTERN: '实习生',
  ENGINEER: '工程师',
  SENIOR_ENGINEER: '高级工程师',
  PROJECT_MANAGER: '项目经理',
  PROJECT_DIRECTOR: '项目总监',
  PARTNER: '合伙人',
};

export default function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'ranks' | 'health'>('overview');

  // 登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        setToken(data.token);
        setIsAuthenticated(true);
        localStorage.setItem('adminToken', data.token);
      } else {
        alert('密码错误');
      }
    } catch (error) {
      alert('登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 检查本地存储的 token
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // 获取统计数据
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats?days=7', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else if (res.status === 401) {
          setIsAuthenticated(false);
          localStorage.removeItem('adminToken');
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
      }
    };

    fetchStats();
    // 每 5 分钟刷新一次
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated, token]);

  // 退出登录
  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken('');
    localStorage.removeItem('adminToken');
  };

  // 登录页面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🔐</div>
            <h1 className="text-2xl font-bold text-slate-800">管理后台</h1>
            <p className="text-slate-500 mt-2">请输入管理员密码</p>
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="管理员密码"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 text-slate-500 hover:text-slate-700 text-sm"
          >
            ← 返回首页
          </button>
        </div>
      </div>
    );
  }

  // 主界面
  return (
    <div className="min-h-screen bg-slate-100">
      {/* 顶部导航 */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📊</span>
            <h1 className="text-xl font-bold text-slate-800">监控面板</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="text-slate-600 hover:text-slate-800"
            >
              返回首页
            </button>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: '概览', icon: '📈' },
              { id: 'trends', label: '趋势', icon: '📊' },
              { id: 'ranks', label: '职级分布', icon: '👥' },
              { id: 'health', label: '系统健康', icon: '💚' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && !stats ? (
          <div className="text-center py-12">
            <div className="text-4xl animate-spin mb-4">⏳</div>
            <p className="text-slate-500">加载中...</p>
          </div>
        ) : stats ? (
          <>
            {/* 概览 Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 核心指标卡片 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    title="今日 DAU"
                    value={stats.overview.todayDau}
                    icon="👥"
                    color="blue"
                  />
                  <MetricCard
                    title="本周 WAU"
                    value={stats.overview.wau}
                    icon="📅"
                    color="green"
                  />
                  <MetricCard
                    title="本月 MAU"
                    value={stats.overview.mau}
                    icon="📆"
                    color="purple"
                  />
                  <MetricCard
                    title="存档总数"
                    value={stats.overview.totalSaves}
                    icon="💾"
                    color="orange"
                  />
                </div>

                {/* 今日事件统计 */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">今日事件统计</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {stats.events.map((event) => (
                      <div
                        key={event.event_type}
                        className="bg-slate-50 rounded-lg p-4 text-center"
                      >
                        <div className="text-2xl font-bold text-slate-800">{event.count}</div>
                        <div className="text-sm text-slate-500 mt-1">{event.event_type}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 排行榜 Top 5 */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">排行榜 Top 5</h3>
                  <div className="space-y-2">
                    {stats.leaderboard.slice(0, 5).map((player: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                          </span>
                          <span className="font-medium text-slate-800">{player.playerName || '匿名'}</span>
                        </div>
                        <span className="font-bold text-brand-600">{player.bestScore?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 趋势 Tab */}
            {activeTab === 'trends' && (
              <div className="space-y-6">
                {/* DAU 趋势 */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">DAU 趋势（最近 7 天）</h3>
                  <div className="h-64 flex items-end space-x-2">
                    {stats.trends.dau.map((item, index) => {
                      const max = Math.max(...stats.trends.dau.map((d) => d.count), 1);
                      const height = (item.count / max) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-brand-500 rounded-t transition-all"
                            style={{ height: `${height}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                          />
                          <div className="text-xs text-slate-500 mt-2 truncate">
                            {item.date.slice(5)}
                          </div>
                          <div className="text-xs font-medium text-slate-700">{item.count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 新用户趋势 */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">新用户趋势（最近 7 天）</h3>
                  <div className="h-48 flex items-end space-x-2">
                    {stats.trends.newUsers.map((item, index) => {
                      const max = Math.max(...stats.trends.newUsers.map((d) => d.count), 1);
                      const height = (item.count / max) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-green-500 rounded-t transition-all"
                            style={{ height: `${height}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                          />
                          <div className="text-xs text-slate-500 mt-2 truncate">
                            {item.date.slice(5)}
                          </div>
                          <div className="text-xs font-medium text-slate-700">{item.count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 游戏局数趋势 */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">游戏局数（最近 7 天）</h3>
                  <div className="h-48 flex items-end space-x-2">
                    {stats.trends.games.map((item, index) => {
                      const max = Math.max(...stats.trends.games.map((d) => d.count), 1);
                      const height = (item.count / max) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-purple-500 rounded-t transition-all"
                            style={{ height: `${height}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                          />
                          <div className="text-xs text-slate-500 mt-2 truncate">
                            {item.date.slice(5)}
                          </div>
                          <div className="text-xs font-medium text-slate-700">{item.count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 职级分布 Tab */}
            {activeTab === 'ranks' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">玩家职级分布</h3>
                <div className="space-y-4">
                  {stats.distribution.ranks.map((item) => {
                    const total = stats.distribution.ranks.reduce((sum, r) => sum + r.count, 0);
                    const percent = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                    return (
                      <div key={item.rank} className="flex items-center space-x-4">
                        <div className="w-24 text-sm font-medium text-slate-700">
                          {RANK_NAMES[item.rank] || item.rank}
                        </div>
                        <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-brand-500 h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="w-20 text-right text-sm text-slate-600">
                          {item.count} 人 ({percent}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 系统健康 Tab */}
            {activeTab === 'health' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">系统状态</h3>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-slate-600">系统运行正常</p>
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

// 指标卡片组件
function MetricCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-slate-500 mt-1">{title}</div>
    </div>
  );
}

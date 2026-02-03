import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard, getMyRank } from '@/api';

type LeaderboardType = 'rank' | 'cash';

interface LeaderboardEntry {
  rank: number;
  runId: string;
  playerName: string;
  score: number;
  value: number; // 根据榜单类型不同，表示不同值
  roundsPlayed: number;
  finalCash: number;
  endReason?: string;
  finalRank?: string;
  createdAt: string;
}

interface MyRankData {
  type: string;
  rank: number;
  total: number;
  percentile: number;
  runId: string;
  playerName: string;
  bestScore: number;
  totalGames: number;
  totalCash: number;
  finalRank?: string;
  finalCash?: number;
}

interface LeaderboardData {
  type: LeaderboardType;
  leaderboard: LeaderboardEntry[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const tabs: { key: LeaderboardType; label: string }[] = [
  { key: 'rank', label: '职位榜' },
  { key: 'cash', label: '现金榜' },
];

// 职位显示名称映射（支持小写和大写输入）
const RANK_DISPLAY_NAMES: Record<string, string> = {
  'partner': '合伙人',
  'PARTNER': '合伙人',
  'project_director': '项目总监',
  'PROJECT_DIRECTOR': '项目总监',
  'project_manager': '项目经理',
  'PROJECT_MANAGER': '项目经理',
  'senior_engineer': '高级工程师',
  'SENIOR_ENGINEER': '高级工程师',
  'engineer': '工程师',
  'ENGINEER': '工程师',
  'intern': '实习生',
  'INTERN': '实习生',
};

// 类型对应的标签和单位
const typeConfig = {
  rank: {
    label: '最终职位',
    unit: '',
    bgColor: 'bg-purple-500',
    textColor: 'text-white',
    badgeColor: 'bg-purple-100',
    badgeText: 'text-purple-700',
  },
  cash: {
    label: '总资产',
    unit: '元',
    bgColor: 'bg-status-cash',
    textColor: 'text-white',
    badgeColor: 'bg-status-cash/10',
    badgeText: 'text-status-cash',
  },
};

export default function Leaderboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LeaderboardType>('rank');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [myRankData, setMyRankData] = useState<MyRankData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载排行榜数据
  const loadLeaderboard = async (type: LeaderboardType) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getLeaderboard({
        type,
        limit: 50,
        offset: 0,
      });
      setLeaderboardData(data);
    } catch (err) {
      console.error('加载排行榜失败:', err);
      setError('加载排行榜失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 加载我的排名
  const loadMyRank = async (type: LeaderboardType) => {
    try {
      const data = await getMyRank(type);
      setMyRankData(data);
    } catch (err) {
      console.error('加载排名失败:', err);
      // 如果是角色名未找到的错误，不显示错误提示
      if ((err as Error).message === '未找到角色名') {
        return;
      }
      // 我的排名加载失败不阻塞页面显示
    }
  };

  // 初始化和切换 Tab 时加载数据
  useEffect(() => {
    loadLeaderboard(activeTab);
    loadMyRank(activeTab);
  }, [activeTab]);

  // 处理 Tab 切换
  const handleTabChange = (tab: LeaderboardType) => {
    setActiveTab(tab);
  };

  // 获取排名显示
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // 获取配置
  const config = typeConfig[activeTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* 顶部装饰条 */}
      <div className="h-1 bg-gradient-to-r from-brand-500 via-engineering-safety to-brand-600"></div>

      {/* 头部 */}
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4">
          {/* 顶部导航栏 */}
          <div className="flex items-center justify-between h-14">
            {/* 返回按钮 */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-slate-600 hover:text-brand-600 transition-colors group focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
              <span className="text-sm font-medium hidden sm:inline">返回首页</span>
            </button>

            {/* 标题 */}
            <h1 className="text-lg font-bold text-slate-800 flex items-center">
              <span className="mr-2">🏆</span>
              排行榜
            </h1>

            {/* 占位，保持标题居中 */}
            <div className="w-16"></div>
          </div>

          {/* Tab 切换 */}
          <div className="flex gap-2 pb-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1
                    ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* 我的排名卡片 */}
          {myRankData && (
            <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-feishu-lg p-5 shadow-feishu text-white animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-brand-100 text-sm mb-1">最佳记录排名</p>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold mr-2">
                      {getRankDisplay(myRankData.rank)}
                    </span>
                    <span className="text-brand-100 text-sm">
                      / {myRankData.total.toLocaleString()} 局
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-brand-100 text-xs mb-1">超过游戏记录</p>
                  <p className="text-xl font-bold">
                    {Math.round(myRankData.percentile)}%
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-3 gap-3 text-sm">
                <div className="text-center">
                  <p className="text-brand-100 text-xs">
                    {activeTab === 'rank' ? '最佳职位' : '最高现金'}
                  </p>
                  <p className="text-lg font-bold">
                    {activeTab === 'rank'
                      ? (myRankData.finalRank ? RANK_DISPLAY_NAMES[myRankData.finalRank] || myRankData.finalRank : '-')
                      : (myRankData.finalCash || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-brand-100 text-xs">总局数</p>
                  <p className="text-lg font-bold">{myRankData.totalGames}</p>
                </div>
                <div className="text-center">
                  <p className="text-brand-100 text-xs">总现金</p>
                  <p className="text-lg font-bold">{(myRankData.totalCash || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* 排行榜列表 */}
          <div className="bg-white rounded-feishu-lg shadow-feishu overflow-hidden">
            {/* 加载状态 */}
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500">加载中...</p>
              </div>
            ) : error ? (
              /* 错误状态 */
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">😢</div>
                <p className="text-slate-600 mb-4">{error}</p>
                <button
                  onClick={() => loadLeaderboard(activeTab)}
                  className="px-6 py-2 bg-brand-500 text-white rounded-feishu hover:bg-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  重试
                </button>
              </div>
            ) : leaderboardData && leaderboardData.leaderboard.length > 0 ? (
              /* 数据列表 */
              <div className="divide-y divide-slate-100">
                {leaderboardData.leaderboard.map((entry, index) => (
                  <div
                    key={entry.runId}
                    className={`flex items-center p-4 hover:bg-slate-50 transition-colors ${
                      index === 0 ? 'bg-brand-50/50' : ''
                    }`}
                  >
                    {/* 排名 */}
                    <div className="w-12 text-center tabular-nums">
                      <span className={`text-lg font-bold ${
                        entry.rank <= 3 ? 'text-2xl' : 'text-slate-600'
                      }`}>
                        {getRankDisplay(entry.rank)}
                      </span>
                    </div>

                    {/* 角色名和游戏信息 */}
                    <div className="flex-1 ml-4">
                      <div className="font-medium text-slate-800">
                        {entry.playerName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Q{entry.roundsPlayed}</span>
                        {entry.finalRank && <span>· {RANK_DISPLAY_NAMES[entry.finalRank] || entry.finalRank}</span>}
                        {entry.endReason === 'promoted_to_partner' && (
                          <span className="text-emerald-600">🏆 晋升合伙人</span>
                        )}
                      </div>
                    </div>

                    {/* 分数/值 */}
                    <div className="text-right">
                      {activeTab === 'rank' ? (
                        // 职位榜：显示职位名称
                        <div className={`text-lg font-bold ${
                          entry.finalRank === 'PARTNER' || entry.finalRank === 'partner'
                            ? 'text-purple-600'
                            : entry.finalRank === 'PROJECT_DIRECTOR' || entry.finalRank === 'project_director'
                            ? 'text-indigo-600'
                            : entry.finalRank === 'PROJECT_MANAGER' || entry.finalRank === 'project_manager'
                            ? 'text-blue-600'
                            : entry.finalRank === 'SENIOR_ENGINEER' || entry.finalRank === 'senior_engineer'
                            ? 'text-cyan-600'
                            : 'text-slate-600'
                        }`}>
                          {entry.finalRank ? RANK_DISPLAY_NAMES[entry.finalRank] || entry.finalRank : '-'}
                        </div>
                      ) : (
                        // 现金榜：显示金额
                        <>
                          <div className={`text-lg font-bold text-status-cash`}>
                            {(entry.value || 0).toLocaleString()}
                          </div>
                          {config.unit && (
                            <div className="text-xs text-slate-400">
                              {config.unit}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* 空状态 */
              <div className="p-8 text-center">
                <div className="text-5xl mb-4">🎮</div>
                <p className="text-slate-500 mb-2">暂无排行数据</p>
                <p className="text-sm text-slate-400">完成游戏后即可上榜</p>
              </div>
            )}

            {/* 分页信息 */}
            {leaderboardData && leaderboardData.pagination.total > 50 && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-500">
                共 {leaderboardData.pagination.total.toLocaleString()} 局游戏记录
                显示前 50 名
              </div>
            )}
          </div>

          {/* 全局统计 */}
          {leaderboardData && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-feishu p-4 shadow-feishu text-center">
                <div className="text-xs text-slate-500 mb-1">总游戏局数</div>
                <div className="text-2xl font-bold text-brand-600">
                  {leaderboardData.pagination.total.toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-feishu p-4 shadow-feishu text-center">
                <div className="text-xs text-slate-500 mb-1">当前榜单</div>
                <div className="text-lg font-bold text-slate-800">
                  {config.label}
                </div>
              </div>
            </div>
          )}

          {/* 底部按钮 */}
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-2 px-8 py-3 bg-white text-slate-700 rounded-feishu shadow-feishu hover:shadow-feishu-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <span>🏠</span>
              <span className="font-medium">返回首页</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

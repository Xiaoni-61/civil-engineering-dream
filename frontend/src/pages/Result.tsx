import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameStatus } from '@shared/types';
import { END_MESSAGES } from '@/data/constants';

const Result = () => {
  const navigate = useNavigate();

  const {
    status,
    currentRound,
    maxRounds,
    stats,
    score,
    endReason,
    uploadScore,
    resetGame,
  } = useGameStore();

  // 如果游戏未结束，跳转回首页
  useEffect(() => {
    if (status !== GameStatus.COMPLETED && status !== GameStatus.FAILED) {
      navigate('/');
    }
  }, [status, navigate]);

  // 上传成绩到后端
  useEffect(() => {
    if (status === GameStatus.COMPLETED || status === GameStatus.FAILED) {
      // 异步上传成绩，不阻塞页面渲染
      uploadScore();
    }
  }, [status, uploadScore]);

  if (status !== GameStatus.COMPLETED && status !== GameStatus.FAILED) {
    return null;
  }

  const isWin = status === GameStatus.COMPLETED;
  const endMessage = endReason ? END_MESSAGES[endReason] : END_MESSAGES.max_rounds;

  const handlePlayAgain = () => {
    resetGame();
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* 顶部装饰 */}
      <div className={`h-1.5 ${
        isWin
          ? 'bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600'
          : 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600'
      }`}></div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* 主卡片 */}
          <div className="bg-white rounded-feishu-lg shadow-feishu-xl overflow-hidden animate-scale-in">
            {/* 顶部状态区域 */}
            <div className={`p-8 text-center ${
              isWin
                ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-b-2 border-emerald-200'
                : 'bg-gradient-to-br from-slate-50 to-gray-50 border-b-2 border-slate-200'
            }`}>
              <div className="text-7xl mb-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {isWin ? '🎉' : '😢'}
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-3 ${
                isWin ? 'text-emerald-700' : 'text-slate-700'
              }`}>
                {endMessage.title}
              </h1>
              <p className="text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
                {endMessage.description}
              </p>
            </div>

            {/* 得分展示 */}
            <div className="p-8">
              <div className="text-center mb-8">
                <p className="text-sm font-medium text-slate-500 mb-3">最终得分</p>
                <div className="inline-flex items-center justify-center">
                  <div className={`text-6xl md:text-7xl font-bold bg-gradient-to-r ${
                    isWin
                      ? 'from-emerald-600 to-green-600'
                      : 'from-slate-600 to-gray-600'
                  } bg-clip-text text-transparent animate-slide-up`}>
                    {score.toLocaleString()}
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Final Score</p>
              </div>

              {/* 统计数据网格 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-50 rounded-feishu p-4 border border-slate-100 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="text-2xl mb-1">🔄</div>
                  <div className="text-xs text-slate-500 mb-1">完成回合</div>
                  <div className="text-lg font-bold text-slate-800 tabular-nums">
                    {currentRound}/{maxRounds}
                  </div>
                </div>
                <div className="bg-status-progress/5 rounded-feishu p-4 border border-status-progress/20 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                  <div className="text-2xl mb-1">📈</div>
                  <div className="text-xs text-slate-500 mb-1">项目进度</div>
                  <div className="text-lg font-bold text-status-progress tabular-nums">
                    {stats.progress}%
                  </div>
                </div>
                <div className="bg-status-quality/5 rounded-feishu p-4 border border-status-quality/20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-xs text-slate-500 mb-1">项目质量</div>
                  <div className="text-lg font-bold text-status-quality tabular-nums">
                    {stats.quality}%
                  </div>
                </div>
                <div className="bg-status-health/5 rounded-feishu p-4 border border-red-200 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                  <div className="text-2xl mb-1">❤️</div>
                  <div className="text-xs text-slate-500 mb-1">剩余健康</div>
                  <div className="text-lg font-bold text-status-health tabular-nums">
                    {stats.health}%
                  </div>
                </div>
              </div>

              {/* 详细状态 */}
              <div className="bg-slate-50 rounded-feishu p-5 mb-8 border border-slate-100">
                <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                  <span className="mr-2">📊</span>
                  最终状态详情
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-feishu">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">💰</span>
                      <span className="text-sm text-slate-600">现金</span>
                    </div>
                    <span className="text-base font-bold text-status-cash tabular-nums">{stats.cash}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-feishu">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">❤️</span>
                      <span className="text-sm text-slate-600">健康</span>
                    </div>
                    <span className="text-base font-bold text-status-health tabular-nums">{stats.health}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-feishu">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">⭐</span>
                      <span className="text-sm text-slate-600">声誉</span>
                    </div>
                    <span className="text-base font-bold text-status-reputation tabular-nums">{stats.reputation}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-feishu">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">📈</span>
                      <span className="text-sm text-slate-600">进度</span>
                    </div>
                    <span className="text-base font-bold text-status-progress tabular-nums">{stats.progress}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-feishu md:col-span-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🏆</span>
                      <span className="text-sm text-slate-600">质量</span>
                    </div>
                    <span className="text-base font-bold text-status-quality tabular-nums">{stats.quality}</span>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3">
                <button
                  onClick={handlePlayAgain}
                  className={`w-full py-4 px-6 rounded-feishu font-bold text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2
                            shadow-feishu hover:shadow-feishu-lg hover:-translate-y-0.5 active:scale-[0.98]
                            ${isWin
                              ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 focus:ring-emerald-500'
                              : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 focus:ring-brand-500'
                            }`}
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🎮</span>
                    再玩一次
                  </span>
                </button>

                <button
                  onClick={() => navigate('/leaderboard')}
                  className="w-full py-4 px-6 rounded-feishu font-bold text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2
                           bg-gradient-to-r from-engineering-safety to-engineering-helmet
                           hover:from-engineering-helmet hover:to-engineering-safety
                           shadow-feishu hover:shadow-feishu-lg hover:-translate-y-0.5 active:scale-[0.98]
                           focus:ring-engineering-safety"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🏆</span>
                    查看排行榜
                  </span>
                </button>

                <button
                  onClick={() => navigate('/')}
                  className="w-full py-4 px-6 rounded-feishu font-medium text-slate-700 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                           bg-slate-100 hover:bg-slate-200 border border-slate-200 active:scale-[0.98]"
                >
                  返回首页
                </button>
              </div>
            </div>
          </div>

          {/* 底部提示 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              感谢游玩《还我一个土木梦》
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;

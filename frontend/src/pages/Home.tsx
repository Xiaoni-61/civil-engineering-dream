import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* 顶部装饰 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-engineering-safety to-brand-600"></div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          {/* 主标题区域 */}
          <div className="text-center mb-12 animate-fade-in">
            {/* 图标 */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-feishu-lg shadow-feishu-lg mb-6">
              <span className="text-5xl">🏗️</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 bg-clip-text text-transparent">
              还我一个土木梦
            </h1>

            <p className="text-lg md:text-xl text-slate-600 mb-3 font-medium">
              体验土木工程师的职业生涯
            </p>

            <p className="text-sm md:text-base text-slate-500 max-w-2xl mx-auto">
              在这个模拟经营游戏中，你将面对真实的工程挑战，在压力与梦想之间寻找平衡
            </p>
          </div>

          {/* 卡片容器 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* 开始游戏卡片 */}
            <button
              onClick={() => navigate('/game')}
              className="group relative bg-white rounded-feishu-lg p-8 shadow-feishu hover:shadow-feishu-xl transition-all duration-300 text-left overflow-hidden animate-slide-up cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-[0.98]"
              style={{ animationDelay: '0.1s' }}
            >
              {/* 背景装饰 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-50 to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-300"></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-brand-500 rounded-feishu flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      🎮
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                        开始游戏
                      </h2>
                      <p className="text-sm text-slate-500">Start New Game</p>
                    </div>
                  </div>
                  <div className="text-brand-500 group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  开启一段 20 回合的工程之旅，每个决策都将影响你的职业生涯
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium">
                    20 回合
                  </span>
                  <span className="px-3 py-1 bg-engineering-safety/10 text-engineering-safety rounded-full text-xs font-medium">
                    多重结局
                  </span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                    策略经营
                  </span>
                </div>
              </div>
            </button>

            {/* 排行榜卡片 */}
            <button
              onClick={() => navigate('/leaderboard')}
              className="group relative bg-white rounded-feishu-lg p-8 shadow-feishu hover:shadow-feishu-xl transition-all duration-300 text-left overflow-hidden animate-slide-up cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-[0.98]"
              style={{ animationDelay: '0.2s' }}
            >
              {/* 背景装饰 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-engineering-helmet/10 to-transparent rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-300"></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-engineering-safety to-engineering-helmet rounded-feishu flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      🏆
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 group-hover:text-engineering-safety transition-colors">
                        排行榜
                      </h2>
                      <p className="text-sm text-slate-500">Leaderboard</p>
                    </div>
                  </div>
                  <div className="text-engineering-safety group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>

                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  查看全球玩家的成绩排名，挑战更高分数
                </p>

                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">👥</span>
                    <span>全球排名</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">⭐</span>
                    <span>最高分</span>
                  </div>
                </div>
              </div>
            </button>
          </div>

          {/* 游戏特色 */}
          <div className="bg-white rounded-feishu-lg p-6 shadow-feishu animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <span className="text-xl mr-2">✨</span>
              游戏特色
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-status-cash/10 rounded-feishu flex items-center justify-center flex-shrink-0 mt-1">
                  💰
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">资源管理</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    平衡现金、健康、声誉、进度和质量五项核心指标
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-status-progress/10 rounded-feishu flex items-center justify-center flex-shrink-0 mt-1">
                  📊
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">真实场景</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    20+ 真实工程场景，每个选择都有不同的后果
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-status-quality/10 rounded-feishu flex items-center justify-center flex-shrink-0 mt-1">
                  🎯
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm mb-1">策略深度</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    多种胜利条件和失败原因，考验你的决策能力
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 底部说明 */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              游戏目标：在 20 回合内完成项目，同时保持各项指标平衡
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

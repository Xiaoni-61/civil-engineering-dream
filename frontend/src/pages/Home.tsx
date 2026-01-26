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
            {/* 开始游戏卡片 - 新游戏系统 */}
            <button
              onClick={() => {
                // 导航到新游戏系统并初始化
                navigate('/game-new/actions');
              }}
              className="group relative bg-gradient-to-br from-brand-50 to-engineering-50 border-2 border-brand-200 rounded-feishu-lg p-8 shadow-feishu hover:shadow-feishu-xl transition-all duration-300 text-left overflow-hidden animate-slide-up cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-[0.98]"
              style={{ animationDelay: '0.1s' }}
            >
              {/* 背景装饰 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-100 to-transparent rounded-bl-full opacity-30 group-hover:scale-110 transition-transform duration-300"></div>

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-engineering-500 rounded-feishu flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      🎮
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                        开始游戏
                      </h2>
                      <p className="text-sm text-brand-600 font-medium">New Game System</p>
                    </div>
                  </div>
                  <div className="text-brand-500 group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>

                <p className="text-slate-700 text-sm leading-relaxed mb-4">
                  <strong>新玩法体验：</strong>行动点制、团队管理、策略深化
                  <br />
                  <span className="text-slate-500">从实习生晋升到合伙人的职业之旅</span>
                </p>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium border border-brand-200">
                    ⚡ 行动点
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium border border-purple-200">
                    👥 团队管理
                  </span>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                    📈 职业晋升
                  </span>
                </div>
              </div>
            </button>

            {/* 旧版入口 */}
            <button
              onClick={() => navigate('/game')}
              className="group relative bg-white/60 rounded-feishu-lg p-6 shadow-feishu hover:shadow-feishu-md transition-all duration-300 text-left overflow-hidden animate-slide-up cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 active:scale-[0.98] opacity-70 hover:opacity-100"
              style={{ animationDelay: '0.15s' }}
            >
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-feishu flex items-center justify-center text-xl">
                      📜
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-600 group-hover:text-slate-800 transition-colors">
                        经典版
                      </h2>
                      <p className="text-xs text-slate-400">Classic</p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-500 text-xs leading-relaxed mb-2">
                  20回合事件制游戏体验
                </p>
                <p className="text-slate-400 text-xs">
                  （保留用于兼容）
                </p>
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
            <p className="text-sm text-slate-500 mb-2">
              <strong>新玩法目标：</strong>从实习生晋升到合伙人，平衡资源、健康和声誉
            </p>
            <p className="text-xs text-slate-400">
              <strong>经典版目标：</strong>在 20 回合内完成项目，同时保持各项指标平衡
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

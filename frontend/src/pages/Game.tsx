import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import StatusBar from '@/components/StatusBar';
import EventCard from '@/components/EventCard';
import { GameStatus } from '@shared/types';

const Game = () => {
  const navigate = useNavigate();

  const {
    status,
    currentRound,
    eventsInQuarter,
    maxEventsPerQuarter,
    stats,
    currentEvent,
    startGame,
    selectOption,
    isLLMEnhancing,
    finishQuarter,
  } = useGameStore();

  // 组件挂载时开始游戏
  useEffect(() => {
    if (status === GameStatus.IDLE) {
      startGame();
    }
  }, [status, startGame]);

  // 游戏结束时跳转到结算页
  useEffect(() => {
    if (status === GameStatus.COMPLETED || status === GameStatus.FAILED) {
      setTimeout(() => {
        navigate('/result');
      }, 1500);
    }
  }, [status, navigate]);

  // 进入策略阶段
  useEffect(() => {
    if (status === GameStatus.STRATEGY_PHASE) {
      navigate('/strategy');
    }
  }, [status, navigate]);

  const handleSelectOption = (optionId: string) => {
    selectOption(optionId);
  };

  const handleExit = () => {
    if (window.confirm('确定要退出游戏吗？当前进度将不会保存。')) {
      navigate('/');
    }
  };

  const handleFinishQuarter = () => {
    finishQuarter();
    navigate('/settlement');
  };

  // 加载中状态
  if (status === GameStatus.IDLE || !currentEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-feishu-lg shadow-feishu-lg mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent"></div>
          </div>
          <p className="text-sm font-medium text-slate-600">
            {isLLMEnhancing ? 'AI 正在生成内容...' : '游戏加载中...'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {isLLMEnhancing ? '✨ LLM 增强中' : 'Initializing Game'}
          </p>
        </div>
      </div>
    );
  }

  const canFinishQuarter = eventsInQuarter >= maxEventsPerQuarter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* 横屏提示 */}
      <div className="landscape-warning fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm items-center justify-center hidden">
        <div className="text-center text-white p-8">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-xl font-bold mb-2">请旋转设备</h2>
          <p className="text-sm text-slate-300">游戏体验最佳，请在竖屏模式下游玩</p>
        </div>
      </div>

      {/* 顶部装饰条 */}
      <div className="h-1 bg-gradient-to-r from-brand-500 via-engineering-safety to-brand-600"></div>

      {/* 顶部导航栏 */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* 返回按钮 */}
            <button
              onClick={handleExit}
              className="flex items-center space-x-2 text-slate-600 hover:text-brand-600 transition-colors group cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded px-2 py-1 -ml-2 active:scale-95"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span className="text-sm font-medium hidden sm:inline">返回首页</span>
            </button>

            {/* 标题 */}
            <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
              <h1 className="text-base font-bold text-slate-800 flex items-center">
                <span className="mr-2">🏗️</span>
                还我一个土木梦
              </h1>
            </div>

            {/* 季度指示器 */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-brand-50 rounded-feishu border border-brand-200">
              <span className="text-xs text-brand-700 font-medium">季度</span>
              <span className="text-sm font-bold text-brand-600 tabular-nums">
                Q{currentRound}
              </span>
              <span className="text-xs text-brand-500">({eventsInQuarter}/{maxEventsPerQuarter})</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 左侧：状态栏 */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <StatusBar
                stats={stats}
                round={currentRound}
                maxRounds={999} // 无上限，显示占位
              />
            </div>
          </div>

          {/* 右侧：事件卡 */}
          <div className="lg:col-span-8">
            <EventCard
              event={currentEvent}
              onSelectOption={handleSelectOption}
              disabled={status !== GameStatus.PLAYING}
            />
          </div>
        </div>

        {/* 完成季度按钮 */}
        {canFinishQuarter && (
          <div className="fixed bottom-6 right-6 z-30">
            <button
              onClick={handleFinishQuarter}
              className="flex items-center space-x-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-feishu-lg shadow-feishu-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 active:scale-95"
            >
              <span className="text-lg">📊</span>
              <span className="font-medium">进入策略阶段</span>
            </button>
          </div>
        )}
      </div>

      {/* 游戏结束遮罩 */}
      {(status === GameStatus.COMPLETED || status === GameStatus.FAILED) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-feishu-lg p-8 max-w-sm mx-4 text-center shadow-feishu-xl animate-scale-in">
            <div className="text-6xl mb-4">
              {status === GameStatus.COMPLETED ? '🎉' : '😢'}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {status === GameStatus.COMPLETED ? '晋升合伙人！' : '游戏结束'}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              正在计算最终得分...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-500 border-t-transparent"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;

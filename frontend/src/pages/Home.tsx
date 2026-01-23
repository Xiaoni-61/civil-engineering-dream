import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-4">
          还我一个土木梦
        </h1>
        <p className="text-xl text-blue-100 mb-2">
          体验土木工程师的职业生涯
        </p>
        <p className="text-sm text-blue-200">
          在压力与挑战中，守护你的健康与梦想
        </p>
      </div>

      <div className="space-y-4 w-full max-w-md">
        <button
          onClick={() => navigate('/game')}
          className="w-full bg-white text-blue-600 py-4 px-6 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
        >
          开始游戏
        </button>

        <button
          onClick={() => navigate('/leaderboard')}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-blue-500 transition-colors border-2 border-white"
        >
          排行榜
        </button>
      </div>

      <div className="mt-12 text-blue-100 text-sm">
        <p>游戏目标：在 20 回合内完成项目，同时保持各项指标平衡</p>
      </div>
    </div>
  );
};

export default Home;

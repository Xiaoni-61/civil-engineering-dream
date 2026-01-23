import React from 'react';
import { useNavigate } from 'react-router-dom';

const Result: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-500 to-purple-700 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          游戏结束
        </h1>

        <div className="space-y-4 mb-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">最终得分</p>
            <p className="text-5xl font-bold text-purple-600">0</p>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 mb-2">结果统计</p>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span>完成回合</span>
                <span className="font-semibold">0 / 20</span>
              </li>
              <li className="flex justify-between">
                <span>项目进度</span>
                <span className="font-semibold">0%</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/game')}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-purple-500 transition-colors"
          >
            再玩一次
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
};

export default Result;

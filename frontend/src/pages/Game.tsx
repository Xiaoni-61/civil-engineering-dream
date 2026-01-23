import React from 'react';

const Game: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          游戏页面
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            游戏核心逻辑将在这里实现
          </p>
          <ul className="mt-4 space-y-2 text-sm text-gray-500">
            <li>• 状态条（5项指标）</li>
            <li>• 事件卡片展示</li>
            <li>• 选项按钮</li>
            <li>• 回合计数器</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Game;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();

  // 模拟排行榜数据
  const mockLeaderboard = [
    { rank: 1, name: '张工', score: 8500, rounds: 20 },
    { rank: 2, name: '李工', score: 8200, rounds: 19 },
    { rank: 3, name: '王工', score: 7800, rounds: 20 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-500 to-orange-600 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* 标题 */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-6">
            <h1 className="text-3xl font-bold text-white text-center">
              🏆 排行榜
            </h1>
          </div>

          {/* 排行榜列表 */}
          <div className="p-6">
            {mockLeaderboard.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                暂无排行数据
              </p>
            ) : (
              <div className="space-y-3">
                {mockLeaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl font-bold ${
                        entry.rank === 1 ? 'text-yellow-500' :
                        entry.rank === 2 ? 'text-gray-400' :
                        entry.rank === 3 ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        {entry.rank === 1 ? '🥇' :
                         entry.rank === 2 ? '🥈' :
                         entry.rank === 3 ? '🥉' :
                         `#${entry.rank}`}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{entry.name}</p>
                        <p className="text-sm text-gray-500">{entry.rounds} 回合</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">
                        {entry.score}
                      </p>
                      <p className="text-xs text-gray-500">分数</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 返回按钮 */}
          <div className="p-6 border-t">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-6 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

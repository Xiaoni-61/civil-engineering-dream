import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RANDOM_NAMES, EVALUATIONS, type CharacterEvaluation } from '@shared/types/character';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { savePlayerName } from '@/api/gameApi';

export function CharacterCreationPage() {
  const navigate = useNavigate();
  const initializeGame = useGameStoreNew((state) => state.initializeGame);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [workAbility, setWorkAbility] = useState(0);
  const [luck, setLuck] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);

  // 随机姓名
  const randomizeName = () => {
    const names = gender === 'male' ? RANDOM_NAMES.male : RANDOM_NAMES.female;
    setName(names[Math.floor(Math.random() * names.length)]);
  };

  // 随机性别
  const randomizeGender = () => {
    const newGender = Math.random() < 0.5 ? 'male' : 'female';
    setGender(newGender);
    // 根据新性别随机姓名
    const names = newGender === 'male' ? RANDOM_NAMES.male : RANDOM_NAMES.female;
    setName(names[Math.floor(Math.random() * names.length)]);
  };

  // 属性抽卡
  const drawAttributes = () => {
    // 工作能力 + 幸运 = 10
    const newWorkAbility = Math.floor(Math.random() * 11); // 0-10
    const newLuck = 10 - newWorkAbility;
    setWorkAbility(newWorkAbility);
    setLuck(newLuck);
    setHasDrawn(true);
  };

  // 开始游戏
  const startGame = () => {
    if (!name.trim()) {
      alert('请输入你的姓名');
      return;
    }

    // 保存角色名到 localStorage（永久保存）
    savePlayerName(name);

    initializeGame({
      name,
      gender,
      workAbility,
      luck
    });

    navigate('/game-new/actions');
  };

  // 获取评价
  const getEvaluation = (): CharacterEvaluation | null => {
    // 优先检查工作能力
    if (workAbility >= 7) {
      return EVALUATIONS.find(e => e.minAbility === 7) || null;
    }
    // 检查幸运
    if (luck >= 7) {
      return EVALUATIONS.find(e => e.minLuck === 7) || null;
    }
    // 平衡发展
    if (workAbility >= 4 && workAbility <= 6) {
      return EVALUATIONS.find(e => e.minAbility === 4 && e.maxAbility === 6) || null;
    }
    // 艰难开局
    if (workAbility <= 3) {
      return EVALUATIONS.find(e => e.maxAbility === 3) || null;
    }
    return null;
  };

  const evaluation = hasDrawn ? getEvaluation() : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-brand-50 pb-20 pt-52">
      <div className="max-w-md mx-auto px-4">
        {/* 头部 */}
        <h1 className="text-3xl font-bold text-slate-900 mb-2">创建你的工程师</h1>
        <p className="text-slate-600 mb-6">定制你的初始属性，影响游戏体验</p>

        {/* 基本信息 */}
        <section className="bg-white rounded-xl p-4 mb-4 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">基本信息</h2>

          {/* 姓名 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              你的姓名
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入你的姓名"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                onClick={randomizeName}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
              >
                🎲 随机
              </button>
            </div>
          </div>

          {/* 性别 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              选择性别
            </label>
            <div className="flex gap-3 mb-2">
              <button
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  gender === 'male'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => setGender('male')}
              >
                👨 男生
              </button>
              <button
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  gender === 'female'
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => setGender('female')}
              >
                👩 女生
              </button>
            </div>
            <button
              onClick={randomizeGender}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-sm transition-colors"
            >
              🎲 随机性别
            </button>
          </div>
        </section>

        {/* 属性抽卡 */}
        <section className="bg-white rounded-xl p-4 mb-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">属性分配</h2>
          <p className="text-sm text-slate-500 mb-4">工作能力 + 幸运 = 10（固定总和）</p>

          {!hasDrawn ? (
            <button
              onClick={drawAttributes}
              className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-lg hover:from-brand-600 hover:to-brand-700 transition-all shadow-lg active:scale-[0.98]"
            >
              🎴 随机抽取属性
            </button>
          ) : (
            <div className="space-y-4">
              {/* 属性条 */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">📚 工作能力</span>
                  <span className="text-slate-600 font-bold">{workAbility}/10</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${workAbility * 10}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">🎲 幸运</span>
                  <span className="text-slate-600 font-bold">{luck}/10</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all duration-500"
                    style={{ width: `${luck * 10}%` }}
                  />
                </div>
              </div>

              {/* 评价 */}
              {evaluation && (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="font-bold text-slate-900 mb-1">{evaluation.title}</div>
                  <div className="text-sm text-slate-700">{evaluation.description}</div>
                </div>
              )}

              {/* 重新抽卡 */}
              <button
                onClick={drawAttributes}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 text-sm transition-colors"
              >
                🎲 重新抽取
              </button>
            </div>
          )}
        </section>

        {/* 开始游戏 */}
        <button
          onClick={startGame}
          disabled={!name.trim() || !hasDrawn}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          🎮 开始游戏
        </button>

        {/* 返回按钮 */}
        <button
          onClick={() => navigate('/')}
          className="w-full py-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}

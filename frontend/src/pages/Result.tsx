import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStoreNew';
import { GameStatus } from '@shared/types';
import { END_MESSAGES } from '@/data/constants';
import ReactMarkdown from 'react-markdown';
import { generateBiographyStream, shareBiography as shareBiographyApi } from '@/api/eventsApi';
import { startGame as startGameApi } from '@/api/gameApi';
import { analytics } from '@/utils/analytics';

const Result = () => {
  const navigate = useNavigate();
  const hasUploaded = useRef(false);

  // 传记相关状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBiography, setShowBiography] = useState(false);
  const [biography, setBiography] = useState<string>('');
  const [biographyError, setBiographyError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isIncomplete, setIsIncomplete] = useState(false);
  const [biographyKey, setBiographyKey] = useState(0); // 用于强制重新挂载 ReactMarkdown
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    status,
    currentQuarter,
    gameStats,
    stats,
    score,
    endReason,
    uploadScore,
    resetGame,
    runId,
    playerName,
    rank,
    keyDecisions,
    quarterlyActions,
    setRunId,
  } = useGameStore();

  // 如果游戏未结束，跳转回首页
  useEffect(() => {
    if (status !== GameStatus.COMPLETED && status !== GameStatus.FAILED) {
      navigate('/');
    }
  }, [status, navigate]);

  // 上传成绩到后端（只执行一次）
  useEffect(() => {
    if ((status === GameStatus.COMPLETED || status === GameStatus.FAILED) && !hasUploaded.current) {
      hasUploaded.current = true;
      // 异步上传成绩，不阻塞页面渲染
      uploadScore();

      // 记录游戏结束事件
      analytics.gameEnd({
        quarter: currentQuarter,
        rank: rank,
        reason: endReason || undefined,
        score: score,
      });
    }
  }, [status]); // 移除 uploadScore 依赖，避免重复执行

  if (status !== GameStatus.COMPLETED && status !== GameStatus.FAILED) {
    return null;
  }

  const isWin = status === GameStatus.COMPLETED;
  const endMessage = endReason ? END_MESSAGES[endReason] : END_MESSAGES.reputation_depleted;

  /**
   * 重新连接到服务器获取 runId
   */
  const handleReconnect = async () => {
    setIsReconnecting(true);
    setBiographyError(null);

    try {
      const response = await startGameApi();
      setRunId(response.runId);
      console.log('✅ 重新连接成功，runId:', response.runId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '连接失败，请检查后端服务是否运行';
      setBiographyError(errorMessage);
      console.error('重新连接失败:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  /**
   * 生成职业传记（流式）
   */
  const handleGenerateBiography = async () => {
    console.log('=== handleGenerateBiography 开始 ===');
    console.log('当前状态:', {
      runId,
      showBiography,
      biographyLength: biography?.length,
      biographyKey,
      isGenerating,
    });

    if (!runId) {
      console.error('❌ runId 为空，无法生成传记');
      setBiographyError('无法生成传记：缺少游戏记录 ID');
      return;
    }

    // 如果正在生成，先停止
    if (abortControllerRef.current) {
      console.log('⏹️ 中止之前的请求');
      abortControllerRef.current.abort();
    }

    // 重置所有状态
    console.log('🔄 重置所有状态');
    setIsGenerating(true);
    setBiographyError(null);
    setCopySuccess(false);
    setShareSuccess(false);
    setShowBiography(true);
    setBiography(''); // 清空传记
    setIsIncomplete(false);
    setBiographyKey(prev => {
      const newKey = prev + 1;
      console.log(`🔑 biographyKey: ${prev} -> ${newKey}`);
      return newKey;
    });

    console.log('✅ 状态已重置，准备调用 generateBiographyStream');

    // 创建新的 AbortController 用于取消
    abortControllerRef.current = new AbortController();

    try {
      console.log('📡 开始调用 generateBiographyStream，runId:', runId, 'forceRegenerate: true');
      await generateBiographyStream(
        runId,
        {
          playerName: playerName || '匿名玩家',
          finalRank: rank || '未知',
          endReason: endReason || '游戏结束',
          quartersPlayed: currentQuarter || 0,
          finalStats: {
            cash: stats.cash || 0,
            health: stats.health || 0,
            reputation: stats.reputation || 0,
            workAbility: stats.workAbility || 0,
            luck: stats.luck || 0,
          },
          gameStats: {
            completedProjects: gameStats?.completedProjects || 0,
            qualityProjects: gameStats?.qualityProjects || 0,
          },
          keyDecisions: keyDecisions.map((d) => ({
            event: d.event,
            choice: d.choice,
          })),
          quarterlyActions: quarterlyActions,
        },
        {
          onChunk: (chunk: string) => {
            console.log('📝 onChunk 收到内容，长度:', chunk.length, '当前传记长度:', biography?.length);
            setBiography(prev => {
              const newContent = (prev || '') + chunk;
              console.log('📝 传记更新:', {
                prevLength: prev?.length || 0,
                chunkLength: chunk.length,
                newLength: newContent.length,
              });
              return newContent;
            });
          },
          onComplete: (content: string) => {
            console.log('✅ onComplete, 最终内容长度:', content.length);
            setBiography(content);
            setIsIncomplete(false);
            setIsGenerating(false);
          },
          onError: (error: string, partialContent?: string) => {
            console.error('❌ onError:', error, 'partialContent 长度:', partialContent?.length);
            if (error.includes('取消') || error.includes('超时')) {
              setIsIncomplete(true);
            }
            if (partialContent) {
              setBiography(partialContent);
            }
            setBiographyError(error);
            setIsGenerating(false);
          },
        },
        abortControllerRef.current.signal,
        true // forceRegenerate: 强制重新生成，忽略缓存
      );
    } catch (error) {
      console.error('❌ generateBiographyStream 抛出异常:', error);
      const errorMessage = error instanceof Error ? error.message : '生成传记失败，请稍后重试';
      setBiographyError(errorMessage);
      console.error('生成传记失败:', error);
      setIsGenerating(false);
    }
  };

  /**
   * 停止生成传记
   */
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsIncomplete(true);
      setIsGenerating(false);
    }
  };

  /**
   * 复制传记到剪贴板
   */
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      setBiographyError('复制失败，请手动复制文本');
    }
  };

  /**
   * 分享传记
   */
  const shareBiographyLink = async () => {
    if (!runId) {
      setBiographyError('无法分享传记：缺少游戏记录 ID');
      return;
    }

    try {
      const result = await shareBiographyApi(runId);
      // 复制分享链接到剪贴板
      await navigator.clipboard.writeText(result.shareUrl);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '分享失败，请稍后重试';
      setBiographyError(errorMessage);
      console.error('分享传记失败:', error);
    }
  };

  const handlePlayAgain = () => {
    resetGame();
    navigate('/character-creation');
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
                  <div className="text-2xl mb-1">📅</div>
                  <div className="text-xs text-slate-500 mb-1">经历季度</div>
                  <div className="text-lg font-bold text-slate-800 tabular-nums">
                    Q{currentQuarter}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-feishu p-4 border border-slate-100 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                  <div className="text-2xl mb-1">🏗️</div>
                  <div className="text-xs text-slate-500 mb-1">完成项目</div>
                  <div className="text-lg font-bold text-slate-800 tabular-nums">
                    {gameStats?.completedProjects ?? 0}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-feishu p-4 border border-slate-100 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="text-2xl mb-1">⭐</div>
                  <div className="text-xs text-slate-500 mb-1">优质项目</div>
                  <div className="text-lg font-bold text-slate-800 tabular-nums">
                    {gameStats?.qualityProjects ?? 0}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-feishu p-4 border border-slate-100 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                  <div className="text-2xl mb-1">❤️</div>
                  <div className="text-xs text-slate-500 mb-1">剩余健康</div>
                  <div className="text-lg font-bold text-slate-800 tabular-nums">
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
                    <span className="text-base font-bold text-emerald-600 tabular-nums">{stats.cash}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-feishu">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">❤️</span>
                      <span className="text-sm text-slate-600">健康</span>
                    </div>
                    <span className="text-base font-bold text-red-500 tabular-nums">{stats.health}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-feishu">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">⭐</span>
                      <span className="text-sm text-slate-600">声誉</span>
                    </div>
                    <span className="text-base font-bold text-amber-500 tabular-nums">{stats.reputation}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-feishu">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">💼</span>
                      <span className="text-sm text-slate-600">工作能力</span>
                    </div>
                    <span className="text-base font-bold text-blue-500 tabular-nums">{stats.workAbility}</span>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3">
                <button
                  onClick={handlePlayAgain}
                  className={`w-full py-4 px-6 rounded-feishu font-bold text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2
                            shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]
                            ${isWin
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 focus:ring-green-500 border-2 border-green-700'
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 focus:ring-blue-500 border-2 border-blue-800'
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
                           bg-gradient-to-r from-purple-600 to-indigo-700
                           hover:from-purple-500 hover:to-indigo-600
                           shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]
                           focus:ring-purple-500 border-2 border-purple-800"
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

              {/* 职业传记功能 */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-slate-700 mb-2">✨ 职业传记</h3>
                  <p className="text-sm text-slate-500">让 AI 为你记录这段难忘的职场历程</p>
                </div>

                {/* 生成传记按钮 */}
                {!showBiography && (
                  <>
                    <button
                      onClick={handleGenerateBiography}
                      disabled={isGenerating || !runId}
                      className={`w-full py-4 px-6 rounded-feishu font-bold text-white transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2
                                shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]
                                ${isGenerating || !runId
                                  ? 'bg-slate-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:ring-indigo-500 border-2 border-indigo-800'
                                }`}
                    >
                      <span className="flex items-center justify-center">
                        <span className="mr-2">{isGenerating ? '⏳' : '📖'}</span>
                        {isGenerating ? 'AI 正在书写你的故事...' : '生成职业传记'}
                      </span>
                    </button>

                    {/* runId 为 null 时的提示信息和重新连接按钮 */}
                    {!runId && !isGenerating && (
                      <div className="mt-3 space-y-2">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-feishu">
                          <p className="text-xs text-amber-700 text-center">
                            ⚠️ 游戏会话未连接到服务器
                          </p>
                        </div>
                        <button
                          onClick={handleReconnect}
                          disabled={isReconnecting}
                          className="w-full py-2 px-4 rounded-feishu font-medium text-slate-700 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                                   bg-slate-100 hover:bg-slate-200 border border-slate-300 active:scale-[0.98]
                                   flex items-center justify-center text-sm"
                        >
                          <span className="mr-2">{isReconnecting ? '⏳' : '🔄'}</span>
                          {isReconnecting ? '正在连接...' : '重新连接服务器'}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* 错误提示 */}
                {biographyError && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-feishu">
                    <p className="text-sm text-red-600 text-center">{biographyError}</p>
                  </div>
                )}

                {/* 传记展示区域 */}
                {showBiography && (
                  <div className="mt-4 animate-fade-in">
                    <div className="bg-white border-2 border-indigo-100 rounded-feishu-lg shadow-lg overflow-hidden">
                      {/* 传记标题 */}
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-100">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-bold text-indigo-700 flex items-center">
                            <span className="mr-2">📜</span>
                            {playerName || '匿名玩家'}的职业传记
                          </h4>
                          {isGenerating && (
                            <div className="flex items-center text-sm text-indigo-600">
                              <span className="animate-pulse mr-2">✨</span>
                              <span className="animate-pulse">正在生成...</span>
                            </div>
                          )}
                          {isIncomplete && !isGenerating && (
                            <div className="flex items-center text-sm text-amber-600">
                              <span className="mr-1">⚠️</span>
                              <span>未完成</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 传记内容 */}
                      <div className="p-6">
                        {/* 生成中显示停止按钮 */}
                        {isGenerating && (
                          <div className="mb-4 flex justify-center">
                            <button
                              onClick={handleStopGeneration}
                              className="py-2 px-6 rounded-feishu font-medium text-red-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
                                       bg-red-50 hover:bg-red-100 border border-red-200 active:scale-[0.98]
                                       flex items-center"
                            >
                              <span className="mr-2">⏹️</span>
                              停止生成
                            </button>
                          </div>
                        )}

                        <div className="text-sm">
                          <ReactMarkdown
                            key={biographyKey}
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-xl font-bold text-slate-800 mb-3 mt-4" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-lg font-bold text-slate-800 mb-2 mt-3" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-base font-bold text-slate-800 mb-2 mt-3" {...props} />,
                              p: ({node, ...props}) => <p className="text-slate-700 leading-relaxed mb-3" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside text-slate-700 mb-3 space-y-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside text-slate-700 mb-3 space-y-1" {...props} />,
                              li: ({node, ...props}) => <li className="text-slate-700" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-indigo-700" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-300 pl-4 py-2 my-4 bg-indigo-50 text-slate-700 italic" {...props} />,
                            }}
                          >
                            {biography || '_正在生成..._'}
                          </ReactMarkdown>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="px-6 pb-6 flex gap-3">
                        <button
                          onClick={() => biography && copyToClipboard(biography)}
                          disabled={isGenerating || !biography}
                          className={`flex-1 py-3 px-4 rounded-feishu font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                                   flex items-center justify-center
                                   ${isGenerating || !biography
                                     ? 'bg-slate-300 text-slate-400 cursor-not-allowed border border-slate-200'
                                     : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 active:scale-[0.98]'
                                   }`}
                        >
                          <span className="mr-2">{copySuccess ? '✅' : '📋'}</span>
                          {copySuccess ? '已复制' : '复制文本'}
                        </button>
                        <button
                          onClick={shareBiographyLink}
                          disabled={isGenerating || isIncomplete || !biography}
                          className={`flex-1 py-3 px-4 rounded-feishu font-medium transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2
                                   flex items-center justify-center shadow-md hover:shadow-lg
                                   ${isGenerating || isIncomplete || !biography
                                     ? 'bg-slate-300 text-slate-400 cursor-not-allowed border border-slate-200'
                                     : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border border-indigo-700 active:scale-[0.98]'
                                   }`}
                        >
                          <span className="mr-2">{shareSuccess ? '✅' : '📤'}</span>
                          {shareSuccess ? '链接已复制' : '分享我的故事'}
                        </button>
                      </div>
                    </div>

                    {/* 重新生成按钮 */}
                    <button
                      onClick={handleGenerateBiography}
                      disabled={isGenerating}
                      className="mt-4 w-full py-3 px-6 rounded-feishu font-medium text-slate-600 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2
                               bg-slate-50 hover:bg-slate-100 border border-slate-200 active:scale-[0.98] text-sm"
                    >
                      🔄 重新生成传记
                    </button>
                  </div>
                )}
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

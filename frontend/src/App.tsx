import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
// 旧游戏系统暂时禁用
// import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
// import StrategyPhase from './pages/StrategyPhase';
// import QuarterlySettlement from './pages/QuarterlySettlement';
import { MainGame } from './pages/MainGame';
import { CharacterCreationPage } from './pages/CharacterCreationPage';
import { useGameStore } from '@/store/gameStoreNew';

/**
 * 应用内容组件
 * 包含导航监听和页面卸载监听逻辑
 */
function AppContent() {
  const location = useLocation();
  const prevLocation = useRef(location.pathname);
  const {
    status,
    deviceId,
    runId,
    playerName,
    playerGender,
    currentQuarter,
    rank,
    score,
    stats,
    inventory,
    materialPrices,
    materialPriceHistory,
    nextQuarterRealPrices,
    pricePredictions,
    relationships,
    maintenanceCount,
    materialTradeCount,
    maintainedRelationships,
    projectProgress,
    projectQuality,
    projectCompletedThisQuarter,
    team,
    currentEvent,
    eventHistory,
    pendingEvents,
    quarterEvents,
    currentEventIndex,
    completedEventResults,
    allEventHistory,
    pendingEventResult,
    showEventResult,
    actionPoints,
    maxActionPoints,
    actionsThisQuarter,
    actionsSinceLastEventCheck,
    currentQuarterActionCounts,
    trainingCooldowns,
    currentQuarterTrainingCounts,
    pricePredictionBonus,
    storageFeeDiscount,
    qualityProjectJustCompleted,
    keyDecisions,
    quarterlyActions,
    specialEventCount,
    isLLMEnhancing,
    currentSettlement,
    phase,
    endReason,
    maxActionsPerQuarter,
    gameStats,
    actualSalary,
  } = useGameStore();

  /**
   * 导航监听：从其他页面导航到首页时触发保存
   */
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevLocation.current;

    // 检测是否从游戏页面导航到首页
    const isNavigatingToHome = currentPath === '/' && prevPath.startsWith('/game-new');
    const isNavigatingToCharacterCreation = currentPath === '/character-creation' && prevPath.startsWith('/game-new');

    if ((isNavigatingToHome || isNavigatingToCharacterCreation) && status === 'playing') {
      // 构建保存数据
      const saveData = {
        slotId: 1,
        gameState: {
          playerName,
          playerGender,
          runId,
          deviceId,
          stats,
          score,
          status,
          currentQuarter,
          maxActionsPerQuarter,
          phase,
          endReason,
          rank,
          actualSalary,
          gameStats,
          inventory,
          materialPrices,
          materialPriceHistory,
          nextQuarterRealPrices,
          pricePredictions,
          relationships,
          maintenanceCount,
          materialTradeCount,
          maintainedRelationships: Array.from(maintainedRelationships),
          projectProgress,
          projectQuality,
          projectCompletedThisQuarter,
          team,
          currentEvent,
          eventHistory,
          pendingEvents,
          quarterEvents,
          currentEventIndex,
          completedEventResults,
          allEventHistory,
          pendingEventResult,
          showEventResult,
          actionPoints,
          maxActionPoints,
          actionsThisQuarter,
          actionsSinceLastEventCheck,
          currentQuarterActionCounts,
          trainingCooldowns,
          currentQuarterTrainingCounts,
          pricePredictionBonus,
          storageFeeDiscount,
          qualityProjectJustCompleted,
          keyDecisions,
          quarterlyActions,
          specialEventCount,
          isLLMEnhancing,
          currentSettlement,
        },
      };

      // 使用 fetch 发送保存请求（使用 keepalive 确保请求能够完成）
      fetch('/api/saves/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData),
        keepalive: true, // 确保在页面卸载时请求能够完成
      }).catch((error) => {
        console.error('导航时自动保存失败:', error);
        // 失败时备份到 localStorage
        try {
          const backupKey = `civil-engineering-save-backup-1`;
          localStorage.setItem(backupKey, JSON.stringify(saveData.gameState));
          console.log('存档已备份到 localStorage:', backupKey);
        } catch (backupError) {
          console.error('备份到 localStorage 失败:', backupError);
        }
      });
    }

    // 更新上一次的位置
    prevLocation.current = currentPath;
  }, [location.pathname, status]);

  /**
   * 页面卸载监听：beforeunload 事件使用 sendBeacon 保存
   */
  useEffect(() => {
    const handleBeforeUnload = () => {
      // 只有在游戏进行中且有必要的 ID 时才保存
      if (status !== 'playing' || !deviceId || !runId) {
        return;
      }

      // 构建保存数据
      const saveData = {
        slotId: 1,
        gameState: {
          playerName,
          playerGender,
          runId,
          deviceId,
          stats,
          score,
          status,
          currentQuarter,
          maxActionsPerQuarter,
          phase,
          endReason,
          rank,
          actualSalary,
          gameStats,
          inventory,
          materialPrices,
          materialPriceHistory,
          nextQuarterRealPrices,
          pricePredictions,
          relationships,
          maintenanceCount,
          materialTradeCount,
          maintainedRelationships: Array.from(maintainedRelationships),
          projectProgress,
          projectQuality,
          projectCompletedThisQuarter,
          team,
          currentEvent,
          eventHistory,
          pendingEvents,
          quarterEvents,
          currentEventIndex,
          completedEventResults,
          allEventHistory,
          pendingEventResult,
          showEventResult,
          actionPoints,
          maxActionPoints,
          actionsThisQuarter,
          actionsSinceLastEventCheck,
          currentQuarterActionCounts,
          trainingCooldowns,
          currentQuarterTrainingCounts,
          pricePredictionBonus,
          storageFeeDiscount,
          qualityProjectJustCompleted,
          keyDecisions,
          quarterlyActions,
          specialEventCount,
          isLLMEnhancing,
          currentSettlement,
        },
      };

      // 使用 sendBeacon 发送保存请求（最适合 beforeunload 场景）
      // sendBeacon 是异步的，不会阻塞页面卸载，且可靠性更高
      const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' });
      const result = navigator.sendBeacon('/api/saves/save', blob);

      if (!result) {
        console.error('sendBeacon 保存失败，尝试备份到 localStorage');
        // 如果 sendBeacon 失败，尝试同步备份到 localStorage
        try {
          const backupKey = `civil-engineering-save-backup-1`;
          localStorage.setItem(backupKey, JSON.stringify(saveData.gameState));
        } catch (backupError) {
          console.error('备份到 localStorage 失败:', backupError);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [
    status,
    deviceId,
    runId,
    playerName,
    playerGender,
    currentQuarter,
    rank,
    score,
    stats,
    inventory,
    materialPrices,
    materialPriceHistory,
    nextQuarterRealPrices,
    pricePredictions,
    relationships,
    maintenanceCount,
    materialTradeCount,
    maintainedRelationships,
    projectProgress,
    projectQuality,
    projectCompletedThisQuarter,
    team,
    currentEvent,
    eventHistory,
    pendingEvents,
    quarterEvents,
    currentEventIndex,
    completedEventResults,
    allEventHistory,
    pendingEventResult,
    showEventResult,
    actionPoints,
    maxActionPoints,
    actionsThisQuarter,
    actionsSinceLastEventCheck,
    currentQuarterActionCounts,
    trainingCooldowns,
    currentQuarterTrainingCounts,
    pricePredictionBonus,
    storageFeeDiscount,
    qualityProjectJustCompleted,
    keyDecisions,
    quarterlyActions,
    specialEventCount,
    isLLMEnhancing,
    currentSettlement,
    phase,
    endReason,
    maxActionsPerQuarter,
    gameStats,
    actualSalary,
  ]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* 人物创建页面 */}
      <Route path="/character-creation" element={<CharacterCreationPage />} />
      {/* 新游戏系统（使用行动点和团队管理） */}
      <Route path="/game-new/*" element={<MainGame />} />
      {/* 旧游戏系统（季度制和事件驱动）- 暂时禁用 */}
      {/* <Route path="/game" element={<Game />} /> */}
      {/* <Route path="/strategy" element={<StrategyPhase />} /> */}
      {/* <Route path="/settlement" element={<QuarterlySettlement />} /> */}
      {/* <Route path="/result" element={<Result />} /> */}
      <Route path="/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

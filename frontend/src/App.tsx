import { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import { DebugPage } from './pages/Debug';
import { MainGame } from './pages/MainGame';
import { CharacterCreationPage } from './pages/CharacterCreationPage';
import { useGameStore } from '@/store/gameStoreNew';
import { GameStatus } from '@shared/types';

/**
 * 应用内容组件
 * 包含导航监听和页面卸载监听逻辑
 */
function AppContent() {
  const location = useLocation();
  const prevLocation = useRef(location.pathname);
  const status = useGameStore((state) => state.status);

  /**
   * 导航监听：从其他页面导航到首页时触发保存
   */
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevLocation.current;

    // 检测是否从游戏页面导航到首页
    const isNavigatingToHome = currentPath === '/' && prevPath.startsWith('/game-new');

    if (isNavigatingToHome && status === GameStatus.PLAYING) {
      // 动态获取最新状态并保存
      const store = useGameStore.getState();
      const saveData = {
        slotId: 1,
        gameState: { ...store },
      };

      fetch('/api/saves/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
        keepalive: true,
      }).catch((error) => {
        console.error('导航时自动保存失败:', error);
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
      // 动态获取最新状态（避免闭包捕获过期值）
      const store = useGameStore.getState();
      const { status, deviceId, runId, playerName, playerGender, currentQuarter, rank, gameStats } = store;

      // 只有在游戏进行中且有必要的 ID 时才保存
      if (status !== GameStatus.PLAYING || !deviceId || !runId) {
        return;
      }

      // 构建保存数据（按后端期望的格式）
      const saveData = {
        slotId: 1,
        deviceId,
        runId,
        playerName,
        playerGender,
        currentQuarter,
        rank,
        status,
        actualSalary: store.actualSalary,
        gameStats,
        gameState: { ...store }, // 完整的游戏状态
      };

      // 使用 sendBeacon 发送保存请求
      const blob = new Blob([JSON.stringify(saveData)], { type: 'application/json' });
      navigator.sendBeacon('/api/saves/save', blob);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []); // 空依赖数组，只注册一次

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/character-creation" element={<CharacterCreationPage />} />
      <Route path="/game-new/*" element={<MainGame />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/debug" element={<DebugPage />} />
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

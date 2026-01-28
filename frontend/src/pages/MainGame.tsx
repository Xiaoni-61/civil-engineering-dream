import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { TopStatusBar } from '@/components/TopStatusBar';
import { BottomNav } from '@/components/BottomNav';
import { ActionsPage } from '@/pages/ActionsPage';
import { TeamPage } from '@/pages/TeamPage';
import { MarketPage } from '@/pages/MarketPage';
import { RelationsPage } from '@/pages/RelationsPage';
import { EventsPage } from '@/pages/EventsPage';
import { QuarterlySettlementPage } from '@/pages/QuarterlySettlementPage';
import Result from '@/pages/Result';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { Rank, GameStatus } from '@shared/types';

export function MainGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const rank = useGameStoreNew((state) => state.rank);
  const quarterEvents = useGameStoreNew((state) => state.quarterEvents);
  const isAllEventsCompleted = useGameStoreNew((state) => state.isAllEventsCompleted);
  const status = useGameStoreNew((state) => state.status);

  const isLateGame = rank === Rank.PROJECT_MANAGER ||
                     rank === Rank.PROJECT_DIRECTOR ||
                     rank === Rank.PARTNER;

  // 检查是否是结果页面
  const isResultPage = location.pathname === '/game-new/result';

  // 如果游戏结束且不在结果页面，自动跳转
  useEffect(() => {
    if ((status === GameStatus.FAILED || status === GameStatus.COMPLETED) && !isResultPage) {
      navigate('/game-new/result', { replace: true });
    }
  }, [status, isResultPage, navigate]);

  // 检查当前路径是否在 /game-new 下
  const isInGame = location.pathname.startsWith('/game-new');

  // 检查是否有待处理的事件（显示结果时不跳转，让玩家可以看到完整流程）
  const hasPendingEvents = quarterEvents.length > 0 &&
                          !isAllEventsCompleted();

  // 如果有待处理事件且不在事件页面，自动跳转
  useEffect(() => {
    // 调试日志
    console.log('[MainGame] 事件状态检查:', {
      hasPendingEvents,
      currentPath: location.pathname,
      quarterEventsLength: quarterEvents.length,
      isAllEventsCompleted: isAllEventsCompleted()
    });

    if (hasPendingEvents && location.pathname !== '/game-new/events' && !isResultPage) {
      console.log('[MainGame] 强制跳转到事件页面');
      navigate('/game-new/events', { replace: true });
    }
  }, [hasPendingEvents, location.pathname, navigate, quarterEvents.length, isAllEventsCompleted, isResultPage]);

  if (!isInGame) {
    return <Navigate to="/game-new/actions" replace />;
  }

  // 结果页面：不显示 TopBar 和 BottomNav
  if (isResultPage) {
    return <Result />;
  }

  return (
    <div className="min-h-screen">
      {/* 顶部状态栏 */}
      <TopStatusBar />

      {/* 主内容区域 */}
      <Routes>
        <Route
          path="/actions"
          element={
            hasPendingEvents ?
              <Navigate to="/game-new/events" replace /> :
              <ActionsPage />
          }
        />
        <Route
          path="/team"
          element={
            hasPendingEvents ?
              <Navigate to="/game-new/events" replace /> :
              <TeamPage />
          }
        />
        <Route
          path="/market"
          element={
            hasPendingEvents ?
              <Navigate to="/game-new/events" replace /> :
              <MarketPage />
          }
        />
        <Route
          path="/relations"
          element={
            hasPendingEvents ?
              <Navigate to="/game-new/events" replace /> :
              <RelationsPage />
          }
        />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/settlement" element={<QuarterlySettlementPage />} />
        <Route path="/result" element={<Result />} />
        <Route path="*" element={<Navigate to="/game-new/actions" replace />} />
      </Routes>

      {/* 底部导航栏 */}
      <BottomNav isLateGame={isLateGame} />
    </div>
  );
}

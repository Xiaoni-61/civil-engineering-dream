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
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';
import { Rank } from '@shared/types';

export function MainGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const rank = useGameStoreNew((state) => state.rank);
  const quarterEvents = useGameStoreNew((state) => state.quarterEvents);
  const isAllEventsCompleted = useGameStoreNew((state) => state.isAllEventsCompleted);

  const isLateGame = rank === Rank.PROJECT_MANAGER ||
                     rank === Rank.PROJECT_DIRECTOR ||
                     rank === Rank.PARTNER;

  // 检查当前路径是否在 /game-new 下
  const isInGame = location.pathname.startsWith('/game-new');

  // 检查是否有待处理的事件（显示结果时不跳转，让玩家可以看到完整流程）
  const hasPendingEvents = quarterEvents.length > 0 &&
                          !isAllEventsCompleted();

  // 如果有待处理事件且不在事件页面，自动跳转
  useEffect(() => {
    if (hasPendingEvents && location.pathname !== '/game-new/events') {
      navigate('/game-new/events', { replace: true });
    }
  }, [hasPendingEvents, location.pathname, navigate]);

  if (!isInGame) {
    return <Navigate to="/game-new/actions" replace />;
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
        <Route path="*" element={<Navigate to="/game-new/actions" replace />} />
      </Routes>

      {/* 底部导航栏 */}
      <BottomNav isLateGame={isLateGame} />
    </div>
  );
}

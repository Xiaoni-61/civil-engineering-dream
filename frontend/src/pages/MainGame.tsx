import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
  const rank = useGameStoreNew((state) => state.rank);

  const isLateGame = rank === Rank.PROJECT_MANAGER ||
                     rank === Rank.PROJECT_DIRECTOR ||
                     rank === Rank.PARTNER;

  // 检查当前路径是否在 /game-new 下
  const isInGame = location.pathname.startsWith('/game-new');

  if (!isInGame) {
    return <Navigate to="/game-new/actions" replace />;
  }

  return (
    <div className="min-h-screen">
      {/* 顶部状态栏 */}
      <TopStatusBar />

      {/* 主内容区域 */}
      <Routes>
        <Route path="/actions" element={<ActionsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/relations" element={<RelationsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/settlement" element={<QuarterlySettlementPage />} />
        <Route path="*" element={<Navigate to="/game-new/actions" replace />} />
      </Routes>

      {/* 底部导航栏 */}
      <BottomNav isLateGame={isLateGame} />
    </div>
  );
}

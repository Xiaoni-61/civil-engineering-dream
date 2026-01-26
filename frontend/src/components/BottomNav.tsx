import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore as useGameStoreNew } from '@/store/gameStoreNew';

interface BottomNavProps {
  isLateGame?: boolean;
}

const navItems = [
  { path: '/game-new/actions', label: '行动', icon: '⚡' },
  { path: '/game-new/team', label: '团队', icon: '👥' },
  { path: '/game-new/market', label: '市场', icon: '📊' },
  { path: '/game-new/relations', label: '关系', icon: '🤝' },
  { path: '/game-new/events', label: '事件', icon: '📜' },
];

export function BottomNav({ isLateGame = false }: BottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const quarterEvents = useGameStoreNew((state) => state.quarterEvents);
  const isAllEventsCompleted = useGameStoreNew((state) => state.isAllEventsCompleted);

  // 计算待处理事件数量
  const hasPendingEvents = quarterEvents.length > 0 && !isAllEventsCompleted();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isLocked = item.path === '/game-new/team' && !isLateGame;

          // 如果有待处理事件且当前不是事件页面，其他按钮显示禁用状态
          const isBlocked = hasPendingEvents && item.path !== '/game-new/events';

          return (
            <button
              key={item.path}
              onClick={() => {
                if (!isLocked && !isBlocked) {
                  navigate(item.path);
                }
              }}
              disabled={isLocked || isBlocked}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-all duration-200
                ${isActive ? 'text-brand-700' : 'text-slate-700'}
                ${(isLocked || isBlocked) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${!isLocked && !isBlocked ? 'hover:bg-slate-50 active:bg-slate-100' : ''}
              `}
            >
              <div className="relative">
                <span className="text-xl">{item.icon}</span>
                {isLocked && (
                  <span className="absolute -top-1 -right-1 text-xs">🔒</span>
                )}
                {hasPendingEvents && item.path === '/game-new/events' && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                    !
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

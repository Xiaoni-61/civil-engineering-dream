import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { Rank } from '@shared/types';

const navItems = [
  { path: '/game/actions', label: '行动', icon: '⚡' },
  { path: '/game/team', label: '团队', icon: '👥' },
  { path: '/game/market', label: '市场', icon: '📊' },
  { path: '/game/relations', label: '关系', icon: '🤝' },
  { path: '/game/events', label: '事件', icon: '📜' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const rank = useGameStore((state) => state.rank);
  const pendingEvents = useGameStore((state) => state.pendingEvents);

  const isTeamUnlocked = rank === Rank.PROJECT_MANAGER ||
                        rank === Rank.PROJECT_DIRECTOR ||
                        rank === Rank.PARTNER;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isLocked = item.path === '/game/team' && !isTeamUnlocked;
          const pendingCount = item.path === '/game/events' ? pendingEvents.length : 0;

          return (
            <button
              key={item.path}
              onClick={() => !isLocked && navigate(item.path)}
              disabled={isLocked}
              className={`
                flex flex-col items-center justify-center flex-1 h-full
                transition-all duration-200
                ${isActive ? 'text-brand-600' : 'text-slate-600'}
                ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                hover:bg-slate-50 active:bg-slate-100
              `}
            >
              <div className="relative">
                <span className="text-xl">{item.icon}</span>
                {isLocked && (
                  <span className="absolute -top-1 -right-1 text-xs">🔒</span>
                )}
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {pendingCount}
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

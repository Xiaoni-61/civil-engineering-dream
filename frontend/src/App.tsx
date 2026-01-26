import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
// 旧游戏系统暂时禁用
// import Game from './pages/Game';
// import Result from './pages/Result';
import Leaderboard from './pages/Leaderboard';
// import StrategyPhase from './pages/StrategyPhase';
// import QuarterlySettlement from './pages/QuarterlySettlement';
import { MainGame } from './pages/MainGame';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* 新游戏系统（使用行动点和团队管理） */}
        <Route path="/game-new/*" element={<MainGame />} />
        {/* 旧游戏系统（季度制和事件驱动）- 暂时禁用 */}
        {/* <Route path="/game" element={<Game />} /> */}
        {/* <Route path="/strategy" element={<StrategyPhase />} /> */}
        {/* <Route path="/settlement" element={<QuarterlySettlement />} /> */}
        {/* <Route path="/result" element={<Result />} /> */}
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;

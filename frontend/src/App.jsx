import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LearningModeProvider } from './context/LearningModeContext';
import { TradingProvider } from './context/TradingContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Market from './pages/Market';
import Portfolio from './pages/Portfolio';
import TradeHistory from './pages/TradeHistory';
import Watchlist from './pages/Watchlist';
import Leaderboard from './pages/Leaderboard';
import LearnTrading from './pages/LearnTrading';
import Settings from './pages/Settings';
import Login from './components/Login';
import SignUp from './components/SignUp';

function App() {
  return (
    <ThemeProvider>
      <LearningModeProvider>
        <TradingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="market" element={<Market />} />
              <Route path="portfolio" element={<Portfolio />} />
              <Route path="trade-history" element={<TradeHistory />} />
              <Route path="watchlist" element={<Watchlist />} />
              <Route path="leaderboard" element={<Leaderboard />} />
              <Route path="learn-trading" element={<LearnTrading />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
        </TradingProvider>
      </LearningModeProvider>
    </ThemeProvider>
  );
}

export default App;

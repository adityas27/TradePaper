import ThemeToggle from './ThemeToggle';
import { useLearningMode } from '../../context/LearningModeContext';
import { useTrading } from '../../context/TradingContext';

export default function Topbar() {
  const { learningMode, toggleLearningMode } = useLearningMode();
  const { balance } = useTrading();

  return (
    <header className="topbar">
      <h1 className="topbar-title">TradePaper</h1>
      <div className="topbar-actions">
        <span className="topbar-balance">
          Balance: ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <button
          className={`learning-mode-toggle ${learningMode ? 'active' : ''}`}
          onClick={toggleLearningMode}
          aria-label="Toggle learning mode"
        >
          Learning: {learningMode ? 'On' : 'Off'}
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}

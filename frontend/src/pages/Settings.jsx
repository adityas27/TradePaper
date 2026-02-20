import Card from '../components/ui/Card';
import ThemeToggle from '../components/layout/ThemeToggle';
import { useLearningMode } from '../context/LearningModeContext';

export default function Settings() {
  const { learningMode, toggleLearningMode } = useLearningMode();

  return (
    <div className="page">
      <h1 className="page-title">Settings</h1>
      <div className="page-content">
        <section>
          <Card>
            <h3 className="card-title">Theme</h3>
            <div className="settings-row">
              <span className="settings-label">Choose your preferred theme</span>
              <ThemeToggle />
            </div>
          </Card>
        </section>

        <section>
          <Card>
            <h3 className="card-title">Learning Mode</h3>
            <div className="settings-row">
              <span className="settings-label">
                Enable guided learning features (tooltips and tips)
              </span>
              <button
                className={`learning-mode-toggle ${learningMode ? 'active' : ''}`}
                onClick={toggleLearningMode}
                aria-label="Toggle learning mode"
              >
                {learningMode ? 'On' : 'Off'}
              </button>
            </div>
          </Card>
        </section>

        <section>
          <Card>
            <h3 className="card-title">More Settings</h3>
            <p className="card-description">
              Additional settings will be available in future updates.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}

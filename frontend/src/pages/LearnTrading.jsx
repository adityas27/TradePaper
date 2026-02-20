import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const MODULES = [
  'Introduction to Stocks',
  'Types of Orders',
  'Risk & Diversification',
  'Profit & Loss',
  'Portfolio Basics',
  'Trading Psychology',
];

const MOCK_QUESTIONS = [
  { q: 'What is a stock?', options: ['A share of ownership', 'A type of bond', 'A currency', 'A loan'] },
  { q: 'What does P&L mean?', options: ['Profit and Loss', 'Portfolio and Liabilities', 'Price and Leverage', 'Purchase and Liquidation'] },
  { q: 'Why is diversification important?', options: ['Reduces risk', 'Increases fees', 'Guarantees returns', 'Simplifies taxes'] },
];

export default function LearnTrading() {
  const [activeModule, setActiveModule] = useState(0);

  return (
    <div className="page learn-trading-page">
      <h1 className="page-title">Learn Trading</h1>
      <div className="learn-trading-layout">
        <aside className="learn-sidebar">
          <Card>
            <h3 className="card-title">Course Modules</h3>
            <nav className="module-nav">
              {MODULES.map((module, index) => (
                <button
                  key={module}
                  className={`module-link ${activeModule === index ? 'active' : ''}`}
                  onClick={() => setActiveModule(index)}
                >
                  <span className="module-check">{activeModule === index ? '✓' : ''}</span>
                  {index + 1}. {module}
                </button>
              ))}
            </nav>
          </Card>
        </aside>
        <div className="learn-content">
          <Card>
            <h2 className="module-title">{MODULES[activeModule]}</h2>
            <p className="module-description">
              This module covers the key concepts and fundamentals you need to understand
              before diving into trading. Build a strong foundation to make informed decisions.
            </p>
            <ul className="module-bullets">
              <li>Understand core terminology and concepts</li>
              <li>Learn how markets function</li>
              <li>Identify key factors that affect prices</li>
            </ul>
            <div className="progress-section">
              <span className="progress-label">Progress</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '40%' }} />
              </div>
              <span className="progress-value">40%</span>
            </div>
            <section className="quiz-section">
              <h3 className="card-title">Quiz</h3>
              {MOCK_QUESTIONS.map((item, idx) => (
                <div key={idx} className="quiz-card">
                  <p className="quiz-question">{item.q}</p>
                  <div className="quiz-options">
                    {item.options.map((opt) => (
                      <label key={opt} className="quiz-option">
                        <input type="radio" name={`q${idx}`} value={opt} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <Button variant="primary">Submit</Button>
            </section>
          </Card>
        </div>
      </div>
    </div>
  );
}

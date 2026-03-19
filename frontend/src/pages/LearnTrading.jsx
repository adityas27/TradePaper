import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const MODULES = [
  {
    id: 0,
    title: 'Introduction to Stocks',
    level: 'Beginner',
    readingTime: '8 min read',
    summary:
      'Learn what stocks are, why companies issue them, and how they trade on stock exchanges.',
    heroImage:
      'https://dummyimage.com/640x200/0f172a/ffffff&text=How+Stock+Markets+Work',
    sections: [
      {
        heading: 'What is a stock?',
        body: [
          'A stock (or share) represents a tiny slice of ownership in a company. When you buy one share of a company, you own a proportional claim on its assets and profits.',
          'Public companies list their shares on stock exchanges (like the NYSE or NASDAQ), where buyers and sellers meet to trade throughout the day.',
        ],
      },
      {
        heading: 'Why do companies issue stock?',
        body: [
          'Companies issue stock to raise capital. Instead of taking on debt from a bank, they can sell ownership stakes to investors and use that money to grow the business.',
          'In return, investors hope that the company will grow, become more profitable, and that the value of their shares will increase over time.',
        ],
      },
      {
        heading: 'How stock prices move',
        body: [
          'Prices are driven by supply and demand. When more people want to buy than sell, the price goes up; when more want to sell than buy, the price goes down.',
          'Expectations about future earnings, interest rates, news, and overall sentiment all influence this delicate balance.',
        ],
        bulletPoints: [
          'Positive earnings surprises often push prices higher.',
          'Bad news (lawsuits, product failures, scandals) can push prices lower.',
          'Macro events (central bank decisions, recessions) affect the entire market.',
        ],
      },
    ],
    keyTakeaways: [
      'Stocks are slices of ownership in a company.',
      'Public companies list shares on exchanges so anyone can trade them.',
      'Prices move based on supply, demand, and expectations about the future.',
    ],
  },
  {
    id: 1,
    title: 'Types of Orders',
    level: 'Beginner',
    readingTime: '10 min read',
    summary:
      'Understand how different order types control the price and timing of your trades.',
    heroImage:
      'https://dummyimage.com/640x200/111827/22c55e&text=Market+vs+Limit+Orders',
    sections: [
      {
        heading: 'Market orders',
        body: [
          'A market order tells your broker: “Buy or sell this stock immediately at the best available price.”',
          'It prioritizes execution over price, which makes it simple but can be risky in volatile or illiquid stocks, where the last-traded price may differ from the final fill price.',
        ],
      },
      {
        heading: 'Limit orders',
        body: [
          'A limit order sets the maximum price you are willing to pay (for a buy) or the minimum price you are willing to accept (for a sell).',
          'This gives you price control, but it does not guarantee execution, especially if the market never reaches your limit price.',
        ],
        bulletPoints: [
          'Use buy limit orders below the current price.',
          'Use sell limit orders above the current price.',
        ],
      },
      {
        heading: 'Stop and stop‑limit orders',
        body: [
          'Stop‑loss orders are designed to automatically sell if the price falls to a certain level, helping you limit downside risk.',
          'Stop‑limit orders combine a stop trigger with a limit price, but can fail to execute in fast markets if the price gaps below your limit.',
        ],
      },
    ],
    keyTakeaways: [
      'Market orders focus on speed; limit orders focus on price.',
      'Stop orders can help automate exits and manage risk.',
      'Choosing the right order type depends on liquidity, volatility, and your priorities.',
    ],
  },
  {
    id: 2,
    title: 'Risk & Diversification',
    level: 'Intermediate',
    readingTime: '12 min read',
    summary:
      'Learn how to manage risk, avoid concentration, and build diversified portfolios.',
    heroImage:
      'https://dummyimage.com/640x200/0b1120/f97316&text=Diversification+and+Risk',
    sections: [
      {
        heading: 'Different types of risk',
        body: [
          'Market risk: the risk that the entire market falls (e.g. during a recession).',
          'Company‑specific risk: the risk tied to a single business, such as product failures or lawsuits.',
          'Liquidity risk: the risk that you cannot enter or exit a position at a fair price.',
        ],
      },
      {
        heading: 'Why diversification works',
        body: [
          'Diversification means spreading your capital across different assets so that any single investment has limited impact on your total portfolio.',
          'When one stock underperforms, others may outperform, smoothing your overall returns.',
        ],
        bulletPoints: [
          'Avoid putting more than a small percentage into any single stock.',
          'Mix sectors (tech, finance, healthcare, etc.).',
          'Consider mixing asset classes (stocks, bonds, cash).',
        ],
      },
      {
        heading: 'Position sizing basics',
        body: [
          'Position sizing is deciding how much to allocate to each trade.',
          'Many traders risk only 1–2% of their capital on a single trade, limiting damage from bad outcomes.',
        ],
      },
    ],
    keyTakeaways: [
      'You cannot eliminate risk, but you can manage and diversify it.',
      'Concentration magnifies both gains and losses; diversification smooths the ride.',
      'Position sizing is as important as picking good stocks.',
    ],
  },
  {
    id: 3,
    title: 'Profit & Loss',
    level: 'Intermediate',
    readingTime: '10 min read',
    summary:
      'Understand how to read profit & loss, calculate returns, and track performance.',
    heroImage:
      'https://dummyimage.com/640x200/020617/38bdf8&text=Profit+and+Loss+Basics',
    sections: [
      {
        heading: 'Realized vs. unrealized P&L',
        body: [
          'Realized profit or loss occurs when you close a position (sell shares you bought earlier).',
          'Unrealized P&L reflects how much you would gain or lose if you sold at current market prices.',
        ],
      },
      {
        heading: 'Calculating returns',
        body: [
          'Simple return = (current value − initial investment) ÷ initial investment.',
          'You can annualize returns to compare investments held for different lengths of time.',
        ],
      },
      {
        heading: 'Tracking performance',
        body: [
          'Good traders track not only returns but also risk: volatility, maximum drawdown, and win‑rate.',
          'Keeping a trading journal helps you review decisions and improve your process.',
        ],
      },
    ],
    keyTakeaways: [
      'Know the difference between realized and unrealized P&L.',
      'Always relate profits and losses to the amount of capital at risk.',
      'Consistently tracking performance helps you improve over time.',
    ],
  },
  {
    id: 4,
    title: 'Portfolio Basics',
    level: 'Intermediate',
    readingTime: '12 min read',
    summary:
      'Learn how to think in terms of portfolios instead of one‑off trades.',
    heroImage:
      'https://dummyimage.com/640x200/020617/a855f7&text=Building+a+Portfolio',
    sections: [
      {
        heading: 'Core vs. satellite approach',
        body: [
          'A “core” portfolio is a diversified base (often broad index funds or ETFs).',
          '“Satellite” positions are smaller, higher‑conviction ideas around that core.',
        ],
      },
      {
        heading: 'Rebalancing',
        body: [
          'Over time, winners grow to be a larger share of your portfolio, and losers shrink.',
          'Rebalancing means periodically trimming winners and adding to laggards (or cash) to restore your target allocation.',
        ],
      },
      {
        heading: 'Time horizon and goals',
        body: [
          'Your investment horizon (short‑term trading vs. long‑term investing) should influence how aggressive your portfolio is.',
          'Short‑term money should not be exposed to large drawdowns; long‑term money can usually tolerate more risk.',
        ],
      },
    ],
    keyTakeaways: [
      'Think in terms of an overall portfolio, not isolated trades.',
      'Rebalancing keeps risk aligned with your plan.',
      'Match your portfolio to your time horizon and goals.',
    ],
  },
  {
    id: 5,
    title: 'Trading Psychology',
    level: 'Advanced',
    readingTime: '15 min read',
    summary:
      'Master the mental side of trading: discipline, emotions, and decision‑making.',
    heroImage:
      'https://dummyimage.com/640x200/020617/f97316&text=Trading+Psychology',
    sections: [
      {
        heading: 'Common emotional traps',
        body: [
          'Fear of missing out (FOMO) can push you into chasing parabolic moves.',
          'Loss aversion can make you hold onto losing trades far too long.',
        ],
      },
      {
        heading: 'Building a trading plan',
        body: [
          'A written plan defines your setups, risk per trade, maximum daily loss, and exit rules.',
          'Following the plan consistently is more important than any single trade outcome.',
        ],
      },
      {
        heading: 'Review and reflection',
        body: [
          'Regularly review your trades to spot patterns: which setups work, which don’t, and how emotions influenced your decisions.',
          'Over time, this reflection loop can improve discipline and confidence.',
        ],
      },
    ],
    keyTakeaways: [
      'Emotions are inevitable, but you can design processes that limit their impact.',
      'A clear trading plan is your anchor during volatility.',
      'Continuous review turns experience into skill.',
    ],
  },
];

const MODULE_QUIZZES = {
  0: [
    {
      q: 'What does each share of stock represent?',
      options: [
        'A share of ownership in a company',
        'A guaranteed dividend payment',
        'A fixed‑income contract',
        'A loan you give the government',
      ],
      correct: 'A share of ownership in a company',
    },
    {
      q: 'Where are most large‑company stocks traded?',
      options: ['On stock exchanges', 'Only at banks', 'On crypto platforms', 'Directly with the CEO'],
      correct: 'On stock exchanges',
    },
    {
      q: 'Stock prices move primarily because of:',
      options: [
        'Supply and demand',
        'Random luck only',
        'Company logos',
        'Website design',
      ],
      correct: 'Supply and demand',
    },
    {
      q: 'Which factor can strongly affect a company’s stock price?',
      options: ['Earnings reports', 'The CEO’s favorite color', 'Office furniture', 'Website font'],
      correct: 'Earnings reports',
    },
  ],
  1: [
    {
      q: 'Which order type focuses on immediate execution?',
      options: ['Market order', 'Limit order', 'Stop‑loss order', 'Stop‑limit order'],
      correct: 'Market order',
    },
    {
      q: 'Which order type lets you set the maximum price you will pay?',
      options: ['Market order', 'Limit order', 'Trailing stop', 'Iceberg order'],
      correct: 'Limit order',
    },
    {
      q: 'A stop‑loss order is mainly used to:',
      options: ['Limit downside risk', 'Guarantee profit', 'Avoid taxes', 'Improve liquidity'],
      correct: 'Limit downside risk',
    },
    {
      q: 'Which is a risk of market orders?',
      options: [
        'Slippage in volatile markets',
        'They never execute',
        'They require margin',
        'They always move price up',
      ],
      correct: 'Slippage in volatile markets',
    },
  ],
  2: [
    {
      q: 'Diversification mainly helps you:',
      options: ['Reduce risk', 'Eliminate all losses', 'Increase fees', 'Break regulations'],
      correct: 'Reduce risk',
    },
    {
      q: 'Holding only one stock usually means:',
      options: ['High concentration risk', 'Perfect safety', 'Guaranteed profits', 'No market exposure'],
      correct: 'High concentration risk',
    },
    {
      q: 'Which of the following is a diversified approach?',
      options: [
        'Owning stocks across several sectors',
        'Putting everything into one meme stock',
        'Keeping all money in cash',
        'Day‑trading a single ticker only',
      ],
      correct: 'Owning stocks across several sectors',
    },
    {
      q: 'Position sizing is about:',
      options: [
        'How much you allocate to each trade',
        'Choosing broker leverage',
        'Selecting a monitor size',
        'Picking your favorite ticker symbol',
      ],
      correct: 'How much you allocate to each trade',
    },
  ],
  3: [
    {
      q: 'P&L stands for:',
      options: [
        'Profit and Loss',
        'Portfolio and Liabilities',
        'Price and Leverage',
        'Position and Liquidity',
      ],
      correct: 'Profit and Loss',
    },
    {
      q: 'Realized profit occurs when you:',
      options: [
        'Close a position',
        'Only open a position',
        'Deposit cash',
        'Watch a chart',
      ],
      correct: 'Close a position',
    },
    {
      q: 'Unrealized P&L is:',
      options: [
        'The gain/loss if you sold now',
        'Always zero',
        'Only dividends received',
        'Irrelevant for trading',
      ],
      correct: 'The gain/loss if you sold now',
    },
    {
      q: 'Simple return is calculated as:',
      options: [
        '(current value − initial) ÷ initial',
        '(initial − current) × 100',
        'initial ÷ current',
        'fees minus taxes',
      ],
      correct: '(current value − initial) ÷ initial',
    },
  ],
  4: [
    {
      q: 'A core‑satellite portfolio typically means:',
      options: [
        'A diversified core plus smaller satellite positions',
        'Only one stock in the portfolio',
        'Only bonds and cash',
        'Only day‑trades',
      ],
      correct: 'A diversified core plus smaller satellite positions',
    },
    {
      q: 'Rebalancing a portfolio means:',
      options: [
        'Adjusting holdings back to target allocations',
        'Closing all positions',
        'Adding leverage',
        'Ignoring risk and letting winners run forever',
      ],
      correct: 'Adjusting holdings back to target allocations',
    },
    {
      q: 'Why does time horizon matter?',
      options: [
        'It affects how much risk you can reasonably take',
        'It does not matter at all',
        'It only affects broker fees',
        'It only matters for bond traders',
      ],
      correct: 'It affects how much risk you can reasonably take',
    },
    {
      q: 'Short‑term money should usually be:',
      options: [
        'Invested conservatively',
        'Placed entirely into volatile stocks',
        'Ignored until retirement',
        'Locked in illiquid assets',
      ],
      correct: 'Invested conservatively',
    },
  ],
  5: [
    {
      q: 'Which behavior reflects good trading psychology?',
      options: [
        'Sticking to a written plan',
        'Chasing every spike on social media',
        'Doubling down on every loss',
        'Trading when extremely emotional',
      ],
      correct: 'Sticking to a written plan',
    },
    {
      q: 'Loss aversion often causes traders to:',
      options: [
        'Hold losers too long',
        'Cut losses quickly',
        'Ignore emotions completely',
        'Only trade index funds',
      ],
      correct: 'Hold losers too long',
    },
    {
      q: 'A trading journal is useful because it:',
      options: [
        'Helps you review and improve decisions',
        'Guarantees profits',
        'Eliminates all emotions',
        'Replaces risk management',
      ],
      correct: 'Helps you review and improve decisions',
    },
    {
      q: 'FOMO stands for:',
      options: [
        'Fear of Missing Out',
        'Future Options Market Order',
        'Fixed Order Management Objective',
        'Fundamental Order Metric Outcome',
      ],
      correct: 'Fear of Missing Out',
    },
  ],
};

const STORAGE_KEY = 'tradepaper_learn_progress_v1';

export default function LearnTrading() {
  const [activeModule, setActiveModule] = useState(0);
  const [answers, setAnswers] = useState({});
  const [completedModules, setCompletedModules] = useState([]);
  const [lastResult, setLastResult] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setCompletedModules(parsed.completedModules || []);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    const payload = { completedModules };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [completedModules]);

  const active = MODULES[activeModule] || MODULES[0];
  const quiz = MODULE_QUIZZES[active.id] || [];
  const moduleCompleted = completedModules.includes(active.id);

  const handleSelect = (qIndex, option) => {
    setAnswers((prev) => ({
      ...prev,
      [active.id]: {
        ...(prev[active.id] || {}),
        [qIndex]: option,
      },
    }));
  };

  const handleSubmit = () => {
    const moduleAnswers = answers[active.id] || {};
    const total = quiz.length;
    let correct = 0;

    quiz.forEach((q, idx) => {
      if (moduleAnswers[idx] === q.correct) correct += 1;
    });

    const scorePct = total ? Math.round((correct / total) * 100) : 0;

    setLastResult({
      moduleIndex: activeModule,
      correct,
      total,
      scorePct,
    });

    if (scorePct >= 70 && !moduleCompleted) {
      setCompletedModules((prev) => [...prev, active.id]);
    }
  };

  const overallProgress =
    MODULES.length > 0 ? Math.round((completedModules.length / MODULES.length) * 100) : 0;

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
                  key={module.id}
                  className={`module-link ${activeModule === index ? 'active' : ''}`}
                  onClick={() => setActiveModule(index)}
                >
                  <span className="module-check">
                    {completedModules.includes(module.id) ? '✓' : ''}
                  </span>
                  {index + 1}. {module.title}
                </button>
              ))}
            </nav>
          </Card>
        </aside>
        <div className="learn-content">
          <Card>
            <header className="module-header">
              <h2 className="module-title">{active.title}</h2>
              <div className="module-meta">
                <span className="badge">{active.level}</span>
                <span className="meta-dot">•</span>
                <span className="meta-text">{active.readingTime}</span>
              </div>
            </header>

            {active.heroImage && (
              <div className="module-hero">
                <img
                  src={active.heroImage}
                  alt={active.title}
                  className="module-hero-image"
                />
              </div>
            )}

            <p className="module-description">{active.summary}</p>

            <section className="module-article">
              {active.sections.map((section) => (
                <article key={section.heading} className="module-section">
                  <h3 className="module-section-title">{section.heading}</h3>
                  {section.body.map((paragraph, idx) => (
                    <p key={idx} className="module-paragraph">
                      {paragraph}
                    </p>
                  ))}
                  {section.bulletPoints && (
                    <ul className="module-bullets">
                      {section.bulletPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))}
            </section>

            {active.keyTakeaways && (
              <section className="module-takeaways">
                <h3 className="module-section-title">Key takeaways</h3>
                <ul className="module-bullets">
                  {active.keyTakeaways.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </section>
            )}
            <div className="progress-section">
              <span className="progress-label">
                Overall progress
              </span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
              </div>
              <span className="progress-value">{overallProgress}%</span>
            </div>
            <section className="quiz-section">
              <h3 className="card-title">Check your understanding</h3>
              {quiz.map((item, idx) => (
                <div key={idx} className="quiz-card">
                  <p className="quiz-question">{item.q}</p>
                  <div className="quiz-options">
                    {item.options.map((opt) => (
                      <label key={opt} className="quiz-option">
                        <input
                          type="radio"
                          name={`module-${active.id}-q${idx}`}
                          value={opt}
                          checked={answers[activeModule]?.[idx] === opt}
                          onChange={() => handleSelect(idx, opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <Button variant="primary" onClick={handleSubmit}>
                Submit answers
              </Button>
              {lastResult && lastResult.moduleIndex === active.id && (
                <div
                  style={{
                    marginTop: '16px',
                    padding: '12px 16px',
                    borderRadius: '6px',
                    backgroundColor: lastResult.scorePct >= 70 ? '#f0f5f0' : '#fff5f5',
                    borderLeft: `4px solid ${lastResult.scorePct >= 70 ? '#34c759' : '#ff3b30'}`,
                    color: lastResult.scorePct >= 70 ? '#34c759' : '#ff3b30',
                    fontSize: '14px',
                  }}
                >
                  You scored {lastResult.correct} / {lastResult.total} (
                  {lastResult.scorePct}%){' '}
                  {lastResult.scorePct >= 70
                    ? '- Module marked as completed.'
                    : '- Score at least 70% to complete this module.'}
                </div>
              )}
            </section>
          </Card>
        </div>
      </div>
    </div>
  );
}

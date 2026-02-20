import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTrading } from '../context/TradingContext';
import { getCurrentPrice } from '../data/mockStocks';

export default function Dashboard() {
  const { balance, portfolio } = useTrading();

  const totalInvestment = portfolio.reduce(
    (sum, p) => sum + p.quantity * p.avgBuyPrice,
    0
  );
  const currentPortfolioValue = portfolio.reduce((sum, p) => {
    const price = getCurrentPrice(p.symbol) ?? p.avgBuyPrice;
    return sum + p.quantity * price;
  }, 0);
  const profitLoss = Math.round((currentPortfolioValue - totalInvestment) * 100) / 100;

  const formatCurrency = (value) => `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      <div className="page-content">
        <section>
          <h2 className="section-title">Summary</h2>
          <div className="cards-grid cards-grid-2">
            <Card className="summary-card summary-card-investment">
              <span className="card-icon" aria-hidden="true">📊</span>
              <h3 className="card-title">Total Investment</h3>
              <p className="card-value">{formatCurrency(totalInvestment)}</p>
              <p className="card-subtitle">Total cost basis</p>
            </Card>
            <Card className="summary-card summary-card-value">
              <span className="card-icon" aria-hidden="true">💰</span>
              <h3 className="card-title">Current Portfolio Value</h3>
              <p className="card-value">{formatCurrency(currentPortfolioValue)}</p>
              <p className="card-subtitle">Based on current prices</p>
            </Card>
            <Card className="summary-card summary-card-pnl">
              <span className="card-icon" aria-hidden="true">📈</span>
              <h3 className="card-title">Profit / Loss</h3>
              <p className={`card-value ${profitLoss >= 0 ? 'text-positive' : 'text-negative'}`}>
                {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
              </p>
              <p className="card-subtitle">Unrealized P&L</p>
            </Card>
            <Card className="summary-card summary-card-balance">
              <span className="card-icon" aria-hidden="true">💵</span>
              <h3 className="card-title">Available Balance</h3>
              <p className="card-value">{formatCurrency(balance)}</p>
              <p className="card-subtitle">Cash available</p>
            </Card>
          </div>
        </section>

        <section>
          <Card className="performance-card">
            <h3 className="card-title">Portfolio Performance</h3>
            <div className="chart-placeholder-area">
              <span className="chart-placeholder-icon">📉</span>
              Chart placeholder
            </div>
            <p className="chart-caption">Performance data will appear here when available.</p>
          </Card>
        </section>

        <section>
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/market">
              <Button variant="primary">Go to Market</Button>
            </Link>
            <Link to="/portfolio">
              <Button variant="secondary">View Portfolio</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

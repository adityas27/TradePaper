import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTrading } from '../context/TradingContext';

export default function Dashboard() {
  const [prices, setPrices] = useState({});
  const { portfolio, holdings, balance, loading } = useTrading();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8001/ws/prices');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrices(data);
    };

    return () => ws.close();
  }, []);

  const formatCurrency = (value) =>
    `$${Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const totalInvestment = holdings.reduce((sum, h) => {
    return sum + (h.quantity * parseFloat(h.avg_buy_price));
  }, 0);

  const currentPortfolioValue = holdings.reduce((sum, h) => {
    const currentPrice = prices[h.ticker_symbol] || parseFloat(h.avg_buy_price);
    return sum + (h.quantity * currentPrice);
  }, 0);

  const profitLoss = currentPortfolioValue - totalInvestment;
  const totalValue = balance + currentPortfolioValue;

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Dashboard</h1>
        <Card><p>Loading...</p></Card>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>

      <div className="page-content">
        <section>
          <h2 className="section-title">Summary</h2>

          <div className="cards-grid cards-grid-2">
            <Card className="summary-card summary-card-investment">
              <span className="card-icon">📊</span>
              <h3 className="card-title">Total Investment</h3>
              <p className="card-value">{formatCurrency(totalInvestment)}</p>
              <p className="card-subtitle">Total cost basis</p>
            </Card>

            <Card className="summary-card summary-card-value">
              <span className="card-icon">💰</span>
              <h3 className="card-title">Current Portfolio Value</h3>
              <p className="card-value">{formatCurrency(currentPortfolioValue)}</p>
              <p className="card-subtitle">Based on current prices</p>
            </Card>

            <Card className="summary-card summary-card-pnl">
              <span className="card-icon">📈</span>
              <h3 className="card-title">Profit / Loss</h3>
              <p className={`card-value ${profitLoss >= 0 ? 'text-positive' : 'text-negative'}`}>
                {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
              </p>
              <p className="card-subtitle">Unrealized P&L</p>
            </Card>

            <Card className="summary-card summary-card-balance">
              <span className="card-icon">💵</span>
              <h3 className="card-title">Available Balance</h3>
              <p className="card-value">{formatCurrency(balance)}</p>
              <p className="card-subtitle">Cash available</p>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="section-title">Holdings</h2>

          <Card>
            {holdings.length === 0 ? (
              <p className="empty-state">
                No holdings yet. Buy stocks from the Market.
              </p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th className="text-right">Quantity</th>
                      <th className="text-right">Avg Price</th>
                      <th className="text-right">Current Price</th>
                      <th className="text-right">P&L</th>
                    </tr>
                  </thead>

                  <tbody>
                    {holdings.map((holding) => {
                      const currentPrice =
                        prices[holding.ticker_symbol] ||
                        parseFloat(holding.avg_buy_price);

                      const pnl =
                        (currentPrice - parseFloat(holding.avg_buy_price)) *
                        holding.quantity;

                      return (
                        <tr key={holding.ticker_symbol}>
                          <td className="font-weight-600">{holding.ticker_symbol}</td>
                          <td className="text-right">{holding.quantity}</td>
                          <td className="text-right">
                            ${parseFloat(holding.avg_buy_price).toFixed(2)}
                          </td>
                          <td className="text-right">${currentPrice.toFixed(2)}</td>

                          <td className="text-right">
                            <span className={`pnl-value ${pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                              {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>

        <section>
          <Card className="performance-card">
            <h3 className="card-title">Portfolio Performance</h3>

            <div className="chart-placeholder-area">
              <span className="chart-placeholder-icon">📉</span>
              Chart placeholder
            </div>

            <p className="chart-caption">
              Performance data will appear here when available.
            </p>
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

            <Link to="/trade-history">
              <Button variant="secondary">Trade History</Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
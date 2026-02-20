import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTrading } from '../context/TradingContext';
import { getCurrentPrice } from '../data/mockStocks';

export default function Portfolio() {
  const { portfolio, sellStock } = useTrading();
  const [quantities, setQuantities] = useState({});

  const handleQuantityChange = (symbol, value) => {
    const num = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [symbol]: isNaN(num) || num < 1 ? '' : Math.floor(num),
    }));
  };

  const handleSell = (symbol, price, maxQty) => {
    const qty = quantities[symbol];
    if (!qty || qty < 1) {
      alert('Please enter a valid quantity.');
      return;
    }
    if (qty > maxQty) {
      alert('You cannot sell more than you own.');
      return;
    }
    const success = sellStock(symbol, price, qty);
    if (!success) {
      alert('Unable to sell. Check your quantity.');
      return;
    }
    setQuantities((prev) => ({ ...prev, [symbol]: '' }));
  };

  const holdings = portfolio.map((p) => {
    const currentPrice = getCurrentPrice(p.symbol) ?? p.avgBuyPrice;
    const pnl = (currentPrice - p.avgBuyPrice) * p.quantity;
    return {
      ...p,
      currentPrice,
      pnl: Math.round(pnl * 100) / 100,
    };
  });

  const totalInvested = holdings.reduce((sum, h) => sum + h.quantity * h.avgBuyPrice, 0);
  const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  const highestPercentage =
    totalValue > 0
      ? Math.max(...holdings.map((h) => (h.quantity * h.currentPrice) / totalValue))
      : 0;
  const diversificationScore = Math.min(100, Math.max(0, Math.round(100 - highestPercentage * 100)));

  const getDiversificationLabel = (score) => {
    if (score >= 80) return 'Well Diversified';
    if (score >= 50) return 'Moderate';
    return 'High Concentration Risk';
  };

  return (
    <div className="page">
      <h1 className="page-title">Portfolio</h1>
      <div className="page-content">
        <section>
          <h2 className="section-title">Holdings</h2>
          <Card>
            {holdings.length === 0 ? (
              <p className="empty-state">No holdings yet. Buy stocks from the Market.</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th className="text-right">Quantity</th>
                      <th className="text-right">Avg Buy Price</th>
                      <th className="text-right">Current Price</th>
                      <th className="text-right">Profit / Loss</th>
                      <th>Qty to Sell</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding) => (
                      <tr key={holding.symbol}>
                        <td className="font-weight-600">{holding.symbol}</td>
                        <td className="text-right">{holding.quantity}</td>
                        <td className="text-right">${holding.avgBuyPrice.toFixed(2)}</td>
                        <td className="text-right">${holding.currentPrice.toFixed(2)}</td>
                        <td className="text-right">
                          <span className={`pnl-value ${holding.pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                            {holding.pnl >= 0 ? '+' : ''}${holding.pnl.toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            max={holding.quantity}
                            className="quantity-input"
                            placeholder="0"
                            value={quantities[holding.symbol] || ''}
                            onChange={(e) => handleQuantityChange(holding.symbol, e.target.value)}
                          />
                        </td>
                        <td>
                          <Button
                            variant="secondary"
                            className="btn-sm"
                            onClick={() => handleSell(holding.symbol, holding.currentPrice, holding.quantity)}
                          >
                            Sell
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </section>

        <section>
          <Card>
            <h3 className="card-title">Diversification Score</h3>
            <div className="diversification-placeholder">
              <div
                className="diversification-ring diversification-score-circle"
                style={{ '--score': holdings.length > 0 ? diversificationScore : 0 }}
                data-score={diversificationScore}
              >
                <span>{holdings.length > 0 ? diversificationScore : '--'}</span>
              </div>
              <p className="diversification-label">
                Score: {holdings.length > 0 ? `${diversificationScore} / 100` : '-- / 100'}
              </p>
              <p className={`diversification-classification diversification-${holdings.length > 0 ? (diversificationScore >= 80 ? 'high' : diversificationScore >= 50 ? 'medium' : 'low') : 'none'}`}>
                {holdings.length > 0 ? getDiversificationLabel(diversificationScore) : '—'}
              </p>
            </div>
            <p className="card-description">
              A higher diversification score indicates your portfolio is spread across different
              sectors and asset types, which can help reduce risk.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}

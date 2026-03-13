import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTrading } from '../context/TradingContext';
import * as tradingAPI from '../api/trading';

export default function Portfolio() {
  const [prices, setPrices] = useState({});
  const [quantities, setQuantities] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [isSelling, setIsSelling] = useState({});

  const { portfolio, holdings, balance, sellStock } = useTrading();

  // Connect to WebSocket for live prices
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8001/ws/prices');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrices(data);
    };
    return () => ws.close();
  }, []);

  const handleQuantityChange = (symbol, value) => {
    const num = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [symbol]: isNaN(num) || num < 1 ? '' : Math.floor(num),
    }));
  };

  const handleSell = async (symbol, maxQty) => {
    const qty = quantities[symbol];
    if (!qty || qty < 1) {
      setStatusMessage('❌ Please enter a valid quantity.');
      return;
    }
    if (qty > maxQty) {
      setStatusMessage('❌ You cannot sell more than you own.');
      return;
    }

    setIsSelling((prev) => ({ ...prev, [symbol]: true }));
    setStatusMessage(`⏳ Selling ${qty} shares of ${symbol}...`);

    try {
      const success = await sellStock(symbol, qty, prices[symbol] || 0);
      
      if (success) {
        setStatusMessage(`✅ Successfully sold ${qty} shares of ${symbol}!`);
        setQuantities((prev) => ({ ...prev, [symbol]: '' }));
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        setStatusMessage('❌ Sale failed. Please try again.');
      }
    } catch (err) {
      setStatusMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsSelling((prev) => ({ ...prev, [symbol]: false }));
    }
  };

  const holdingsWithPrices = holdings.map(h => {
    const currentPrice = prices[h.ticker_symbol] || parseFloat(h.avg_buy_price);
    const pnl = (currentPrice - parseFloat(h.avg_buy_price)) * h.quantity;
    return {
      ...h,
      currentPrice,
      pnl
    };
  });

  const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  const highestPercentage = totalValue > 0
    ? Math.max(...holdingsWithPrices.map((h) => (h.quantity * h.currentPrice) / totalValue))
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
        {statusMessage && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '16px',
            backgroundColor: statusMessage.includes('✅') ? '#f0f5f0' : '#fff5f5',
            borderLeft: `4px solid ${statusMessage.includes('✅') ? '#34c759' : '#ff3b30'}`,
            color: statusMessage.includes('✅') ? '#34c759' : '#ff3b30',
          }}>
            {statusMessage}
          </div>
        )}

        {portfolio && (
          <Card style={{ marginBottom: '24px' }}>
            <h3 className="card-title">Balance</h3>
            <div className="card-value">${balance.toFixed(2)}</div>
          </Card>
        )}

        <section>
          <h2 className="section-title">Holdings</h2>
          <Card>
            {holdingsWithPrices.length === 0 ? (
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
                    {holdingsWithPrices.map((holding) => (
                      <tr key={holding.ticker_symbol}>
                        <td className="font-weight-600">{holding.ticker_symbol}</td>
                        <td className="text-right">{holding.quantity}</td>
                        <td className="text-right">${parseFloat(holding.avg_buy_price).toFixed(2)}</td>
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
                            value={quantities[holding.ticker_symbol] || ''}
                            onChange={(e) => handleQuantityChange(holding.ticker_symbol, e.target.value)}
                          />
                        </td>
                        <td>
                          <Button
                            variant="secondary"
                            className="btn-sm"
                            onClick={() => handleSell(holding.ticker_symbol, holding.quantity)}
                            disabled={isSelling[holding.ticker_symbol] || !quantities[holding.ticker_symbol]}
                          >
                            {isSelling[holding.ticker_symbol] ? 'Selling...' : 'Sell'}
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
                style={{ '--score': holdingsWithPrices.length > 0 ? diversificationScore : 0 }}
                data-score={diversificationScore}
              >
                <span>{holdingsWithPrices.length > 0 ? diversificationScore : '--'}</span>
              </div>
              <p className="diversification-label">
                Score: {holdingsWithPrices.length > 0 ? `${diversificationScore} / 100` : '-- / 100'}
              </p>
              <p className={`diversification-classification diversification-${holdingsWithPrices.length > 0 ? (diversificationScore >= 80 ? 'high' : diversificationScore >= 50 ? 'medium' : 'low') : 'none'}`}>
                {holdingsWithPrices.length > 0 ? getDiversificationLabel(diversificationScore) : '—'}
              </p>
            </div>
            <p className="card-description">
              A higher diversification score indicates your portfolio is spread across different stocks.
            </p>
          </Card>
        </section>
      </div>
    </div>
  );
}

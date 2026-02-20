import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RiskMeter from '../components/ui/RiskMeter';
import { useTrading } from '../context/TradingContext';

const MOCK_STOCKS = [
  { symbol: 'AAPL', companyName: 'Apple Inc.', price: 178.25, changePercent: 1.24 },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc.', price: 141.80, changePercent: -0.52 },
  { symbol: 'MSFT', companyName: 'Microsoft Corporation', price: 378.91, changePercent: 2.15 },
  { symbol: 'AMZN', companyName: 'Amazon.com Inc.', price: 178.50, changePercent: 0.85 },
  { symbol: 'NVDA', companyName: 'NVIDIA Corporation', price: 495.22, changePercent: -1.33 },
  { symbol: 'META', companyName: 'Meta Platforms Inc.', price: 504.50, changePercent: 3.02 },
  { symbol: 'TSLA', companyName: 'Tesla Inc.', price: 242.18, changePercent: -0.78 },
  { symbol: 'JPM', companyName: 'JPMorgan Chase & Co.', price: 195.40, changePercent: 0.42 },
];

export default function Market() {
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState({});
  const { balance, portfolio, buyStock } = useTrading();

  const handleQuantityChange = (symbol, value) => {
    const num = parseInt(value, 10);
    setQuantities((prev) => ({
      ...prev,
      [symbol]: isNaN(num) || num < 1 ? '' : Math.floor(num),
    }));
  };

  const handleBuy = (symbol, price) => {
    const qty = quantities[symbol];
    if (!qty || qty < 1) {
      alert('Please enter a valid quantity.');
      return;
    }
    const success = buyStock(symbol, price, qty);
    if (!success) {
      alert('Insufficient balance.');
      return;
    }
    setQuantities((prev) => ({ ...prev, [symbol]: '' }));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Market Overview</h1>
        <input
          type="text"
          className="search-input"
          placeholder="Search stocks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="page-content">
        <Card>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company Name</th>
                  <th className="text-right">Current Price</th>
                  <th className="text-right">Change %</th>
                  <th>Quantity</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {MOCK_STOCKS.map((stock) => {
                  const qty = quantities[stock.symbol] || '';
                  const investmentAmount = qty ? qty * stock.price : 0;
                  const showRiskMeter = qty > 0;
                  return (
                    <React.Fragment key={stock.symbol}>
                      <tr key={stock.symbol}>
                        <td className="font-weight-600">{stock.symbol}</td>
                        <td>{stock.companyName}</td>
                        <td className="text-right">${stock.price.toFixed(2)}</td>
                        <td className="text-right">
                          <span className={stock.changePercent >= 0 ? 'text-positive' : 'text-negative'}>
                            {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
                          </span>
                        </td>
                        <td>
                          <div className="quantity-input-wrapper">
                            <input
                              type="number"
                              min="1"
                              className="quantity-input"
                              placeholder="0"
                              value={qty}
                              onChange={(e) => handleQuantityChange(stock.symbol, e.target.value)}
                            />
                            <span className="quantity-helper">Shares</span>
                          </div>
                        </td>
                        <td>
                          <div className="buy-cell">
                            <Button
                              variant="primary"
                              className="btn-sm"
                              onClick={() => handleBuy(stock.symbol, stock.price)}
                            >
                              Buy
                            </Button>
                          </div>
                        </td>
                        <td>
                          <button className="icon-btn" aria-label="Add to watchlist">★</button>
                        </td>
                      </tr>
                      {showRiskMeter && (
                        <tr key={`${stock.symbol}-risk`} className="risk-meter-row">
                          <td colSpan="7">
                            <RiskMeter
                              investmentAmount={investmentAmount}
                              balance={balance}
                              portfolio={portfolio}
                              symbol={stock.symbol}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

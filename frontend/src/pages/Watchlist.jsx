import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const MOCK_WATCHLIST = [
  { symbol: 'AAPL', price: 178.25, changePercent: 1.24 },
  { symbol: 'GOOGL', price: 141.80, changePercent: -0.52 },
  { symbol: 'MSFT', price: 378.91, changePercent: 2.15 },
  { symbol: 'AMZN', price: 178.50, changePercent: 0.85 },
  { symbol: 'NVDA', price: 495.22, changePercent: -1.33 },
  { symbol: 'META', price: 504.50, changePercent: 3.02 },
];

export default function Watchlist() {
  return (
    <div className="page">
      <h1 className="page-title">Watchlist</h1>
      <div className="page-content">
        <div className="watchlist-grid">
          {MOCK_WATCHLIST.map((stock) => (
            <Card key={stock.symbol} className="watchlist-card">
              <h3 className="watchlist-symbol">{stock.symbol}</h3>
              <p className="watchlist-price">${stock.price.toFixed(2)}</p>
              <p className={stock.changePercent >= 0 ? 'text-positive' : 'text-negative'}>
                {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%
              </p>
              <Button variant="primary" className="btn-sm watchlist-buy-btn">Quick Buy</Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

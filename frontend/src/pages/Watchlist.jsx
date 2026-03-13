import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import * as tradingAPI from '../api/trading';

export default function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
    
    // Connect to live prices
    const ws = new WebSocket('ws://localhost:8001/ws/prices');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrices(data);
    };
    return () => ws.close();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const res = await tradingAPI.getWatchlist();
      setWatchlist(res);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (tickerSymbol) => {
    try {
      await tradingAPI.toggleWatchlist(tickerSymbol);
      setWatchlist(watchlist.filter(item => item.ticker_symbol !== tickerSymbol));
    } catch (err) {
      console.error('Failed to remove from watchlist:', err);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Watchlist</h1>
        <Card><p>Loading...</p></Card>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Watchlist</h1>
      <div className="page-content">
        {watchlist.length === 0 ? (
          <Card>
            <p className="empty-state">
              Your watchlist is empty. Add stocks from the Market page.
            </p>
          </Card>
        ) : (
          <div className="watchlist-grid">
            {watchlist.map((item) => (
              <Card key={item.id} className="watchlist-card">
                <div className="watchlist-symbol">{item.ticker_symbol}</div>
                <div className="watchlist-price">
                  ${(prices[item.ticker_symbol] || 0).toFixed(2)}
                </div>
                <Button
                  variant="danger"
                  className="btn-sm"
                  onClick={() => removeFromWatchlist(item.ticker_symbol)}
                  style={{ marginTop: '12px' }}
                >
                  Remove
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

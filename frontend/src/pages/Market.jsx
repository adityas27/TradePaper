import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Zap } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import RiskMeter from '../components/ui/RiskMeter';
import { useTrading } from '../context/TradingContext';
import * as tradingAPI from '../api/trading';

const STOCK_INFO = {
  AAPL: 'Apple Inc.',
  GOOGL: 'Alphabet Inc.',
  MSFT: 'Microsoft Corporation',
  AMZN: 'Amazon.com Inc.',
  NVDA: 'NVIDIA Corporation',
  META: 'Meta Platforms Inc.',
  TSLA: 'Tesla Inc.',
  JPM: 'JPMorgan Chase & Co.',
};

export default function Market() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [quantities, setQuantities] = useState({});
  const [prices, setPrices] = useState({});
  const [connected, setConnected] = useState(false);
  const [watchlist, setWatchlist] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [isBuying, setIsBuying] = useState({});

  const { portfolio, balance, buyStock } = useTrading();

  useEffect(() => {
    console.log('Attempting to connect to WebSocket...');
    const ws = new WebSocket('ws://localhost:8001/ws/prices');

    ws.onopen = () => {
      console.log('✅ WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setPrices(data);
      } catch (e) {
        console.error('Invalid WebSocket data', e);
      }
    };

    ws.onerror = () => {
      console.error('❌ WebSocket error');
      setConnected(false);
    };

    ws.onclose = () => {
      console.log('❌ WebSocket closed');
      setConnected(false);
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const data = await tradingAPI.getWatchlist();
      setWatchlist(data.map(item => item.ticker_symbol));
    } catch (err) {
      console.error('Failed to fetch watchlist:', err);
    }
  };

  const handleQuantityChange = (symbol, value) => {
    const num = parseInt(value, 10);

    setQuantities(prev => ({
      ...prev,
      [symbol]: isNaN(num) || num < 1 ? '' : Math.floor(num),
    }));
  };

  const handleBuy = async (symbol, price) => {
    const qty = quantities[symbol];

    if (!qty || qty < 1) {
      setStatusMessage('❌ Please enter a valid quantity.');
      return;
    }

    if (!portfolio) {
      setStatusMessage('❌ Portfolio not available.');
      return;
    }

    setIsBuying((prev) => ({ ...prev, [symbol]: true }));
    setStatusMessage(`⏳ Buying ${qty} shares of ${symbol}...`);

    try {
      const success = await buyStock(symbol, price, qty);
      
      if (success) {
        setStatusMessage(`✅ Successfully bought ${qty} shares of ${symbol}!`);
        setQuantities((prev) => ({
          ...prev,
          [symbol]: ''
        }));
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        setStatusMessage('❌ Purchase failed. Check your balance.');
      }
    } catch (err) {
      setStatusMessage(`❌ Error: ${err.message}`);
    } finally {
      setIsBuying((prev) => ({ ...prev, [symbol]: false }));
    }
  };

  const toggleWatchlist = async (symbol) => {
    try {
      await tradingAPI.toggleWatchlist(symbol);

      setWatchlist(prev => {
        if (prev.includes(symbol)) {
          return prev.filter(t => t !== symbol);
        }
        return [...prev, symbol];
      });

    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
      setStatusMessage('❌ Failed to update watchlist');
    }
  };

  const stocks = Object.keys(STOCK_INFO)
    .map(symbol => ({
      symbol,
      companyName: STOCK_INFO[symbol],
      price: prices[symbol] || 0,
    }))
    .filter(stock =>
      stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stock.companyName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Market Overview</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: connected ? '#34c759' : '#ff3b30',
                display: 'inline-block',
                marginRight: '6px'
              }}
            />
            {connected ? 'Live' : 'Offline'}
          </span>

          <input
            type="text"
            className="search-input"
            placeholder="Search stocks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

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

      <div className="page-content">
        <Card>
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#666' }}>Available Balance</p>
            <p style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: '#34c759' }}>
              ${balance.toFixed(2)}
            </p>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company Name</th>
                  <th className="text-right">Current Price</th>
                  <th>Quantity</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {stocks.map((stock) => {
                  const qty = quantities[stock.symbol] || '';
                  const investmentAmount = qty ? qty * stock.price : 0;
                  const showRiskMeter = qty > 0;
                  const inWatchlist = watchlist.includes(stock.symbol);
                  const canAfford = investmentAmount <= balance;

                  return (
                    <React.Fragment key={stock.symbol}>
                      <tr>
                        <td className="font-weight-600">
                          <button
                            onClick={() => navigate(`/ticker/${stock.symbol}`)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--primary-color)',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontSize: 'inherit',
                              fontWeight: 'inherit',
                              padding: 0
                            }}
                          >
                            {stock.symbol}
                          </button>
                        </td>
                        <td>{stock.companyName}</td>
                        <td className="text-right">${stock.price.toFixed(2)}</td>

                        <td>
                          <div className="quantity-input-wrapper">
                            <input
                              type="number"
                              min="1"
                              className="quantity-input"
                              placeholder="0"
                              value={qty}
                              onChange={(e) =>
                                handleQuantityChange(stock.symbol, e.target.value)
                              }
                            />
                            <span className="quantity-helper">Shares</span>
                          </div>
                        </td>

                        <td>
                          <div className="buy-cell">
                            <Button
                              variant={canAfford && qty ? 'primary' : 'secondary'}
                              className="btn-sm"
                              onClick={() => handleBuy(stock.symbol, stock.price)}
                              disabled={isBuying[stock.symbol] || !qty || !canAfford || stock.price === 0}
                            >
                              {isBuying[stock.symbol] ? 'Buying...' : 'Buy'}
                            </Button>
                            {qty && investmentAmount > balance && (
                              <span style={{ fontSize: '12px', color: '#ff3b30', marginLeft: '8px' }}>
                                Insufficient funds
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <button
                            className="icon-btn watchlist-btn"
                            onClick={() => toggleWatchlist(stock.symbol)}
                            title={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                          >
                            <Star
                              size={20}
                              fill={inWatchlist ? 'currentColor' : 'none'}
                              color={inWatchlist ? '#fbbf24' : 'currentColor'}
                            />
                          </button>
                        </td>
                      </tr>

                      {showRiskMeter && (
                        <tr className="risk-meter-row">
                          <td colSpan="6">
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
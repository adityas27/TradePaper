import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import * as tradingAPI from '../api/trading';
import api from '../api/api';
import '../styles/TickerDetails.css';

export default function TickerDetails() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [ticker, setTicker] = useState(null);
  const [livePrice, setLivePrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inWatchlist, setInWatchlist] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!symbol) return;
    
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        const [tickerRes, priceRes] = await Promise.all([
          api.get(`tickers/${symbol}/`),
          api.get(`tickers/${symbol}/price/`)
        ]);
        
        setTicker(tickerRes.data);
        setInWatchlist(tickerRes.data.in_watchlist);
        setLivePrice(priceRes.data.price);
      } catch (err) {
        setError('Failed to load ticker details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [symbol]);

  const handleToggleWatchlist = async () => {
    try {
      await tradingAPI.toggleWatchlist(symbol);
      setInWatchlist(!inWatchlist);
      setStatusMessage(inWatchlist ? 'Removed from watchlist' : 'Added to watchlist');
      setTimeout(() => setStatusMessage(''), 2000);
    } catch (err) {
      setStatusMessage('Failed to update watchlist');
    }
  };

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Loading...</h1>
      </div>
    );
  }

  if (error || !ticker) {
    return (
      <div className="page">
        <h1 className="page-title">Error</h1>
        <Card>
          <p>{error || 'Ticker not found'}</p>
          <Button onClick={() => navigate('/market')}>Back to Market</Button>
        </Card>
      </div>
    );
  }

  const pnlColor = ticker.position && ticker.position.avg_buy_price
    ? livePrice >= ticker.position.avg_buy_price ? '#34c759' : '#ff3b30'
    : 'inherit';

  const pnl = ticker.position && ticker.position.avg_buy_price
    ? livePrice - ticker.position.avg_buy_price
    : 0;

  return (
    <div className="page">
      <div className="ticker-header">
        <div className="ticker-back">
          <button onClick={() => navigate('/market')} className="back-btn">← Back</button>
        </div>
        <h1 className="page-title">{ticker.symbol}</h1>
      </div>

      {statusMessage && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          backgroundColor: '#f0f5f0',
          borderLeft: '4px solid #34c759',
          color: '#34c759',
        }}>
          {statusMessage}
        </div>
      )}

      <div className="ticker-details-container">
        <div className="ticker-left-panel">
          <Card>
            {ticker.logo_url && (
              <div className="ticker-logo-container">
                <img src={ticker.logo_url} alt={ticker.company_name} className="ticker-logo" />
              </div>
            )}
            
            <h2 className="ticker-company-name">{ticker.company_name}</h2>
            
            {ticker.parent_company && (
              <p className="ticker-parent">Parent Company: {ticker.parent_company}</p>
            )}
            
            <div className="ticker-price-section">
              <p className="ticker-label">Current Price</p>
              <p className="ticker-price">${livePrice?.toFixed(2) || 'N/A'}</p>
            </div>

            {ticker.position && (
              <div className="ticker-position-section">
                <p className="ticker-label">Your Position</p>
                <p className="ticker-value">{ticker.position.quantity} shares</p>
                <p className="ticker-label">Avg Buy Price</p>
                <p className="ticker-value">${parseFloat(ticker.position.avg_buy_price).toFixed(2)}</p>
                <p className="ticker-label">Unrealized P&L</p>
                <p className="ticker-value" style={{ color: pnlColor }}>
                  {pnl >= 0 ? '+' : ''}${(pnl * ticker.position.quantity).toFixed(2)}
                </p>
              </div>
            )}

            <div className="ticker-actions">
              <Button
                variant={inWatchlist ? 'secondary' : 'primary'}
                onClick={handleToggleWatchlist}
                fullWidth
                icon={<Star size={18} fill={inWatchlist ? 'currentColor' : 'none'} />}
              >
                {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </Button>
            </div>

            {ticker.website && (
              <p className="ticker-website">
                <a href={ticker.website} target="_blank" rel="noopener noreferrer">
                  Visit Website →
                </a>
              </p>
            )}
          </Card>
        </div>

        <div className="ticker-right-panel">
          <Card>
            <h3 className="card-title">About</h3>
            <p className="ticker-description">
              {ticker.description || 'No description available'}
            </p>
            
            {ticker.sector && (
              <div className="ticker-meta">
                <span className="meta-label">Sector:</span>
                <span className="meta-value">{ticker.sector}</span>
              </div>
            )}
            
            {ticker.industry && (
              <div className="ticker-meta">
                <span className="meta-label">Industry:</span>
                <span className="meta-value">{ticker.industry}</span>
              </div>
            )}
            
            {ticker.exchange && (
              <div className="ticker-meta">
                <span className="meta-label">Exchange:</span>
                <span className="meta-value">{ticker.exchange}</span>
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="ticker-charts">
        <Card>
          <h3 className="card-title">Charts</h3>
          <p className="ticker-description">Open full chart pages for better zoom, pan, and interaction.</p>
          <div className="ticker-actions">
            <Button onClick={() => navigate(`/ticker/${symbol}/candles`)} fullWidth>
              Open Candlestick Chart
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/ticker/${symbol}/line`)} fullWidth>
              Open Line Chart
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

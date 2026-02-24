import React from 'react';
import { useMarketData } from '../hooks/useMarketData';

/**
 * Market Data Widget Component
 * Displays real-time stock prices from the FastAPI microservice
 */
function MarketDataWidget() {
  const { prices, connected, error } = useMarketData();

  const formatPrice = (price) => {
    if (!price || price === 0) return '--';
    return `$${price.toFixed(2)}`;
  };

  const getTickerColor = (ticker) => {
    const colors = {
      AAPL: '#A2AAAD',
      GOOGL: '#4285F4',
      MSFT: '#00A4EF',
      AMZN: '#FF9900',
      NVDA: '#76B900',
      META: '#0668E1',
      TSLA: '#E82127',
      JPM: '#117ACA',
    };
    return colors[ticker] || 'var(--primary-color)';
  };

  return (
    <div className="card">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h3 className="card-title" style={{ marginBottom: 0 }}>
          Live Market Data
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--text-muted)'
        }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: connected ? '#34c759' : '#ff3b30',
              display: 'inline-block'
            }}
          />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {error && (
        <div className="auth-error" style={{ marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px'
      }}>
        {Object.entries(prices).map(([ticker, price]) => (
          <div
            key={ticker}
            style={{
              padding: '12px',
              backgroundColor: 'var(--bg-color)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: getTickerColor(ticker),
              marginBottom: '4px'
            }}>
              {ticker}
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '700',
              color: 'var(--text-color)'
            }}>
              {formatPrice(price)}
            </div>
          </div>
        ))}
      </div>

      {!connected && Object.keys(prices).length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '24px',
          color: 'var(--text-muted)',
          fontSize: '14px'
        }}>
          Connecting to market data service...
        </div>
      )}
    </div>
  );
}

export default MarketDataWidget;

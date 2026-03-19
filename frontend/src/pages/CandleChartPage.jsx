import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LiveCandlestickChart from '../components/LiveCandlestickChart';
import '../styles/TickerDetails.css';

export default function CandleChartPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();

  return (
    <div className="page">
      <div className="ticker-header">
        <div className="ticker-back">
          <button onClick={() => navigate(`/ticker/${symbol}`)} className="back-btn">
            ← Back to Ticker
          </button>
        </div>
        <h1 className="page-title">{symbol?.toUpperCase()} Candlestick</h1>
      </div>

      <Card>
        <LiveCandlestickChart symbol={symbol} />
      </Card>

      <div className="ticker-actions" style={{ marginTop: 16 }}>
        <Button variant="secondary" onClick={() => navigate(`/ticker/${symbol}/line`)}>
          Open Line Chart
        </Button>
      </div>
    </div>
  );
}

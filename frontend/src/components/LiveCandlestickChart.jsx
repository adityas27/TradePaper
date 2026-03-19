import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import './LiveCandlestickChart.css';

const MARKET_DATA_BASE_URL = import.meta.env.VITE_MARKET_DATA_API || 'http://127.0.0.1:8001';
const INTERVAL_OPTIONS = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m (soon)', disabled: true },
];

function normalizeCandlesForChart(candles = []) {
  const byTime = new Map();

  candles.forEach((item) => {
    const isoTime = item?.time;
    if (!isoTime) return;

    const open = Number(item?.open);
    const high = Number(item?.high);
    const low = Number(item?.low);
    const close = Number(item?.close);

    if (![open, high, low, close].every(Number.isFinite)) return;

    const parsed = Date.parse(isoTime);
    if (!Number.isFinite(parsed)) return;

    byTime.set(isoTime, {
      time: isoTime,
      timeLabel: new Date(isoTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open,
      high,
      low,
      close,
      isUp: close >= open,
    });
  });

  return [...byTime.values()].sort((a, b) => Date.parse(a.time) - Date.parse(b.time));
}

function CandleStick(props) {
  const { x, y, width, height, payload } = props;

  if (!payload) return null;

  const { open, high, low, close, isUp } = payload;
  const yScale = props.yAxis.scale;
  const xScale = props.xAxis.scale;

  const yMax = yScale.domain()[1];
  const yMin = yScale.domain()[0];
  const yRange = yMax - yMin;

  const getY = (price) => {
    const ratio = (price - yMin) / yRange;
    return y + height - ratio * height;
  };

  const highY = getY(high);
  const lowY = getY(low);
  const openY = getY(open);
  const closeY = getY(close);

  const candleColor = isUp ? '#22c55e' : '#ef4444';
  const bodyTop = Math.min(openY, closeY);
  const bodyHeight = Math.max(Math.abs(closeY - openY), 1);
  const candleWidth = Math.max(width * 0.6, 4);
  const candleX = x + (width - candleWidth) / 2;

  return (
    <g>
      {/* Wick (high-low line) */}
      <line
        x1={x + width / 2}
        y1={highY}
        x2={x + width / 2}
        y2={lowY}
        stroke={candleColor}
        strokeWidth={1}
      />
      {/* Body (open-close rectangle) */}
      <rect
        x={candleX}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={candleColor}
        stroke={candleColor}
        strokeWidth={1}
        opacity={0.85}
      />
    </g>
  );
}

export default function LiveCandlestickChart({ symbol }) {
  const [interval, setInterval] = useState('1m');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [candles, setCandles] = useState([]);

  const fetchCandles = useCallback(async () => {
    if (!symbol) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${MARKET_DATA_BASE_URL}/candles/${symbol}`);
      const normalized = normalizeCandlesForChart(response.data || []);
      setCandles(normalized);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Unable to load candlestick data.');
      setCandles([]);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchCandles();

    const poll = setInterval(() => {
      fetchCandles();
    }, 3000);

    const socket = new WebSocket(`${MARKET_DATA_BASE_URL.replace('http', 'ws')}/ws/prices`);

    socket.onmessage = () => {
      fetchCandles();
    };

    socket.onerror = () => {
      /* ignore */
    };

    return () => {
      clearInterval(poll);
      socket.close();
    };
  }, [fetchCandles, interval, symbol]);

  const minPrice = useMemo(() => {
    if (candles.length === 0) return 0;
    return Math.min(...candles.map((c) => c.low)) * 0.99;
  }, [candles]);

  const maxPrice = useMemo(() => {
    if (candles.length === 0) return 1;
    return Math.max(...candles.map((c) => c.high)) * 1.01;
  }, [candles]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="candle-tooltip">
          <p className="tooltip-time">{data.time}</p>
          <p className="tooltip-ohlc">O: ${data.open.toFixed(2)}</p>
          <p className="tooltip-ohlc">H: ${data.high.toFixed(2)}</p>
          <p className="tooltip-ohlc">L: ${data.low.toFixed(2)}</p>
          <p className="tooltip-ohlc">C: ${data.close.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-wrap">
      <div className="chart-toolbar">
        <label>
          Interval
          <select value={interval} onChange={(event) => setInterval(event.target.value)}>
            {INTERVAL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <p className="chart-status">{loading ? 'Loading...' : `Last update: ${lastUpdated || '-'}`}</p>
      </div>

      {error && <p className="chart-error">{error}</p>}
      {!error && !loading && candles.length === 0 && (
        <p className="chart-status">No candle data available for this symbol yet.</p>
      )}

      {candles.length > 0 && (
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart data={candles} margin={{ top: 20, right: 40, left: 60, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis
              dataKey="timeLabel"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              interval={Math.floor(candles.length / 10) || 0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <LineChart
              data={candles}
              margin={{ top: 20, right: 40, left: 60, bottom: 40 }}
              isComposedChart
            >
              {candles.map((candle, idx) => (
                <Line
                  key={idx}
                  isAnimationActive={false}
                  type="monotone"
                  dataKey="close"
                  stroke="transparent"
                  shape={<CandleStick />}
                />
              ))}
            </LineChart>
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  Brush,
  CartesianGrid,

  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import './YfHistoryLineChart.css';

const PERIOD_OPTIONS = ['1d', '5d', '1mo', '3mo'];
const MARKET_DATA_BASE_URL = import.meta.env.VITE_MARKET_DATA_API || 'http://127.0.0.1:8001';

function formatTimeLabel(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatTooltipTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function YfHistoryLineChart({ symbol }) {
  const [period, setPeriod] = useState('1d');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');

  const fetchHistory = useCallback(async () => {
    if (!symbol) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${MARKET_DATA_BASE_URL}/yf-history/${symbol}`, {
        params: {
          interval: '1d',
          period,
        },
      });

      const normalized = (response.data || [])
        .map((point) => ({
          time: point.time,
          timestamp: Date.parse(point.time),
          price: Number(point.price),
        }))
        .filter((point) => point.time && Number.isFinite(point.price) && Number.isFinite(point.timestamp))
        .sort((a, b) => a.timestamp - b.timestamp);

      setData(normalized);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Unable to load historical chart data.');
      setData([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [period, symbol]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        timeLabel: formatTimeLabel(point.time),
      })),
    [data]
  );

  const minPrice = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.min(...chartData.map((d) => d.price)) * 0.99;
  }, [chartData]);

  const maxPrice = useMemo(() => {
    if (chartData.length === 0) return 1;
    return Math.max(...chartData.map((d) => d.price)) * 1.01;
  }, [chartData]);

  return (
    <div className="yf-line-chart">
      <div className="yf-line-header">
        <label>
          Period
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            {PERIOD_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <button type="button" className="manual-refresh" onClick={fetchHistory}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>

        <span className="last-update">{lastUpdate ? `Updated: ${lastUpdate}` : ''}</span>
      </div>

      {error && <p className="chart-error">{error}</p>}
      {!loading && !error && chartData.length === 0 && (
        <p className="chart-meta">No historical data available for the selected range.</p>
      )}

      <div className="yf-chart-canvas">
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={360}>
            <AreaChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 24 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-color, #1f8ef1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent-color, #1f8ef1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis
                dataKey="timeLabel"
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
                tickCount={6}
                type="category"
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
                width={60}
                stroke="var(--text-secondary)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                labelFormatter={(_, payload) => {
                  if (payload && payload.length > 0) {
                    return formatTooltipTime(payload[0].payload.time);
                  }
                  return '';
                }}
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
              <Area
                type="monotone"
                dataKey="price"
                fill="url(#colorPrice)"
                stroke="var(--accent-color, #1f8ef1)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5 }}
                isAnimationActive
              />
              {chartData.length > 12 && (
                <Brush
                  dataKey="timeLabel"
                  stroke="var(--accent-color, #1f8ef1)"
                  travellerWidth={8}
                  height={24}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
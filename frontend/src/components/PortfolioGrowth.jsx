import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './PortfolioGrowth.css';

export default function PortfolioGrowth({ holdings, prices, balance, initialBalance }) {
  const data = useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return [
        {
          date: new Date().toLocaleDateString(),
          portfolio: balance,
          investment: 0,
          gain: balance,
        },
      ];
    }

    const currentValue = holdings.reduce((sum, h) => {
      const currentPrice = prices[h.ticker_symbol] || parseFloat(h.avg_buy_price);
      return sum + h.quantity * currentPrice;
    }, 0);

    const investedAmount = holdings.reduce((sum, h) => {
      return sum + h.quantity * parseFloat(h.avg_buy_price);
    }, 0);

    const gain = currentValue - investedAmount;

    return [
      {
        date: new Date().toLocaleDateString(),
        portfolio: currentValue + balance,
        investment: investedAmount,
        cash: balance,
        gain,
      },
    ];
  }, [holdings, prices, balance, initialBalance]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="growth-tooltip">
          <p className="tooltip-date">{data.date}</p>
          <p className="tooltip-row">
            <span className="label">Portfolio Value:</span>
            <span className="value">${(data.portfolio || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
          <p className="tooltip-row">
            <span className="label">Investments:</span>
            <span className="value">${(data.investment || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
          <p className="tooltip-row">
            <span className="label">Cash:</span>
            <span className="value">${(data.cash || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
          <p className={`tooltip-row gain-row ${(data.gain || 0) >= 0 ? 'positive' : 'negative'}`}>
            <span className="label">P&L:</span>
            <span className="value">{(data.gain || 0) >= 0 ? '+' : ''} ${(data.gain || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const totalPortfolioValue = data[0]?.portfolio || 0;
  const totalGain = data[0]?.gain || 0;
  const gainPercentage = data[0]?.investment > 0 ? ((totalGain / data[0]?.investment) * 100).toFixed(2) : 0;

  return (
    <div className="portfolio-growth">
      <div className="growth-header">
        <div>
          <h3 className="chart-title">Portfolio Growth</h3>
          <p className="subtitle">Real-time portfolio performance</p>
        </div>
        <div className="growth-stats">
          <div className="stat">
            <span className="stat-label">Portfolio Value</span>
            <span className="stat-value">${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className={`stat gain ${totalGain >= 0 ? 'positive' : 'negative'}`}>
            <span className="stat-label">P&L</span>
            <span className="stat-value">{totalGain >= 0 ? '+' : ''} ${totalGain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="stat-percentage">({gainPercentage}%)</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 20 }}>
          <defs>
            <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--accent-color, #1f8ef1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--accent-color, #1f8ef1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            dataKey="date"
            stroke="var(--text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            stroke="var(--text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="portfolio"
            fill="url(#colorPortfolio)"
            stroke="var(--accent-color, #1f8ef1)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

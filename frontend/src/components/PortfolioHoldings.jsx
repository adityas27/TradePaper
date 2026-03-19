import React, { useMemo } from 'react';
import { BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './PortfolioHoldings.css';

export default function PortfolioHoldings({ holdings, prices }) {
  const data = useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return [];
    }

    return holdings
      .map((h) => {
        const currentPrice = prices[h.ticker_symbol] || parseFloat(h.avg_buy_price);
        const avgPrice = parseFloat(h.avg_buy_price);
        const value = h.quantity * currentPrice;
        const pnl = (currentPrice - avgPrice) * h.quantity;
        const pnlPercent = avgPrice > 0 ? ((pnl / (avgPrice * h.quantity)) * 100).toFixed(2) : 0;

        return {
          ticker: h.ticker_symbol,
          value: Number(value.toFixed(2)),
          quantity: h.quantity,
          pnl,
          pnlPercent,
          isPositive: pnl >= 0,
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 6); // Top 6 holdings
  }, [holdings, prices]);

  const totalValue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const { ticker, value, quantity, pnl, pnlPercent } = payload[0].payload;
      return (
        <div className="holdings-tooltip">
          <p className="tooltip-ticker">{ticker}</p>
          <p className="tooltip-row">
            <span>Position Value:</span>
            <span>${value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
          <p className="tooltip-row">
            <span>Quantity:</span>
            <span>{quantity}</span>
          </p>
          <p className={`tooltip-row pnl-row ${pnl >= 0 ? 'positive' : 'negative'}`}>
            <span>P&L:</span>
            <span>{pnl >= 0 ? '+' : ''} ${pnl?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({pnlPercent}%)</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="portfolio-holdings">
        <h3 className="chart-title">Top Holdings</h3>
        <p className="empty-state">No holdings data available</p>
      </div>
    );
  }

  return (
    <div className="portfolio-holdings">
      <h3 className="chart-title">Top Holdings Performance</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          margin={{ top: 8, right: 24, left: 0, bottom: 24 }}
          layout="vertical"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis
            type="number"
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            stroke="var(--text-secondary)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            dataKey="ticker"
            type="category"
            stroke="var(--text-secondary)"
            style={{ fontSize: '12px' }}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" fill="#1f8ef1" radius={[0, 6, 6, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.isPositive ? '#22c55e' : '#ef4444'}
                opacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="holdings-list">
        {data.map((holding) => (
          <div key={holding.ticker} className="holding-row">
            <div className="holding-info">
              <span className="holding-ticker">{holding.ticker}</span>
              <span className="holding-qty">{holding.quantity} shares</span>
            </div>
            <div className="holding-value">
              <span className="value">${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={`pnl ${holding.isPositive ? 'positive' : 'negative'}`}>
                {holding.isPositive ? '+' : ''} ${holding.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({holding.pnlPercent}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

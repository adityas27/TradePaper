import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import './PortfolioAllocation.css';

const COLORS = ['#1f8ef1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function PortfolioAllocation({ holdings, prices, balance }) {
  const data = useMemo(() => {
    if (!holdings || holdings.length === 0) {
      return [];
    }

    const allocation = holdings.map((h) => {
      const currentPrice = prices[h.ticker_symbol] || parseFloat(h.avg_buy_price);
      const value = h.quantity * currentPrice;
      return {
        name: h.ticker_symbol,
        value: Number(value.toFixed(2)),
        quantity: h.quantity,
        price: currentPrice,
      };
    });

    // Add cash as a category
    allocation.push({
      name: 'Cash',
      value: Number(balance.toFixed(2)),
      isCash: true,
    });

    return allocation.sort((a, b) => b.value - a.value);
  }, [holdings, prices, balance]);

  const totalValue = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const { name, value } = payload[0].payload;
      const percentage = ((value / totalValue) * 100).toFixed(1);
      return (
        <div className="allocation-tooltip">
          <p className="tooltip-label">{name}</p>
          <p className="tooltip-value">${value?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="tooltip-percentage">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="portfolio-allocation">
        <h3 className="chart-title">Portfolio Allocation</h3>
        <p className="empty-state">No holdings data available</p>
      </div>
    );
  }

  return (
    <div className="portfolio-allocation">
      <h3 className="chart-title">Portfolio Allocation</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} (${((value / totalValue) * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

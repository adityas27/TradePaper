import React, { useState, useMemo } from 'react';
import Histogram from './Histogram';
import Candlestick from './Candlestick';
import './ChartTabs.css';

export default function ChartTabs({ data, symbol }) {
  const [activeChart, setActiveChart] = useState('candlestick');
  const [timeframe, setTimeframe] = useState('1d');

  const timeframes = [
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '1y', label: '1Y' },
    { value: 'all', label: 'All' },
  ];

  const chartTypes = [
    { value: 'candlestick', label: 'Candlestick' },
    { value: 'histogram', label: 'Histogram' },
  ];

  // Filter data based on selected timeframe
  const filteredData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const now = new Date();
    const dataPoints = [...data];

    let filterDate = new Date();

    switch (timeframe) {
      case '1d':
        filterDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
        break;
      case '1w':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '1m':
        filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3m':
        filterDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        filterDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        return dataPoints;
      default:
        return dataPoints;
    }

    // Filter data points that are within the timeframe
    return dataPoints.filter(item => {
      if (!item.date && !item.time) return true; // Keep items without date info
      const itemDate = new Date(item.date || item.time);
      return itemDate >= filterDate;
    });
  }, [data, timeframe]);

  if (!data || data.length === 0) {
    return (
      <div className="chart-tabs-container">
        <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
          No data available
        </p>
      </div>
    );
  }

  return (
    <>
      {/* <div className="chart-tabs-container"> */}
        {/* Chart Type Tabs */}
        <div className="chart-tabs-header">
          <div className="chart-type-tabs">
            {chartTypes.map(chart => (
              <button
                key={chart.value}
                className={`tab-button ${activeChart === chart.value ? 'active' : ''}`}
                onClick={() => setActiveChart(chart.value)}
              >
                {chart.label}
              </button>
            ))}
          </div>

          {/* Timeframe Selector */}
          <div className="timeframe-selector">
            {timeframes.map(tf => (
              <button
                key={tf.value}
                className={`timeframe-button ${timeframe === tf.value ? 'active' : ''}`}
                onClick={() => setTimeframe(tf.value)}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Display */}
        <div className="chart-content">
          {activeChart === 'candlestick' && (
            <Candlestick data={filteredData} symbol={symbol} timeframe={timeframe} />
          )}
          {activeChart === 'histogram' && (
            <Histogram data={filteredData} symbol={symbol} timeframe={timeframe} />
          )}
        </div>

        {/* Data Info */}
        <div className="chart-info">
          <div className="info-item">
            <span className="info-label">Timeframe:</span>
            <span className="info-value">
              {timeframes.find(t => t.value === timeframe)?.label}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Data Points:</span>
            <span className="info-value">{filteredData.length}</span>
          </div>
          {filteredData.length > 0 && (
            <>
              <div className="info-item">
                <span className="info-label">High:</span>
                <span className="info-value">
                  ${Math.max(...filteredData.map(d => d.high || d.close)).toFixed(2)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Low:</span>
                <span className="info-value">
                  ${Math.min(...filteredData.map(d => d.low || d.close)).toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      {/* </div> */}
    </>
  );
}

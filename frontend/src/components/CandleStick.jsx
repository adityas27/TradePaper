import React, { useState } from 'react';
import './ChartStyles.css';

export default function Candlestick({ data, symbol, timeframe = '1d' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999' }}>No data available</p>;
  }

  const allPrices = data.flatMap(d => [d.open, d.high, d.low, d.close]);
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceRange = maxPrice - minPrice || 1;
  const height = 350;

  const scalePrice = (price) => {
    return height - 40 - ((price - minPrice) / priceRange) * (height - 80);
  };

  const candleWidth = 30;
  const spacing = 50;

  const handleCandleHover = (idx, event) => {
    const rect = event.currentTarget.parentElement.getBoundingClientRect();
    setHoveredIndex(idx);
    setTooltipPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <div className="candlestick-container">
      <div style={{ position: 'relative', width: '100%' }}>
        <svg
          className="candlestick-chart"
          width="100%"
          height={height}
          viewBox={`0 0 ${Math.max(1000, data.length * spacing + 100)} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ cursor: 'crosshair' }}
        >
          {/* Y-axis */}
          <line x1="60" y1="20" x2="60" y2={height - 40} stroke="#ddd" strokeWidth="1" />
          
          {/* X-axis */}
          <line x1="60" y1={height - 40} x2={Math.max(1000, data.length * spacing + 80)} y2={height - 40} stroke="#ddd" strokeWidth="1" />

          {/* Y-axis labels */}
          <text x="50" y="25" textAnchor="end" fontSize="12" fill="#999">
            ${maxPrice.toFixed(2)}
          </text>
          <text x="50" y={height - 35} textAnchor="end" fontSize="12" fill="#999">
            ${minPrice.toFixed(2)}
          </text>

          {/* Candlesticks */}
          {data.map((candle, idx) => {
            const x = 60 + idx * spacing + spacing / 2;
            const isUp = candle.close >= candle.open;
            const color = isUp ? '#34c759' : '#ff3b30';
            const isHovered = hoveredIndex === idx;
            
            const openY = scalePrice(candle.open);
            const closeY = scalePrice(candle.close);
            const highY = scalePrice(candle.high);
            const lowY = scalePrice(candle.low);
            
            const bodyTop = Math.min(openY, closeY);
            const bodyBottom = Math.max(openY, closeY);
            const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

            return (
              <g key={idx}>
                {/* Wick (high-low line) */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={color}
                  strokeWidth={isHovered ? '3' : '1'}
                  style={{ transition: 'stroke-width 0.2s' }}
                />
                
                {/* Body (open-close rectangle) */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  stroke={color}
                  strokeWidth="1"
                  opacity={isHovered ? '1' : '0.8'}
                  style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => handleCandleHover(idx, e)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />

                {/* Hover highlight */}
                {isHovered && (
                  <g>
                    <circle cx={x} cy={highY} r="4" fill={color} opacity="0.5" />
                    <circle cx={x} cy={lowY} r="4" fill={color} opacity="0.5" />
                  </g>
                )}
              </g>
            );
          })}

          {/* X-axis labels (every 3 days) */}
          {data.map((candle, idx) => {
            if (idx % Math.max(1, Math.ceil(data.length / 10)) === 0) {
              const x = 60 + idx * spacing + spacing / 2;
              return (
                <text
                  key={`label-${idx}`}
                  x={x}
                  y={height - 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#999"
                >
                  {candle.time}
                </text>
              );
            }
            return null;
          })}
        </svg>

        {/* Tooltip */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            className="chart-tooltip"
            style={{
              left: `${(tooltipPos.x / 100)}%`,
              top: `${(tooltipPos.y / 100)}%`,
            }}
          >
            <div className="tooltip-content">
              <p className="tooltip-date">{data[hoveredIndex].time}</p>
              <p className="tooltip-value">O: ${data[hoveredIndex].open?.toFixed(2) || 'N/A'}</p>
              <p className="tooltip-value">H: ${data[hoveredIndex].high?.toFixed(2) || 'N/A'}</p>
              <p className="tooltip-value">L: ${data[hoveredIndex].low?.toFixed(2) || 'N/A'}</p>
              <p className="tooltip-value">C: ${data[hoveredIndex].close?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="candlestick-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#34c759' }}></span>
          <span>Close &gt; Open</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ff3b30' }}></span>
          <span>Close &lt; Open</span>
        </div>
      </div>
    </div>
  );
}

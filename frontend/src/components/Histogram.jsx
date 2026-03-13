import React, { useState } from 'react';
import './ChartStyles.css';

export default function Histogram({ data, symbol, timeframe = '1d' }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return <p style={{ textAlign: 'center', color: '#999' }}>No data available</p>;
  }

  const values = data.map(d => d.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const height = 350;
  const barWidth = Math.max(1, Math.floor(100 / data.length));

  const handleBarHover = (idx, event) => {
    const rect = event.currentTarget.parentElement.getBoundingClientRect();
    setHoveredIndex(idx);
    setTooltipPos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
  };

  return (
    <div className="histogram-container">
      <div style={{ position: 'relative', width: '100%' }}>
        <svg
          className="histogram-chart"
          width="100%"
          height={height}
          viewBox={`0 0 1000 ${height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{ cursor: 'crosshair' }}
        >
          {/* Y-axis */}
          <line x1="60" y1="20" x2="60" y2={height - 40} stroke="#ddd" strokeWidth="1" />
          
          {/* X-axis */}
          <line x1="60" y1={height - 40} x2="980" y2={height - 40} stroke="#ddd" strokeWidth="1" />

          {/* Y-axis labels */}
          <text x="50" y="25" textAnchor="end" fontSize="12" fill="#999">
            ${max.toFixed(2)}
          </text>
          <text x="50" y={height - 35} textAnchor="end" fontSize="12" fill="#999">
            ${min.toFixed(2)}
          </text>

          {/* Bars */}
          {data.map((point, idx) => {
            const barHeight = ((point.close - min) / range) * (height - 100);
            const x = 60 + (idx / data.length) * 920;
            const y = height - 40 - barHeight;
            const color = point.close >= point.open ? '#34c759' : '#ff3b30';
            const isHovered = hoveredIndex === idx;

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth * 0.8}
                  height={barHeight}
                  fill={color}
                  opacity={isHovered ? '1' : '0.7'}
                  style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => handleBarHover(idx, e)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {/* Hover highlight */}
                {isHovered && (
                  <>
                    <rect
                      x={x - 2}
                      y={y - 2}
                      width={barWidth * 0.8 + 4}
                      height={barHeight + 4}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* X-axis labels (sample) */}
          {data.map((point, idx) => {
            if (idx % Math.max(1, Math.floor(data.length / 5)) === 0) {
              const x = 60 + (idx / data.length) * 920;
              return (
                <text
                  key={`label-${idx}`}
                  x={x}
                  y={height - 20}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#999"
                >
                  {point.time}
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

      <div className="histogram-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#34c759' }}></span>
          <span>Up</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ff3b30' }}></span>
          <span>Down</span>
        </div>
      </div>
    </div>
  );
}

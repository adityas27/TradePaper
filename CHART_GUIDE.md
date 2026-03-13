# Chart Features - Quick Reference Guide

## 🎯 What's New

### Tab Selection
Click on the chart type tabs to switch between:
- **Candlestick** - Shows Open, High, Low, Close prices with wicks
- **Histogram** - Shows closing prices as bars (green for up, red for down)

### Timeframe Selection
Click on any timeframe button to filter data:
- **1D** → Shows data from the last 24 hours
- **1W** → Shows data from the last 7 days  
- **1M** → Shows data from the last 30 days
- **3M** → Shows data from the last 90 days
- **1Y** → Shows data from the last year
- **All** → Shows all available data

### Interactive Hover
Hover over any bar or candlestick to see:
```
📅 Date/Time
📊 Open Price
📈 High Price
📉 Low Price
💰 Close Price
```

### Information Display
At the bottom of the chart, you'll see:
- Current selected timeframe
- Number of data points in the chart
- Highest price for the timeframe
- Lowest price for the timeframe

## 🖱️ Interaction Guide

| Action | Result |
|--------|--------|
| Click a chart type tab | Switch between Candlestick and Histogram |
| Click a timeframe button | Filter chart data for that period |
| Hover over a bar/candle | Show detailed price information |
| Hover over tooltip | Can see OHLC values clearly |

## 📱 Mobile Support
- Charts are fully responsive
- Touch-friendly button sizes
- Optimized layout for smaller screens
- Automatic label adjustment

## 🎨 Visual Feedback
- **Active buttons** - Highlighted with accent color
- **Hover effects** - Bars/candles highlight on hover
- **Tooltips** - Appear above the chart with arrow pointer
- **Legends** - Show color meanings at the bottom

## 📊 Chart Specifications

### Candlestick Chart
- **Wicks** (thin lines) - Show high and low prices
- **Body** (rectangles) - Show open and close prices
- **Colors**: 
  - Green - Close > Open (bullish)
  - Red - Close < Open (bearish)

### Histogram Chart
- **Bars** - Represent closing prices
- **Height** - Proportional to price
- **Colors**:
  - Green - Close >= Open (up)
  - Red - Close < Open (down)

## ⚡ Performance
- Data filtering happens instantly
- Smooth animations and transitions
- No lag when switching timeframes
- Optimized for large datasets

## 🔄 How It Works

1. **Data Filtering**: Client-side filtering based on selected timeframe
2. **Dynamic Scaling**: Chart axes adjust to show optimal range for selected data
3. **Smart Labeling**: Axis labels automatically adjust based on data density
4. **Responsive Drawing**: SVG charts scale to fit container

## 📋 Data Points Shown

Each data point includes:
- **time** - Date or timestamp
- **open** - Opening price
- **high** - Highest price
- **low** - Lowest price
- **close** - Closing price
- **date** - Date (used for timeframe filtering)

## 🚀 Tips & Tricks

1. **Fastest View**: Click "All" to see complete history
2. **Detailed Analysis**: Use "1D" for intraday analysis
3. **Switch Charts**: Compare both chart types side by side by switching
4. **Check Range**: Look at "High/Low" stats to see price volatility
5. **Mobile Friendly**: Works great on tablets and phones

## 🐛 Troubleshooting

**No data showing?**
- Check if data is loaded from the API
- Try selecting "All" timeframe
- Refresh the page

**Tooltip not appearing?**
- Make sure to hover directly over the bars/candles
- Not all dates may have data points

**Chart looks empty?**
- This means the selected timeframe has no data
- Try a longer timeframe like "1M" or "All"

---

**Version**: 1.0  
**Last Updated**: 2024  
**Compatible with**: All modern browsers

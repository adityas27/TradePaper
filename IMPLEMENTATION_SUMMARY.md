# TradePaper - Complete Implementation & Feature Summary

## Overview

TradePaper is a full-stack paper trading platform with:

- Django REST API backend for users, portfolios, trading, watchlist, and leaderboard
- FastAPI market microservice for live prices, candle generation, and historical chart feeds
- React + Vite frontend with authenticated routing, portfolio analytics, and charting views

Current implementation includes end-to-end trading flow from user signup/login to buy/sell execution, position tracking, and performance visualization.

---

## Tech Stack

### Backend

- Django 5 + Django REST Framework
- JWT auth via `djangorestframework_simplejwt`
- SQLite database (`backend/db.sqlite3`)
- CORS enabled for local frontend development

### Market Data Service

- FastAPI + Uvicorn
- Real-time stream from Finnhub WebSocket
- Polling/fallback historical data via `yfinance`

### Frontend

- React 18 + Vite
- React Router v6 (protected routes)
- Axios API client with JWT refresh interceptor
- Recharts + custom SVG/Recharts chart components
- Context API for theme, learning mode, and trading state

---

## Implemented Architecture

### 1) Core Services

- **Django API** (`http://127.0.0.1:8000/api/`): business logic, validation, persistence
- **FastAPI market service** (`http://127.0.0.1:8001`): live ticks, candle snapshots, line chart history
- **React app** (`http://localhost:5173`): user interface, state management, chart rendering

### 2) Data Flow

1. Frontend requests app data through Django REST endpoints.
2. Django uses DB models for users/portfolios/positions/transactions/watchlist.
3. For prices and OHLC candles, Django service layer (`backend/main/services/market.py`) calls FastAPI.
4. Frontend also subscribes directly to FastAPI WebSocket (`/ws/prices`) for live UI updates.

This hybrid model keeps trade execution centralized in Django while enabling low-latency market updates from FastAPI.

---

## Authentication & User Management

### Implemented Features

- User signup endpoint
- JWT login (access + refresh tokens)
- Token refresh flow
- Protected frontend routes via token presence check
- Authenticated profile read/update
- Profile image upload support (`media/profiles/`)
- Public user profile endpoint by username
- User flags supported at model level: `is_verified`, `is_banned`

### Backend Endpoints

- `POST /api/accounts/signup/`
- `POST /api/accounts/login/`
- `POST /api/accounts/token/refresh/`
- `GET /api/accounts/me/`
- `PATCH /api/accounts/me/`
- `GET /api/accounts/users/<username>/`

### Frontend Behavior

- Access token automatically attached to API requests
- On `401`, interceptor attempts refresh and retries request
- If refresh fails, tokens are cleared from localStorage

---

## Trading Domain Models

Implemented Django entities:

- **Ticker**: symbol, company metadata, branding, description, website
- **Portfolio**: user-owned wallet with cash balance (default `10000.00`)
- **Position**: per-portfolio per-ticker quantity + average buy price
- **TradeTransaction**: BUY/SELL execution records with timestamp and total amount
- **Watchlist**: per-user saved symbols

Business rules implemented:

- One position per portfolio+ticker (`unique_together`)
- One watchlist entry per user+ticker (`unique_together`)
- Transaction total auto-computed in model save

---

## Market, Portfolio & Trading Features

### Ticker APIs

- List all tradable tickers
- Detailed ticker metadata with user-specific watchlist/position context
- Current live price endpoint (proxied from FastAPI)
- OHLC endpoint (proxied from FastAPI)

### Portfolio APIs

- List user portfolios
- Auto-create default portfolio from frontend when missing
- Portfolio detail with related positions/transactions
- Portfolio holdings endpoint for current positions

### Trade Execution APIs

- Buy endpoint with validation:
  - required fields
  - positive quantity/price
  - sufficient cash balance
  - atomic balance + position + transaction update
- Sell endpoint with validation:
  - required fields
  - positive quantity/price
  - sufficient holdings
  - atomic balance + position + transaction update
  - delete position when quantity reaches zero

### Watchlist APIs

- Fetch authenticated user watchlist
- Toggle add/remove ticker from watchlist

### Transactions API

- List transactions ordered by newest first

### Leaderboard API

- Ranks users by computed total portfolio value
- Uses primary portfolio per user
- `total_value = cash + sum(quantity * live_price)`
- `net_profit = total_value - 10000`
- Returns rank, username, portfolio value, net profit

---

## FastAPI Market Service Features

Implemented in `backend/tickers/app.py`:

- Real-time symbol subscription to Finnhub for supported ticker set
- In-memory latest price map
- In-memory 1-minute candle builder (`open/high/low/close` bucketed by minute)
- Broadcast prices every 2s to connected WebSocket clients
- REST endpoints:
  - `GET /price/{ticker}` live snapshot
  - `GET /candles/{ticker}` recent candles (history + current)
  - `GET /yf-history/{ticker}` historical line series from yfinance
  - `GET /` health/status summary
- WebSocket endpoint:
  - `WS /ws/prices`

Supported ticker universe currently includes:

- `AAPL`, `GOOGL`, `MSFT`, `AMZN`, `NVDA`, `META`, `TSLA`, `JPM`

---

## Frontend Application Features

### Routing & Access Control

- Public routes: login, signup
- Protected app shell route with nested pages
- Implemented pages:
  - Dashboard
  - Market
  - Ticker Details
  - Candlestick Chart Page
  - Line Chart Page
  - Portfolio
  - Trade History
  - Watchlist
  - Leaderboard
  - Learn Trading
  - Settings
  - Profile

### Trading State Management (`TradingContext`)

- Loads/creates active portfolio at startup
- Fetches and caches holdings + balance
- Provides shared actions:
  - `buyStock`
  - `sellStock`
  - `refreshPortfolio`
  - `loadPortfolioData`

### Dashboard

- Live price feed via WebSocket
- Summary cards:
  - total investment
  - current portfolio value
  - unrealized P&L
  - available cash
- Holdings table with live P&L per symbol
- Portfolio analytics widgets:
  - allocation pie
  - growth area chart
  - top holdings performance chart
- Quick action navigation

### Market Page

- Search/filter by symbol or company name
- Live connection status indicator
- Real-time prices
- Buy flow with quantity input and validation feedback
- Watchlist toggle per ticker
- Risk meter shown for entered position size
- Clickable symbol navigation to ticker detail page

### Portfolio Page

- Holdings table with live price and P&L
- Sell flow with quantity validation and execution states
- Balance display

### Trade History Page

- Full transaction table with date/time, type, quantity, price, totals

### Watchlist Page

- Fetch and render watchlist cards
- Live price updates per watched symbol
- Remove from watchlist action

### Leaderboard Page

- Fetches backend ranking and highlights top 3
- Shows rank, username, portfolio value, net profit

### Learn Trading Page

- Multi-module educational content with beginner/intermediate/advanced topics
- Rich lesson sections and key takeaways
- Quiz structures included for module-based learning checks

### Settings Page

- Theme toggle
- Learning mode toggle

### Profile Page

- Fetch authenticated profile
- Edit profile fields (name, email, phone, DOB)
- Upload/update profile image
- Logout action

---

## Charting Features (Current + Implemented Components)

### Active Chart Pages

- **Live Candlestick Page**
  - 1-minute candle visualization
  - tooltips with OHLC data
  - periodic refresh + WebSocket-triggered refresh
  - dynamic y-axis scaling

- **Historical Line Chart Page**
  - period switching (`1d`, `5d`, `1mo`, `3mo`)
  - yfinance-backed data feed
  - area chart with brush for larger datasets
  - manual refresh and update timestamp

### Additional Implemented Chart Components

- `ChartTabs`, `CandleStick`, and `Histogram` are implemented with:
  - tab-based chart switching
  - timeframe filtering (`1D`, `1W`, `1M`, `3M`, `1Y`, `All`)
  - hover tooltips and chart legends
  - shared chart styling

Note: these tab components are currently available in codebase but not wired into active app routes in the latest page integration.

---

## UI/UX and Theming Features

- Responsive layout across pages (tables/cards/charts)
- Light/dark theme support with persistence in localStorage
- Learning mode preference persistence in localStorage
- Reusable UI components (Card, Button, layout shell)
- Status feedback for buy/sell/watchlist/profile actions

---

## Security & Validation Implemented

- JWT authentication on protected backend routes
- Per-user ownership checks on portfolio operations
- Input validation for trade quantity and price
- Atomic DB transactions for buy/sell consistency
- CORS configuration for approved local origins
- Multipart handling for profile image upload

---

## Project Scripts and Runtime

Root orchestration script runs all services concurrently:

- Django backend server
- FastAPI ticker service
- React frontend dev server

Dependencies are split across:

- `requirements.txt` for Python services
- `frontend/package.json` for React app
- root `package.json` for concurrent process startup

---

## Completion Status

### Fully Implemented and Working

- Authentication, token flow, and protected routes
- Portfolio creation/loading and holdings management
- Buy/sell execution and transaction history
- Watchlist management
- Market list with live prices and ticker navigation
- Ticker details with company metadata and position snapshot
- Live and historical chart pages
- Leaderboard based on live-valued portfolios
- Profile view/edit with image upload
- Educational learning content pages

### Implemented but Not Currently Active in Main Route Flow

- Tab-based chart container (`ChartTabs`) and related custom chart components

---

## Suggested Next Enhancements

1. Persist historical candles and portfolio snapshots for true time-series performance analytics.
2. Add order types beyond market execution (limit, stop, stop-limit) with simulation engine.
3. Add backend-side pagination/filtering for transactions and leaderboard.
4. Add automated tests for trade execution edge cases and auth/token flows.
5. Wire tab-based chart module back into ticker detail page if single-page chart UX is preferred.

---

**Document Type**: Full Implementation + Feature Inventory  
**Scope**: Backend + Market Microservice + Frontend  
**Last Updated**: March 20, 2026

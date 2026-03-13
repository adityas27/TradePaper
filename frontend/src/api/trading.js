import api from './api';

// ============================================================================
// PORTFOLIO OPERATIONS
// ============================================================================

export async function getPortfolios() {
  const res = await api.get('portfolios/');
  return res.data;
}

export async function getPortfolioDetail(portfolioId) {
  const res = await api.get(`portfolios/${portfolioId}/`);
  return res.data;
}

export async function getPortfolioHoldings(portfolioId) {
  const res = await api.get(`portfolios/${portfolioId}/holdings/`);
  return res.data;
}

export async function createPortfolio(name) {
  const res = await api.post('portfolios/', { name });
  return res.data;
}

// ============================================================================
// TRADING OPERATIONS
// ============================================================================

export async function buyStock(portfolioId, symbol, quantity, price) {
  const res = await api.post('trade/buy/', {
    portfolio_id: portfolioId,
    symbol,
    quantity: parseInt(quantity),
    price: parseFloat(price),
  });
  return res.data;
}

export async function sellStock(portfolioId, symbol, quantity, price) {
  const res = await api.post('trade/sell/', {
    portfolio_id: portfolioId,
    symbol,
    quantity: parseInt(quantity),
    price: parseFloat(price),
  });
  return res.data;
}

// ============================================================================
// WATCHLIST OPERATIONS
// ============================================================================

export async function getWatchlist() {
  const res = await api.get('watchlist/');
  return res.data;
}

export async function toggleWatchlist(symbol) {
  const res = await api.post('watchlist/toggle/', { symbol });
  return res.data;
}

// ============================================================================
// TICKER OPERATIONS
// ============================================================================

export async function getTickers() {
  const res = await api.get('tickers/');
  return res.data;
}

export async function getTickerDetail(symbol) {
  const res = await api.get(`tickers/${symbol}/`);
  return res.data;
}

// ============================================================================
// TRANSACTION OPERATIONS
// ============================================================================

export async function getTransactions() {
  const res = await api.get('transactions/');
  return res.data;
}

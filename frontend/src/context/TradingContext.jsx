import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as tradingAPI from '../api/trading';

const TradingContext = createContext();

export function TradingProvider({ children }) {
  const [portfolioData, setPortfolioData] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch portfolio data on mount
  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const portfolios = await tradingAPI.getPortfolios();
      let portfolio = portfolios[0];

      if (!portfolio) {
        portfolio = await tradingAPI.createPortfolio('My Portfolio');
      }

      setPortfolioData(portfolio);
      setBalance(parseFloat(portfolio.balance));

      // Fetch holdings
      const holdingsData = await tradingAPI.getPortfolioHoldings(portfolio.id);
      setHoldings(holdingsData);
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buyStock = useCallback(async (symbol, price, quantity) => {
    if (!portfolioData) {
      setError('Portfolio not loaded');
      return false;
    }

    try {
      const result = await tradingAPI.buyStock(portfolioData.id, symbol, quantity, price);
      
      // Update local state
      setBalance(parseFloat(result.portfolio_balance));
      
      // Reload holdings
      const holdingsData = await tradingAPI.getPortfolioHoldings(portfolioData.id);
      setHoldings(holdingsData);
      
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Purchase failed';
      setError(errorMsg);
      return false;
    }
  }, [portfolioData]);

  const sellStock = useCallback(async (symbol, quantity, price) => {
    if (!portfolioData) {
      setError('Portfolio not loaded');
      return false;
    }

    try {
      const result = await tradingAPI.sellStock(portfolioData.id, symbol, quantity, price);
      
      // Update local state
      setBalance(parseFloat(result.portfolio_balance));
      
      // Reload holdings
      const holdingsData = await tradingAPI.getPortfolioHoldings(portfolioData.id);
      setHoldings(holdingsData);
      
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Sale failed';
      setError(errorMsg);
      return false;
    }
  }, [portfolioData]);

  const refreshPortfolio = useCallback(async () => {
    if (!portfolioData) return;
    
    try {
      const updated = await tradingAPI.getPortfolioDetail(portfolioData.id);
      setPortfolioData(updated);
      setBalance(parseFloat(updated.balance));
      setHoldings(updated.positions || []);
    } catch (err) {
      console.error('Failed to refresh portfolio:', err);
    }
  }, [portfolioData]);

  const value = {
    portfolio: portfolioData,
    holdings,
    balance,
    loading,
    error,
    buyStock,
    sellStock,
    refreshPortfolio,
    loadPortfolioData,
  };

  return (
    <TradingContext.Provider value={value}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within TradingProvider');
  }
  return context;
}

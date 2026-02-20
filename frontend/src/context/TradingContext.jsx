import { createContext, useContext, useState, useCallback } from 'react';

const TradingContext = createContext();

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatAmount(value) {
  return Math.round(value * 100) / 100;
}

export function TradingProvider({ children }) {
  const [balance, setBalance] = useState(100000);
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const buyStock = useCallback((symbol, price, quantity) => {
    const cost = formatAmount(price * quantity);
    if (balance < cost) {
      return false;
    }

    setBalance((prev) => formatAmount(prev - cost));

    setPortfolio((prev) => {
      const existing = prev.find((p) => p.symbol === symbol);
      if (existing) {
        const totalQuantity = existing.quantity + quantity;
        const totalCost = formatAmount(existing.avgBuyPrice * existing.quantity + cost);
        const newAvgBuyPrice = formatAmount(totalCost / totalQuantity);
        return prev.map((p) =>
          p.symbol === symbol
            ? { symbol, quantity: totalQuantity, avgBuyPrice: newAvgBuyPrice }
            : p
        );
      }
      return [...prev, { symbol, quantity, avgBuyPrice: price }];
    });

    const transaction = {
      id: generateId(),
      symbol,
      type: 'BUY',
      quantity,
      price,
      date: new Date().toISOString().slice(0, 10),
      journalNote: '',
    };
    setTransactions((prev) => [transaction, ...prev]);
    return true;
  }, [balance]);

  const sellStock = useCallback((symbol, price, quantity) => {
    const existing = portfolio.find((p) => p.symbol === symbol);
    if (!existing) return false;
    if (existing.quantity < quantity) return false;

    const proceeds = formatAmount(price * quantity);
    setBalance((prev) => formatAmount(prev + proceeds));

    setPortfolio((prev) => {
      const item = prev.find((p) => p.symbol === symbol);
      const newQuantity = item.quantity - quantity;
      if (newQuantity === 0) {
        return prev.filter((p) => p.symbol !== symbol);
      }
      return prev.map((p) =>
        p.symbol === symbol ? { ...p, quantity: newQuantity } : p
      );
    });

    const transaction = {
      id: generateId(),
      symbol,
      type: 'SELL',
      quantity,
      price,
      date: new Date().toISOString().slice(0, 10),
      journalNote: '',
    };
    setTransactions((prev) => [transaction, ...prev]);
    return true;
  }, [portfolio]);

  const addJournalNote = useCallback((transactionId, note) => {
    setTransactions((prev) =>
      prev.map((t) =>
        t.id === transactionId ? { ...t, journalNote: note } : t
      )
    );
  }, []);

  const value = {
    balance,
    portfolio,
    transactions,
    buyStock,
    sellStock,
    addJournalNote,
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

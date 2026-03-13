import { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import * as tradingAPI from '../api/trading';

export default function TradeHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await tradingAPI.getTransactions();
      setTransactions(res);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Trade History</h1>
        <Card><p>Loading...</p></Card>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Trade History</h1>
      <div className="page-content">
        <Card>
          {transactions.length === 0 ? (
            <p className="empty-state">No transactions yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Stock</th>
                    <th>Type</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((trade) => (
                    <tr key={trade.id}>
                      <td>{formatDate(trade.timestamp)}</td>
                      <td className="font-weight-600">{trade.ticker_symbol}</td>
                      <td>
                        <span className={`badge ${trade.transaction_type === 'BUY' ? 'badge-buy' : 'badge-sell'}`}>
                          {trade.transaction_type}
                        </span>
                      </td>
                      <td className="text-right">{trade.quantity}</td>
                      <td className="text-right">${parseFloat(trade.price).toFixed(2)}</td>
                      <td className="text-right">${parseFloat(trade.total_amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

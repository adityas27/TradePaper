import { useEffect, useState } from 'react';
import Card from '../components/ui/Card';
import api from '../api/api';

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchLeaderboard() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('leaderboard/');
        if (!isMounted) return;
        setRows(res.data || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load leaderboard. Please try again.');
        console.error('Leaderboard fetch error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchLeaderboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page">
      <h1 className="page-title">Leaderboard</h1>
      <div className="page-content">
        <Card>
          {loading && <p>Loading leaderboard...</p>}
          {error && !loading && <p className="text-error">{error}</p>}
          {!loading && !error && (
            <div className="table-wrapper">
              <table className="data-table leaderboard-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Username</th>
                    <th>Portfolio Value</th>
                    <th>Net Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={4}>No data yet. Start trading to appear on the leaderboard.</td>
                    </tr>
                  )}
                  {rows.map((row) => (
                    <tr
                      key={row.rank}
                      className={row.rank <= 3 ? 'highlight-top-3' : ''}
                    >
                      <td className="font-weight-600">{row.rank}</td>
                      <td>{row.username}</td>
                      <td>
                        $
                        {row.portfolio_value?.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className={row.net_profit >= 0 ? 'text-positive' : 'text-negative'}>
                        {row.net_profit >= 0 ? '+' : '-'}$
                        {Math.abs(row.net_profit)?.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </td>
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

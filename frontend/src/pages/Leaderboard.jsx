import Card from '../components/ui/Card';

const MOCK_LEADERBOARD = [
  { rank: 1, username: 'TradingPro', portfolioValue: 125000, netProfit: 25000 },
  { rank: 2, username: 'StockMaster', portfolioValue: 118500, netProfit: 18500 },
  { rank: 3, username: 'Investor99', portfolioValue: 112000, netProfit: 12000 },
  { rank: 4, username: 'BullMarket', portfolioValue: 105200, netProfit: 5200 },
  { rank: 5, username: 'SmartTrade', portfolioValue: 101800, netProfit: 1800 },
];

export default function Leaderboard() {
  return (
    <div className="page">
      <h1 className="page-title">Leaderboard</h1>
      <div className="page-content">
        <Card>
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
                {MOCK_LEADERBOARD.map((row) => (
                  <tr key={row.rank} className={row.rank <= 3 ? 'highlight-top-3' : ''}>
                    <td className="font-weight-600">{row.rank}</td>
                    <td>{row.username}</td>
                    <td>${row.portfolioValue.toLocaleString()}</td>
                    <td className="text-positive">+${row.netProfit.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

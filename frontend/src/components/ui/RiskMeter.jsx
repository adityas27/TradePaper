function getRiskLevel(balancePercent, concentrationPercent) {
  const maxPercent = Math.max(balancePercent, concentrationPercent);
  if (maxPercent < 20) return { label: 'Low', color: '#34c759', width: maxPercent };
  if (maxPercent <= 40) return { label: 'Moderate', color: '#ff9500', width: maxPercent };
  return { label: 'High', color: '#ff3b30', width: Math.min(maxPercent, 100) };
}

export default function RiskMeter({ investmentAmount, balance, portfolio, symbol }) {
  if (balance <= 0 || investmentAmount <= 0) return null;

  const balancePercent = (investmentAmount / balance) * 100;

  const portfolioValue = portfolio.reduce((sum, p) => {
    const price = p.avgBuyPrice;
    return sum + p.quantity * price;
  }, 0);

  const currentStockValue = portfolio.find((p) => p.symbol === symbol)
    ? portfolio.find((p) => p.symbol === symbol).quantity * portfolio.find((p) => p.symbol === symbol).avgBuyPrice
    : 0;

  const totalAfterPurchase = portfolioValue - currentStockValue + investmentAmount;
  const newStockValue = currentStockValue + investmentAmount;
  const concentrationPercent = totalAfterPurchase > 0 ? (newStockValue / totalAfterPurchase) * 100 : 100;

  const risk = getRiskLevel(balancePercent, concentrationPercent);

  return (
    <div className="risk-meter">
      <div className="risk-meter-header">
        <span className="risk-meter-label">Risk Assessment</span>
        <span className="risk-meter-level" style={{ color: risk.color }}>
          {risk.label}
        </span>
      </div>
      <div className="risk-meter-bar">
        <div
          className="risk-meter-fill"
          style={{ width: `${risk.width}%`, backgroundColor: risk.color }}
        />
      </div>
      <p className="risk-meter-detail">
        Balance used: {balancePercent.toFixed(1)}% | Concentration: {concentrationPercent.toFixed(1)}%
      </p>
    </div>
  );
}

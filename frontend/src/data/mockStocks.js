export const MOCK_STOCK_PRICES = {
  AAPL: 178.25,
  GOOGL: 141.80,
  MSFT: 378.91,
  AMZN: 178.50,
  NVDA: 495.22,
  META: 504.50,
  TSLA: 242.18,
  JPM: 195.40,
};

export function getCurrentPrice(symbol) {
  return MOCK_STOCK_PRICES[symbol] ?? null;
}

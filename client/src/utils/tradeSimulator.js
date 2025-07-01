// Trade Simulator utility functions

/**
 * Get the current closing price from stock data and visible bars.
 * @param {object} stockData - The stock data object.
 * @param {number} visibleBars - The number of visible bars.
 * @returns {number}
 */
export function getCurrentClosingPrice(stockData, visibleBars) {
  if (!stockData || !stockData.data || stockData.data.length === 0 || visibleBars === 0) {
    return 0;
  }
  const currentIndex = Math.min(visibleBars - 1, stockData.data.length - 1);
  return parseFloat(stockData.data[currentIndex].close);
}

/**
 * Get the current candlestick from stock data and visible bars.
 * @param {object} stockData - The stock data object.
 * @param {number} visibleBars - The number of visible bars.
 * @returns {object|null}
 */
export function getCurrentCandlestick(stockData, visibleBars) {
  if (!stockData || !stockData.data || stockData.data.length === 0 || visibleBars === 0) {
    return null;
  }
  const currentIndex = Math.min(visibleBars - 1, stockData.data.length - 1);
  return stockData.data[currentIndex];
}

/**
 * Check if an order should be filled based on the current candlestick.
 * @param {object} order - The order object.
 * @param {object} candlestick - The current candlestick object.
 * @returns {boolean}
 */
export function shouldOrderBeFilled(order, candlestick) {
  if (!candlestick) return false;

  const high = parseFloat(candlestick.high);
  const low = parseFloat(candlestick.low);
  const limitPrice = parseFloat(order.entryPrice);

  if (order.side === "Buy") {
    // Buy order is filled if price goes down to or below the limit price
    return low <= limitPrice;
  } else {
    // Sell order is filled if price goes up to or above the limit price
    return high >= limitPrice;
  }
}

/**
 * Calculate P&L based on current position and price.
 * @param {object} position - The position object.
 * @param {number} currentPrice - The current price.
 * @returns {number}
 */
export function calculatePL(position, currentPrice) {
  if (!position) return 0;

  const priceDifference = currentPrice - position.entryPrice;
  const pl = position.side === "Buy" ? priceDifference : -priceDifference;
  return pl * position.size;
} 
// Utility function to format a candlestick timestamp as TradingView style
// Example output: Mon, 30 Jun '25 13:59
export function formatCandleTimestamp(ts) {
  if (!ts) return '';
  const date = new Date(ts * 1000); // ts is UNIX timestamp in seconds
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = days[date.getUTCDay()];
  const d = String(date.getUTCDate()).padStart(2, '0');
  const month = months[date.getUTCMonth()];
  const year = String(date.getUTCFullYear()).slice(2);
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const min = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day}, ${d} ${month} '${year} ${hh}:${min}`;
} 
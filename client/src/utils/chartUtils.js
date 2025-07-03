// Utility to get the hovered bar index and previous bar from chart data
// hoveredBar: {open, high, low, close}, data: array of bars
export function getHoveredIndexAndPrev(hoveredBar, data) {
  if (!hoveredBar || !data || !Array.isArray(data)) return { hoveredIndex: -1, prevBar: null };
  // Try to match by close value and OHLC (since time may be unix or string)
  const hoveredIndex = data.findIndex(d =>
    +d.open === hoveredBar.open &&
    +d.high === hoveredBar.high &&
    +d.low === hoveredBar.low &&
    +d.close === hoveredBar.close
  );
  const prevBar = hoveredIndex > 0 ? data[hoveredIndex - 1] : null;
  return { hoveredIndex, prevBar };
}

// Technical Indicators

// Helper function to validate input data
const validateIndicatorInput = (data, period, minDataLength = 0) => {
  // Check if data is a valid array
  if (!Array.isArray(data) || data.length === 0) {
    console.warn('Indicator calculation: Invalid or empty data array');
    return false;
  }
  
  // Check if period is valid
  if (typeof period !== 'number' || period <= 0 || period > data.length) {
    console.warn(`Indicator calculation: Invalid period ${period} for data length ${data.length}`);
    return false;
  }
  
  // Check minimum data length requirement
  if (data.length < minDataLength) {
    console.warn(`Indicator calculation: Insufficient data. Need at least ${minDataLength} points, got ${data.length}`);
    return false;
  }
  
  // Validate data structure
  const isValidDataPoint = data.every(item => 
    item && 
    typeof item === 'object' && 
    typeof item.time === 'number' && 
    typeof item.close === 'number' &&
    !isNaN(item.close)
  );
  
  if (!isValidDataPoint) {
    console.warn('Indicator calculation: Invalid data structure. Each item must have time and close properties');
    return false;
  }
  
  return true;
};

export const calculateSMA = (data, period = 20) => {
  if (!validateIndicatorInput(data, period, period)) return [];
  
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, d) => acc + d.close, 0);
    sma.push({
      time: data[i].time,
      value: sum / period
    });
  }
  return sma;
};

export const calculateEMA = (data, period = 20) => {
  if (!validateIndicatorInput(data, period, period)) return [];
  
  const ema = [];
  const multiplier = 2 / (period + 1);
  
  // First EMA is SMA
  let sum = data.slice(0, period).reduce((acc, d) => acc + d.close, 0);
  let currentEMA = sum / period;
  
  ema.push({
    time: data[period - 1].time,
    value: currentEMA
  });
  
  // Calculate EMA for remaining data
  for (let i = period; i < data.length; i++) {
    currentEMA = (data[i].close * multiplier) + (currentEMA * (1 - multiplier));
    ema.push({
      time: data[i].time,
      value: currentEMA
    });
  }
  
  return ema;
};

export const calculateRSI = (data, period = 14) => {
  if (!validateIndicatorInput(data, period, period + 1)) return [];
  
  const rsi = [];
  const gains = [];
  const losses = [];
  
  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  // Calculate initial average gain and loss
  let avgGain = gains.slice(0, period).reduce((acc, g) => acc + g, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((acc, l) => acc + l, 0) / period;
  
  // Calculate RSI for the first period
  const rs = avgLoss === 0 ? 0 : avgGain / avgLoss;
  const rsiValue = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
  rsi.push({
    time: data[period].time,
    value: rsiValue
  });
  
  // Calculate RSI for remaining data
  for (let i = period; i < gains.length; i++) {
    avgGain = ((avgGain * (period - 1)) + gains[i]) / period;
    avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period;
    
    const rs = avgLoss === 0 ? 0 : avgGain / avgLoss;
    const rsiValue = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
    rsi.push({
      time: data[i + 1].time,
      value: rsiValue
    });
  }
  
  return rsi;
};

export const calculateMACD = (data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  // Validate all periods
  if (!validateIndicatorInput(data, slowPeriod, slowPeriod + signalPeriod)) return { macdLine: [], signalLine: [], histogram: [] };
  if (fastPeriod <= 0 || fastPeriod >= slowPeriod) {
    console.warn('MACD calculation: Invalid periods. fastPeriod must be > 0 and < slowPeriod');
    return { macdLine: [], signalLine: [], histogram: [] };
  }
  if (signalPeriod <= 0) {
    console.warn('MACD calculation: Invalid signal period');
    return { macdLine: [], signalLine: [], histogram: [] };
  }
  
  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);
  
  // Calculate MACD line
  const macdLine = [];
  const slowStartIndex = slowPeriod - fastPeriod;
  
  for (let i = 0; i < slowEMA.length; i++) {
    const fastIndex = i + slowStartIndex;
    if (fastIndex >= 0 && fastIndex < fastEMA.length) {
      macdLine.push({
        time: slowEMA[i].time,
        value: fastEMA[fastIndex].value - slowEMA[i].value
      });
    }
  }
  
  // Calculate signal line (EMA of MACD line)
  const signalLine = calculateEMA(macdLine, signalPeriod);
  
  // Calculate histogram
  const histogram = [];
  for (let i = 0; i < signalLine.length; i++) {
    const macdIndex = i + signalPeriod - 1;
    if (macdIndex < macdLine.length) {
      histogram.push({
        time: signalLine[i].time,
        value: macdLine[macdIndex].value - signalLine[i].value
      });
    }
  }
  
  return {
    macdLine: macdLine.slice(signalPeriod - 1),
    signalLine,
    histogram
  };
}; 
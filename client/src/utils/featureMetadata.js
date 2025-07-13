// Feature metadata configuration
export const FEATURE_CATEGORIES = [
  { value: 'all', label: 'All Features' },
  { value: 'momentum', label: 'Momentum' },
  { value: 'trend', label: 'Trend' },
  { value: 'volatility', label: 'Volatility' },
  { value: 'volume', label: 'Volume' },
  { value: 'price', label: 'Price Action' }
];

export const FEATURE_METADATA = {
  'price_change': {
    name: 'Price Change',
    description: 'Percentage change in closing price from previous period',
    category: 'price',
    learnMore: '/education/technical-analysis/price-action'
  },
  'price_change_5': {
    name: 'Price Change (5d)',
    description: 'Percentage change in closing price over 5 periods',
    category: 'price',
    learnMore: '/education/technical-analysis/price-action'
  },
  'price_change_10': {
    name: 'Price Change (10d)',
    description: 'Percentage change in closing price over 10 periods',
    category: 'price',
    learnMore: '/education/technical-analysis/price-action'
  },
  'open_close_ratio': {
    name: 'Open/Close Ratio',
    description: 'Ratio between opening and closing prices',
    category: 'price',
    learnMore: '/education/technical-analysis/candlestick-patterns'
  },
  'body_size': {
    name: 'Candlestick Body Size',
    description: 'Relative size of the candlestick body',
    category: 'price',
    learnMore: '/education/technical-analysis/candlestick-patterns'
  },
  'gap_up': {
    name: 'Gap Up',
    description: 'Binary indicator for price gaps upward',
    category: 'price',
    learnMore: '/education/technical-analysis/gaps'
  },
  'gap_down': {
    name: 'Gap Down',
    description: 'Binary indicator for price gaps downward',
    category: 'price',
    learnMore: '/education/technical-analysis/gaps'
  },
  'volatility': {
    name: 'Volatility',
    description: 'Standard deviation of price changes over 10 periods',
    category: 'volatility',
    learnMore: '/education/technical-analysis/volatility'
  },
  'sma_5': {
    name: 'SMA (5-day)',
    description: 'Simple Moving Average over 5 periods',
    category: 'trend',
    learnMore: '/education/technical-analysis/moving-averages'
  },
  'sma_10': {
    name: 'SMA (10-day)',
    description: 'Simple Moving Average over 10 periods',
    category: 'trend',
    learnMore: '/education/technical-analysis/moving-averages'
  },
  'sma_20': {
    name: 'SMA (20-day)',
    description: 'Simple Moving Average over 20 periods',
    category: 'trend',
    learnMore: '/education/technical-analysis/moving-averages'
  },
  'price_vs_sma5': {
    name: 'Price vs SMA(5)',
    description: 'Price position relative to 5-day moving average',
    category: 'trend',
    learnMore: '/education/technical-analysis/moving-averages'
  },
  'price_vs_sma10': {
    name: 'Price vs SMA(10)',
    description: 'Price position relative to 10-day moving average',
    category: 'trend',
    learnMore: '/education/technical-analysis/moving-averages'
  },
  'price_vs_sma20': {
    name: 'Price vs SMA(20)',
    description: 'Price position relative to 20-day moving average',
    category: 'trend',
    learnMore: '/education/technical-analysis/moving-averages'
  },
  'rsi': {
    name: 'RSI',
    description: 'Relative Strength Index - momentum oscillator',
    category: 'momentum',
    learnMore: '/education/technical-analysis/rsi'
  },
  'macd': {
    name: 'MACD',
    description: 'Moving Average Convergence Divergence',
    category: 'trend',
    learnMore: '/education/technical-analysis/macd'
  },
  'macd_signal': {
    name: 'MACD Signal',
    description: 'MACD signal line (9-period EMA of MACD)',
    category: 'trend',
    learnMore: '/education/technical-analysis/macd'
  },
  'macd_histogram': {
    name: 'MACD Histogram',
    description: 'Difference between MACD and signal line',
    category: 'trend',
    learnMore: '/education/technical-analysis/macd'
  },
  'volume_sma': {
    name: 'Volume SMA',
    description: 'Simple Moving Average of trading volume',
    category: 'volume',
    learnMore: '/education/technical-analysis/volume'
  },
  'volume_ratio': {
    name: 'Volume Ratio',
    description: 'Current volume relative to average volume',
    category: 'volume',
    learnMore: '/education/technical-analysis/volume'
  },
  'bb_middle': {
    name: 'Bollinger Bands Middle',
    description: '20-period SMA (middle line of Bollinger Bands)',
    category: 'volatility',
    learnMore: '/education/technical-analysis/bollinger-bands'
  },
  'bb_upper': {
    name: 'Bollinger Bands Upper',
    description: 'Upper band of Bollinger Bands (+2 standard deviations)',
    category: 'volatility',
    learnMore: '/education/technical-analysis/bollinger-bands'
  },
  'bb_lower': {
    name: 'Bollinger Bands Lower',
    description: 'Lower band of Bollinger Bands (-2 standard deviations)',
    category: 'volatility',
    learnMore: '/education/technical-analysis/bollinger-bands'
  },
  'bb_position': {
    name: 'Bollinger Bands Position',
    description: 'Price position within Bollinger Bands (0-1 scale)',
    category: 'volatility',
    learnMore: '/education/technical-analysis/bollinger-bands'
  }
};

// Utility functions
export const getFeatureMetadata = (featureName) => {
  return FEATURE_METADATA[featureName] || {
    name: featureName,
    description: 'No description available',
    category: 'unknown',
    learnMore: null
  };
};

export const formatFeatureValue = (value) => {
  if (typeof value === 'number') {
    return value.toFixed(4);
  }
  return value?.toString() || 'N/A';
};

export const filterFeatures = (features, searchTerm, selectedCategory) => {
  return features.filter(feature => {
    const metadata = getFeatureMetadata(feature.name);
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        feature.name.toLowerCase().includes(searchLower) ||
        metadata.name?.toLowerCase().includes(searchLower) ||
        metadata.description?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      return metadata.category === selectedCategory;
    }
    
    return true;
  });
}; 
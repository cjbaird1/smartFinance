import React, { useState, useEffect } from 'react';
import ValidatedInput from '../components/ValidatedInput';
import { useTickerValidation } from '../hooks/useTickerValidation';
import '../styles/predictions-page.css';

const PredictionsPage = () => {
  const [ticker, setTicker] = useState('');
  const [timeframe, setTimeframe] = useState('1d');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [historicalPerformance, setHistoricalPerformance] = useState(null);

  // Use the custom hook for ticker validation
  const { tickerError, validateTicker, handleTickerError, clearTickerError } = useTickerValidation();

  const TIMEFRAMES = [
    { value: '1d', label: 'Daily' },
    { value: '1w', label: 'Weekly' },
    { value: '1M', label: 'Monthly' },
  ];

  const fetchPrediction = async (tickerSymbol) => {
    if (!tickerSymbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/predict?ticker=${tickerSymbol}&interval=${timeframe}&n_bars=100`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return null;
      }
      
      return data;
    } catch (err) {
      setError('Failed to get ML prediction');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrediction = async () => {
    if (!ticker || tickerError) return;
    
    const prediction = await fetchPrediction(ticker);
    if (prediction) {
      const newPrediction = {
        ...prediction,
        id: Date.now(),
        timestamp: new Date().toISOString(),
        timeframe
      };
      
      setPredictions(prev => [newPrediction, ...prev]);
      setSelectedPrediction(newPrediction);
      setTicker('');
    }
  };

  const handleTickerChange = (e) => {
    const value = e.target.value.toUpperCase();
    setTicker(value);
    clearTickerError();
    
    if (value) {
      const error = validateTicker(value);
      if (error) {
        handleTickerError(error);
      }
    }
  };

  const removePrediction = (id) => {
    setPredictions(prev => prev.filter(p => p.id !== id));
    if (selectedPrediction?.id === id) {
      setSelectedPrediction(null);
    }
  };

  const getPredictionColor = (pred) => {
    switch (pred) {
      case 'Bullish':
        return '#26a69a';
      case 'Bearish':
        return '#ef5350';
      default:
        return '#757575';
    }
  };

  const getPredictionIcon = (pred) => {
    switch (pred) {
      case 'Bullish':
        return '📈';
      case 'Bearish':
        return '📉';
      default:
        return '➡️';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.7) return '#4caf50';
    if (confidence >= 0.5) return '#ff9800';
    return '#f44336';
  };

  const calculateHistoricalAccuracy = () => {
    if (predictions.length < 2) return null;
    
    // This would ideally compare predictions with actual outcomes
    // For now, we'll show a placeholder
    return {
      totalPredictions: predictions.length,
      accuracy: 'Historical tracking coming soon...',
      bestPerforming: predictions[0]?.ticker || 'N/A'
    };
  };

  return (
    <div className="predictions-page">
      <div className="predictions-header">
        <h2>ML Predictions Dashboard</h2>
        <p className="predictions-subtitle">
          Machine learning-powered stock movement predictions using technical analysis
        </p>
      </div>

      {/* Input Section */}
      <div className="predictions-input-section">
        <div className="input-group">
          <ValidatedInput
            type="text"
            value={ticker}
            onChange={handleTickerChange}
            placeholder="Enter stock ticker (e.g. AAPL)"
            error={tickerError}
          />
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="timeframe-select"
          >
            {TIMEFRAMES.map((tf) => (
              <option key={tf.value} value={tf.value}>
                {tf.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddPrediction}
            disabled={loading || !ticker || tickerError}
            className="add-prediction-btn"
          >
            {loading ? 'Analyzing...' : 'Add Prediction'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Predictions Grid */}
      <div className="predictions-grid">
        {/* Active Predictions */}
        <div className="predictions-section">
          <h3>Active Predictions ({predictions.length})</h3>
          {predictions.length === 0 ? (
            <div className="empty-state">
              <p>No predictions yet. Add a ticker to get started!</p>
            </div>
          ) : (
            <div className="predictions-list">
              {predictions.map((prediction) => (
                <div 
                  key={prediction.id} 
                  className={`prediction-card ${selectedPrediction?.id === prediction.id ? 'selected' : ''}`}
                  onClick={() => setSelectedPrediction(prediction)}
                >
                  <div className="prediction-header">
                    <div className="prediction-ticker">
                      <span className="ticker-symbol">{prediction.ticker}</span>
                      <span className="timeframe-badge">{prediction.timeframe}</span>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePrediction(prediction.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                  
                  <div className="prediction-main">
                    <div 
                      className="prediction-label"
                      style={{ color: getPredictionColor(prediction.prediction) }}
                    >
                      <span className="prediction-icon">
                        {getPredictionIcon(prediction.prediction)}
                      </span>
                      <span className="prediction-text">
                        {prediction.prediction}
                      </span>
                    </div>
                    
                    <div className="prediction-confidence">
                      <span>Confidence: </span>
                      <span 
                        className="confidence-value"
                        style={{ color: getConfidenceColor(prediction.confidence) }}
                      >
                        {(prediction.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="prediction-timestamp">
                    {new Date(prediction.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Analysis */}
        <div className="analysis-section">
          <h3>Detailed Analysis</h3>
          {selectedPrediction ? (
            <div className="detailed-analysis">
              <div className="analysis-header">
                <h4>{selectedPrediction.ticker} Analysis</h4>
                <span className="analysis-timeframe">{selectedPrediction.timeframe}</span>
              </div>
              
              <div className="probability-breakdown">
                <h5>Probability Breakdown</h5>
                <div className="probability-bars">
                  {Object.entries(selectedPrediction.probabilities).map(([label, prob]) => (
                    <div key={label} className="probability-bar">
                      <div className="probability-label">
                        <span className="probability-icon">
                          {getPredictionIcon(label)}
                        </span>
                        {label}
                      </div>
                      <div className="probability-bar-container">
                        <div 
                          className="probability-bar-fill"
                          style={{ 
                            width: `${prob * 100}%`,
                            backgroundColor: getPredictionColor(label)
                          }}
                        ></div>
                        <span className="probability-percentage">
                          {(prob * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="model-info">
                <h5>Model Information</h5>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Model Type:</span>
                    <span className="info-value">Random Forest Classifier</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Features Used:</span>
                    <span className="info-value">13 Technical Indicators</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Training Data:</span>
                    <span className="info-value">100+ Historical Bars</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Prediction Horizon:</span>
                    <span className="info-value">5 Periods Ahead</span>
                  </div>
                </div>
              </div>
              
              <div className="technical-indicators">
                <h5>Key Technical Indicators</h5>
                <div className="indicators-grid">
                  <div className="indicator-item">
                    <span className="indicator-name">RSI</span>
                    <span className="indicator-desc">Momentum oscillator</span>
                  </div>
                  <div className="indicator-item">
                    <span className="indicator-name">MACD</span>
                    <span className="indicator-desc">Trend following</span>
                  </div>
                  <div className="indicator-item">
                    <span className="indicator-name">Moving Averages</span>
                    <span className="indicator-desc">Price trends</span>
                  </div>
                  <div className="indicator-item">
                    <span className="indicator-name">Volume</span>
                    <span className="indicator-desc">Market participation</span>
                  </div>
                  <div className="indicator-item">
                    <span className="indicator-name">Volatility</span>
                    <span className="indicator-desc">Price stability</span>
                  </div>
                  <div className="indicator-item">
                    <span className="indicator-name">Bollinger Bands</span>
                    <span className="indicator-desc">Price channels</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-analysis">
              <p>Select a prediction to view detailed analysis</p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Performance */}
      <div className="historical-section">
        <h3>Historical Performance</h3>
        <div className="performance-stats">
          {calculateHistoricalAccuracy() ? (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Predictions</span>
                <span className="stat-value">{calculateHistoricalAccuracy().totalPredictions}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Accuracy</span>
                <span className="stat-value">{calculateHistoricalAccuracy().accuracy}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Best Performing</span>
                <span className="stat-value">{calculateHistoricalAccuracy().bestPerforming}</span>
              </div>
            </div>
          ) : (
            <div className="empty-performance">
              <p>Historical performance tracking will be available after multiple predictions</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="predictions-disclaimer">
        <h4>⚠️ Important Disclaimer</h4>
        <p>
          This machine learning model is for educational purposes only. The predictions are based on 
          historical technical analysis patterns and should not be considered as financial advice. 
          Past performance does not guarantee future results. Always conduct your own research and 
          consider consulting with a financial advisor before making investment decisions.
        </p>
      </div>
    </div>
  );
};

export default PredictionsPage; 
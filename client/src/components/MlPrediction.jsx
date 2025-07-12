import React, { useState, useEffect } from 'react';
import '../styles/ml-prediction.css';

const MlPrediction = ({ ticker, timeframe, onPredictionUpdate }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    if (!ticker) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/predict?ticker=${ticker}&interval=${timeframe}&n_bars=100`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch prediction');
      }
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setPrediction({
          prediction: 'Neutral',
          confidence: 0.0,
          probabilities: { Bullish: 0.33, Bearish: 0.33, Neutral: 0.34 }
        });
      } else {
        setPrediction(data);
        if (onPredictionUpdate) {
          onPredictionUpdate(data);
        }
      }
    } catch (err) {
      setError('Failed to get ML prediction');
      setPrediction({
        prediction: 'Neutral',
        confidence: 0.0,
        probabilities: { Bullish: 0.33, Bearish: 0.33, Neutral: 0.34 }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticker) {
      fetchPrediction();
    }
  }, [ticker, timeframe]);

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

  if (!ticker) {
    return (
      <div className="ml-prediction-container">
        <div className="ml-prediction-header">
          <h3>ML Prediction</h3>
        </div>
        <div className="ml-prediction-content">
          <p className="ml-prediction-placeholder">
            Enter a ticker to see ML prediction
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-prediction-container">
      <div className="ml-prediction-header">
        <h3>ML Prediction</h3>
        <button 
          className="ml-prediction-refresh"
          onClick={fetchPrediction}
          disabled={loading}
        >
          {loading ? '🔄' : '🔄'}
        </button>
      </div>
      
      <div className="ml-prediction-content">
        {loading ? (
          <div className="ml-prediction-loading">
            <div className="loading-spinner"></div>
            <p>Analyzing {ticker}...</p>
          </div>
        ) : error ? (
          <div className="ml-prediction-error">
            <p>⚠️ {error}</p>
          </div>
        ) : prediction ? (
          <>
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
            
            <div className="prediction-probabilities">
              <h4>Probability Breakdown:</h4>
              <div className="probability-bars">
                {Object.entries(prediction.probabilities).map(([label, prob]) => (
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
            
            <div className="prediction-disclaimer">
              <p>
                ⚠️ This is for educational purposes only. 
                ML predictions are not financial advice.
              </p>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default MlPrediction; 
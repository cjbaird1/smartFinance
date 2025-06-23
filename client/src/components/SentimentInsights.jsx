import React from 'react';
import '../styles/sentiment-insights.css';
import '../styles/sentiment-common.css';

const SentimentInsights = ({ data }) => {
  if (!data || !data.sentiment_distribution) {
    return <p className="empty-state">No sentiment insights available.</p>;
  }

  const {
    overall_sentiment: overallSentiment,
    sentiment_trend: sentimentTrend,
    sentiment_distribution: { positive: positiveCount, neutral: neutralCount, negative: negativeCount }
  } = data;

  const getSentimentLabel = (sentiment) => {
    if (sentiment > 0.3) return 'Positive';
    if (sentiment < -0.3) return 'Negative';
    return 'Neutral';
  };

  const formatScore = (score) => {
    if (typeof score !== 'number') return '0.00';
    return score.toFixed(2);
  };

  return (
    <div className="sentiment-insights-container">
      <h4>Overall Sentiment Overview</h4>
      <div className="sentiment-summary-cards">
        <div className="summary-card">
          <span className="card-label">Overall Score:</span>
          <span className={`sentiment-badge ${getSentimentLabel(overallSentiment).toLowerCase()}`}>
            {formatScore(overallSentiment)}
          </span>
        </div>
        <div className="summary-card">
          <span className="card-label">Trend:</span>
          <span className="trend-indicator">
            {sentimentTrend > 0 ? 'Improving' : sentimentTrend < 0 ? 'Declining' : 'Stable'}
          </span>
        </div>
      </div>

      <h4>Sentiment Distribution</h4>
      <div className="sentiment-distribution-counts">
        <div className="distribution-item positive">
          Positive: <span className="count">{positiveCount}</span>
        </div>
        <div className="distribution-item neutral">
          Neutral: <span className="count">{neutralCount}</span>
        </div>
        <div className="distribution-item negative">
          Negative: <span className="count">{negativeCount}</span>
        </div>
      </div>

      {/* Future: Add a simple chart here */}
    </div>
  );
};

export default SentimentInsights; 
import React from 'react';
import '../styles/sentiment-analysis.css';
import '../styles/sentiment-common.css';

const SentimentAnalysis = ({ data }) => {
  // Default values if data is undefined
  const {
    overall_sentiment: overallSentiment = 0,
    sentiment_trend: sentimentTrend = 0,
    social_media_sentiment: socialMediaSentiment = 0,
    news_sentiment: newsSentiment = 0,
    technical_sentiment: technicalSentiment = 0
  } = data || {};

  // Function to get sentiment class
  const getSentimentClass = (sentiment) => {
    if (!sentiment) return 'sentiment-neutral';
    if (sentiment > 0.3) return 'sentiment-positive';
    if (sentiment < -0.3) return 'sentiment-negative';
    return 'sentiment-neutral';
  };

  // Function to get sentiment label
  const getSentimentLabel = (sentiment) => {
    if (!sentiment) return 'Neutral';
    if (sentiment > 0.3) return 'Positive';
    if (sentiment < -0.3) return 'Negative';
    return 'Neutral';
  };

  // Function to format sentiment score
  const formatScore = (score) => {
    if (typeof score !== 'number') return '0.00';
    return score.toFixed(2);
  };

  return (
    <div>
      {/* Overall Sentiment */}
      <div className="sentiment-section">
        <h4>Overall Sentiment</h4>
        <div className="sentiment-card">
          <div className="sentiment-overall">
            <div className={`sentiment-badge ${getSentimentClass(overallSentiment)}`}>
              {getSentimentLabel(overallSentiment)}
            </div>
            <div className="sentiment-score">
              Score: {formatScore(overallSentiment)}
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div className="sentiment-section">
        <h4>Sentiment Breakdown</h4>
        <div className="sentiment-breakdown">
          {/* Social Media Sentiment */}
          <div className="breakdown-card">
            <div className="breakdown-label">
              Social Media
            </div>
            <div className={`breakdown-badge ${getSentimentClass(socialMediaSentiment)}`}>
              {getSentimentLabel(socialMediaSentiment)}
            </div>
          </div>

          {/* News Sentiment */}
          <div className="breakdown-card">
            <div className="breakdown-label">
              News
            </div>
            <div className={`breakdown-badge ${getSentimentClass(newsSentiment)}`}>
              {getSentimentLabel(newsSentiment)}
            </div>
          </div>

          {/* Technical Sentiment */}
          <div className="breakdown-card">
            <div className="breakdown-label">
              Technical
            </div>
            <div className={`breakdown-badge ${getSentimentClass(technicalSentiment)}`}>
              {getSentimentLabel(technicalSentiment)}
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Trend */}
      <div className="sentiment-section">
        <h4>Sentiment Trend</h4>
        <div className="sentiment-card">
          <div className="sentiment-score">
            {sentimentTrend > 0 ? 'Improving' : sentimentTrend < 0 ? 'Declining' : 'Stable'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis; 
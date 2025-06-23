import React from 'react';
import '../styles/news-item.css';

const NewsItem = ({ article }) => {
  const {
    title,
    source,
    publishedAt,
    url,
    summary,
    sentiment
  } = article;

  // Function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Function to get sentiment class
  const getSentimentClass = (sentiment) => {
    if (sentiment > 0.3) return 'sentiment-positive';
    if (sentiment < -0.3) return 'sentiment-negative';
    return 'sentiment-neutral';
  };

  return (
    <div className="news-item">
      <div className="news-header">
        <h4 className="news-title">
          <a href={url} target="_blank" rel="noopener noreferrer">
            {title}
          </a>
        </h4>
        {sentiment !== undefined && (
          <div className={`sentiment-badge ${getSentimentClass(sentiment)}`}>
            {sentiment > 0.3 ? 'Positive' : sentiment < -0.3 ? 'Negative' : 'Neutral'}
          </div>
        )}
      </div>
      
      <div className="news-meta">
        <span>{source}</span>
        <span>•</span>
        <span>{formatDate(publishedAt)}</span>
      </div>

      {summary && (
        <p className="news-summary">
          {summary}
        </p>
      )}
    </div>
  );
};

export default NewsItem; 
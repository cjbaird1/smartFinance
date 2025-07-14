import React from 'react';

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

  // Function to get sentiment badge Tailwind classes
  const getSentimentBadgeClass = (sentiment) => {
    if (sentiment > 0.3) return 'bg-green-500';
    if (sentiment < -0.3) return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div className="px-4 py-4 border-b border-border transition-colors hover:bg-[#282B33]">
      <div className="flex justify-between items-start mb-2 gap-4">
        <h4 className="m-0 text-base font-medium text-text-main">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-text-main hover:text-accent-hover transition-colors">
            {title}
          </a>
        </h4>
        {sentiment !== undefined && (
          <div className={`px-2 py-1 rounded text-xs font-medium text-white ${getSentimentBadgeClass(sentiment)}`}>
            {sentiment > 0.3 ? 'Positive' : sentiment < -0.3 ? 'Negative' : 'Neutral'}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 mb-2 text-xs text-text-main/80">
        <span>{source}</span>
        <span>•</span>
        <span>{formatDate(publishedAt)}</span>
      </div>
      {summary && (
        <p className="m-0 text-sm text-text-main leading-relaxed">
          {summary}
        </p>
      )}
    </div>
  );
};

export default NewsItem; 
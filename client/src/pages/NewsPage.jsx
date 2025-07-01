import React, { useState } from 'react';
import NewsItem from '../components/NewsItem';
import SentimentAnalysis from '../components/SentimentAnalysis';
import SentimentInsights from '../components/SentimentInsights';
import DateRangePicker from '../components/DateRangePicker';
import Button from '../components/Button';
import ValidatedInput from '../components/ValidatedInput';
import { useTickerValidation } from '../hooks/useTickerValidation';
import '../styles/news-page.css';
import '../styles/error-system.css';

const sentimentTypes = [
  { label: 'All', value: 'all' },
  { label: 'Positive', value: 'positive' },
  { label: 'Neutral', value: 'neutral' },
  { label: 'Negative', value: 'negative' }
];

const getSentimentType = (sentiment) => {
  if (sentiment > 0.3) return 'positive';
  if (sentiment < -0.3) return 'negative';
  return 'neutral';
};

const NewsPage = () => {
  const [selectedTicker, setSelectedTicker] = useState('');
  const [newsData, setNewsData] = useState([]);
  const [sentimentData, setSentimentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isNewsSectionOpen, setIsNewsSectionOpen] = useState(true);
  const [isSentimentSectionOpen, setIsSentimentSectionOpen] = useState(true);
  const [isSentimentInsightsOpen, setIsSentimentInsightsOpen] = useState(true);

  // Use the custom hook for ticker validation
  const { tickerError, validateTicker, handleTickerError, clearTickerError } = useTickerValidation();

  const fetchNewsAndSentiment = async (ticker) => {
    setLoading(true);
    setError(null);
    clearTickerError();
    
    // Validate ticker using the custom hook
    if (!validateTicker(ticker)) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/api/news?ticker=${ticker}`);
      const data = await response.json();
      
      if (!response.ok) {
        const tickerErrorMsg = handleTickerError(data.error, ticker);
        if (tickerErrorMsg) {
          throw new Error(tickerErrorMsg);
        }
        setError('Failed to fetch news and sentiment data');
        throw new Error('Failed to fetch news and sentiment data');
      }
      
      if (!data.articles || data.articles.length === 0) {
        const msg = `No Data Found for ticker symbol: "${ticker}"`;
        handleTickerError(msg, ticker);
        return;
      }
      
      setNewsData(data.articles || []);
      setSentimentData(data.sentiment_analysis || null);
    } catch (err) {
      if (!err.message.includes(`No Data Found for ticker symbol: "${ticker}"`)) {
        setError('Failed to fetch news and sentiment data');
      }
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTickerChange = (e) => {
    setSelectedTicker(e.target.value.toUpperCase());
    clearTickerError();
  };

  const filteredNews = newsData
    .filter(article => {
      // Filter by sentiment
      if (filter !== 'all' && getSentimentType(article.sentiment) !== filter) {
        return false;
      }

      // Filter by date range
      if (startDate || endDate) {
        const articleDate = new Date(article.publishedAt);
        if (startDate && articleDate < startDate) return false;
        if (endDate && articleDate > endDate) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (filter === 'all') {
        const sentimentOrder = { positive: 3, neutral: 2, negative: 1 };
        const aType = getSentimentType(a.sentiment);
        const bType = getSentimentType(b.sentiment);

        if (sentimentOrder[aType] !== sentimentOrder[bType]) {
          return sentimentOrder[bType] - sentimentOrder[aType];
        }
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      }
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

  return (
    <div className="news-page">
      <h2>News & Sentiment Analysis</h2>
      
      {/* Search Section */}
      <div className="search-section">
        <ValidatedInput
          type="text"
          value={selectedTicker}
          onChange={handleTickerChange}
          placeholder="Enter stock ticker (e.g. AAPL)"
          error={tickerError}
        />
        <Button
          onClick={() => fetchNewsAndSentiment(selectedTicker)}
          variant="search"
          disabled={loading}
          wave={false}
        >
          {loading ? 'Loading...' : 'Get News & Sentiment'}
        </Button>
      </div>

    
      {/* News Section */}
      <div className="news-section">
        <h3 className="collapsible-header" onClick={() => setIsNewsSectionOpen(!isNewsSectionOpen)}>
          Latest News
          <span className={`collapse-icon ${isNewsSectionOpen ? 'open' : ''}`}>&#9660;</span>
        </h3>
        {isNewsSectionOpen && (
          <>
            <div className="filter-options-bar">
              <div className="filter-bar">
                {sentimentTypes.map(type => (
                  <Button
                    key={type.value}
                    variant="filter"
                    active={filter === type.value}
                    onClick={() => setFilter(type.value)}
                    wave={false}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
              <div className="date-filter">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  className="news-date-picker"
                />
              </div>
            </div>
            {filteredNews.length === 0 ? (
              <p className="empty-state">No articles found for this filter.</p>
            ) : (
              <div>
                {filteredNews.map((article, index) => (
                  <NewsItem key={index} article={article} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sentiment Analysis Section */}
      <div className="sentiment-section">
        <h3 className="collapsible-header" onClick={() => setIsSentimentSectionOpen(!isSentimentSectionOpen)}>
          Sentiment Analysis
          <span className={`collapse-icon ${isSentimentSectionOpen ? 'open' : ''}`}>&#9660;</span>
        </h3>
        {isSentimentSectionOpen && (
          !sentimentData ? (
            <p className="empty-state">Enter a ticker symbol to view sentiment analysis</p>
          ) : (
            <SentimentAnalysis data={sentimentData} />
          )
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default NewsPage; 
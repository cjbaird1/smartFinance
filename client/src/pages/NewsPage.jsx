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
  const { tickerError, validateTicker, handleTickerError, clearTickerError, setTickerError } = useTickerValidation();

  const fetchNewsAndSentiment = async (ticker) => {
    setLoading(true);
    setError(null);
    
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
        setTickerError(`No Data Found for ticker symbol: "${ticker}"`);
        return;
      }
      
      setNewsData(data.articles || []);
      setSentimentData(data.sentiment_analysis || null);
    } catch (err) {
      // If the ticker is valid format but fetch fails, show a user-facing error under the input
      if (/^[A-Z]{1,5}$/.test(ticker)) {
        setTickerError(`No Data Found for ticker symbol: "${ticker}"`);
      } else {
        setError('Failed to fetch news and sentiment data');
      }
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTickerChange = (e) => {
    const newTicker = e.target.value.toUpperCase();
    setSelectedTicker(newTicker);
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
    <div className="min-h-screen bg-bg-main text-text-main">
      <h2 className="mb-6 text-text-main text-2xl font-semibold">News & Sentiment Analysis</h2>
      {/* Search Section */}
      <div className="flex flex-wrap gap-4 items-start bg-bg-panel p-4 rounded-xl shadow-shadow mb-8">
        <ValidatedInput
          type="text"
          value={selectedTicker}
          onChange={handleTickerChange}
          placeholder="Enter stock ticker (e.g. AAPL)"
          error={tickerError}
          className="w-60"
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
      <div className="bg-bg-panel rounded-xl shadow-shadow p-6 mb-8">
        <h3
          className="flex justify-between items-center cursor-pointer text-xl font-semibold mb-4 select-none"
          onClick={() => setIsNewsSectionOpen(!isNewsSectionOpen)}
        >
          <span>Latest News</span>
          <span className={`transition-transform duration-300 text-lg ${isNewsSectionOpen ? 'rotate-180' : ''}`}>&#9660;</span>
        </h3>
        {isNewsSectionOpen && (
          <>
            <div className="flex flex-wrap gap-4 justify-between items-center mb-5">
              <div className="flex gap-2 flex-wrap">
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
              <div className="flex items-center">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onStartDateChange={setStartDate}
                  onEndDateChange={setEndDate}
                  className="min-w-[220px] md:min-w-[300px]"
                />
              </div>
            </div>
            {filteredNews.length === 0 ? (
              <p className="text-text-muted italic">No articles found for this filter.</p>
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
      <div className="bg-bg-panel rounded-xl shadow-shadow p-6 mb-8">
        <h3
          className="flex justify-between items-center cursor-pointer text-xl font-semibold mb-4 select-none"
          onClick={() => setIsSentimentSectionOpen(!isSentimentSectionOpen)}
        >
          <span>Sentiment Analysis</span>
          <span className={`transition-transform duration-300 text-lg ${isSentimentSectionOpen ? 'rotate-180' : ''}`}>&#9660;</span>
        </h3>
        {isSentimentSectionOpen && (
          !sentimentData ? (
            <p className="text-text-muted italic">Enter a ticker symbol to view sentiment analysis</p>
          ) : (
            <SentimentAnalysis data={sentimentData} />
          )
        )}
      </div>

      {error && (
        <div className="bg-[#2d1a1a] text-error mt-4 p-3 rounded-lg font-medium">
          {error}
        </div>
      )}
    </div>
  );
};

export default NewsPage; 
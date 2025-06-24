# Project Page Requirements Documentation

This document outlines the functional requirements for each main page accessible via the sidebar in the Senior Project application.

---

## 1. Search Ticker
- **Purpose:**
  - Allow users to search for a stock ticker symbol and view detailed information.
- **Requirements:**
  - Provide an input for users to enter a valid stock ticker (e.g., AAPL, MSFT). DONE 
  - Display real-time and historical price data for the selected ticker. DONE
  - Allow users to select the timeframe and number of data points (bars) to view. DONE 
  - Render a candlestick chart visualizing the price data. DONE
  - Display error messages for invalid tickers or unavailable data. 

---

## 2. Technical Charts
- **Purpose:**
  - Offer advanced charting capabilities for technical analysis.
- **Requirements:**
  - Display interactive charts for selected tickers.
  - Support multiple chart types (e.g., candlestick, line, bar).
  - Allow users to apply technical indicators and overlays (e.g., moving averages, RSI).
  - Enable zooming, panning, and other chart interactions.
  - Provide options to customize chart appearance and settings.

---

## 3. Predictions
- **Purpose:**
  - Present machine learning or statistical predictions for stock price movement.
- **Requirements:**
  - Display predicted price trends or signals for selected tickers.
  - Show model confidence or probability scores where applicable.
  - Provide a clear disclaimer regarding the predictive nature and limitations.
  - Allow users to compare predictions with actual historical data.

---

## 4. Strategy Tester
- **Purpose:**
  - Enable users to test trading strategies on historical data.
- **Requirements:**
  - Allow users to define or select trading strategies (e.g., moving average crossover).
  - Simulate strategy performance using historical price data.
  - Display key performance metrics (e.g., returns, drawdown, win rate).
  - Visualize trades and strategy outcomes on charts.
  - Provide options to adjust strategy parameters and re-run tests.

---

## 5. News & Sentiment
- **Purpose:**
  - Aggregate and analyze recent news articles related to a selected stock ticker.
- **Requirements:**
  - Fetch and display recent news articles for the selected ticker from reliable sources (e.g., Finnhub).
  - Show article headline, source, publication date, summary, and a link to the full article.
  - Analyze and display sentiment for each article (positive, negative, neutral).
  - Present an overall sentiment summary and trend for the ticker.
  - Allow users to filter articles by sentiment type (All, Positive, Neutral, Negative).
  - Display articles ordered by sentiment (Positive, Neutral, Negative) when the 'All' filter is selected.
  - The sentiment filter buttons should be integrated directly within the 'Latest News' collapsible header.
  - **The sentiment filter buttons should only be visible when the 'Latest News' collapsible header is open, positioned to the right, above the first article.**
  - Provide a collapsible 'Sentiment Insights' section displaying:
    - Overall sentiment score and trend.
    - Distribution counts of positive, neutral, and negative articles.
    - (Future consideration: Simple data visualizations for sentiment distribution).

---

## 6. Education Center
- **Purpose:**
  - Provide educational resources and tutorials on trading, investing, and platform usage.
- **Requirements:**
  - Organize content into topics and subtopics (e.g., technical analysis, trading terms).
  - Present information in a clear, accessible format (text, images, diagrams).
  - Include guides on using the platform's features.
  - Allow users to browse and search educational content.

---

## 7. Alerts
- **Purpose:**
  - Allow users to set up and manage custom alerts for price movements and market conditions.
- **Requirements:**
  - Enable users to define alert conditions (e.g., price above/below threshold, indicator triggers).
  - Display a list of active and past alerts.
  - Notify users when alert conditions are met (e.g., via UI notification or email).
  - Allow users to edit or delete existing alerts.

---

*This document should be updated as new features are added or requirements change.* 
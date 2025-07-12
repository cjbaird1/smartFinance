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
  - Display error messages for invalid tickers or unavailable data. DONE

---

## 2. Technical Charts
- **Purpose:**
  - Offer advanced charting capabilities for technical analysis.
- **Requirements:**
  - Display interactive charts for selected tickers. DONE
  - Support multiple chart types (e.g., candlestick, line, bar). DONE 
  - Allow users to apply technical indicators and overlays (e.g., moving averages, RSI). DONE (Partially there's ui bug w RSI)
  - Enable zooming, panning, and other chart interactions. DONE
  - Provide options to customize chart appearance and settings. DONE (partially I have color settings for chart done.)

---

## 3. Predictions
- **Purpose:**
  - Present machine learning or statistical predictions for stock price movement.
- **Requirements:**
  - Display predicted price trends or signals for selected tickers. DONE
  - Show model confidence or probability scores where applicable. DONE
  - Provide a clear disclaimer regarding the predictive nature and limitations. DONE
  - Allow users to compare predictions with actual historical data. DONE
  - **ML-Based Stock Movement Prediction (Bullish, Bearish, Neutral):**
    - User inputs a ticker, and app returns a classification label (Neutral, Bullish, Bearish). DONE
    - Verified by model output as well as visual display. DONE
    - Uses technical indicators (RSI, MACD, moving averages, volatility, volume) for prediction. DONE
    - Displays confidence scores and probability breakdowns. DONE
    - Integrated into Trade Simulator page for educational purposes. DONE

---

## 4. Strategy Tester
- **Purpose:**
  - Enable users to test trading strategies on historical data.
- **Requirements:**
  - Allow users to define or select trading strategies (e.g., moving average crossover). DONE
  - Simulate strategy performance using historical price data. DONE
  - Display key performance metrics (e.g., returns, drawdown, win rate). DONE
  - Visualize trades and strategy outcomes on charts. DONE
  - Provide options to adjust strategy parameters and re-run tests.

---

## 5. News & Sentiment
- **Purpose:**
  - Aggregate and analyze recent news articles related to a selected stock ticker.
- **Requirements:**
  - Fetch and display recent news articles for the selected ticker from reliable sources (e.g., Finnhub). DONE 
  - Show article headline, source, publication date, summary, and a link to the full article. DONE 
  - Analyze and display sentiment for each article (positive, negative, neutral). DONE 
  - Present an overall sentiment summary and trend for the ticker. DONE 
  - Allow users to filter articles by sentiment type (All, Positive, Neutral, Negative). DONE 
  - Display articles ordered by sentiment (Positive, Neutral, Negative) when the 'All' filter is selected. DONE 
  - The sentiment filter buttons should be integrated directly within the 'Latest News' collapsible header. DONE
  - **The sentiment filter buttons should only be visible when the 'Latest News' collapsible header is open, positioned to the right, above the first article.** DONE
  - Provide a collapsible 'Sentiment Insights' section displaying:
    - Overall sentiment score and trend.
    - Distribution counts of positive, neutral, and negative articles.
    - (Future consideration: Simple data visualizations for sentiment distribution).

---

## 6. Education Center
- **Purpose:**
  - Provide educational resources and tutorials on trading, investing, and platform usage.
- **Requirements:**
  - Organize content into topics and subtopics (e.g., technical analysis, trading terms). DONE
  - Present information in a clear, accessible format (text, images, diagrams). DONE
  - Include guides on using the platform's features. DONE
  - Allow users to browse and search educational content. DONE

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
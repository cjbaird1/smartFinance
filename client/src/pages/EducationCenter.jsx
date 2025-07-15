import React, { useRef, useEffect } from 'react';
import '../styles/education-center.css';
import { useLocation } from 'react-router-dom';

const toSlug = (str) => str.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

const featureDescriptions = [
  {
    name: 'Price Change',
    description: 'Measures the percentage change in closing price from the previous period. This feature captures immediate price momentum and is fundamental for identifying short-term trends or reversals.'
  },
  {
    name: 'Price Change (5d)',
    description: 'Calculates the percentage change in closing price over the last 5 periods. It smooths out daily noise and helps the model recognize medium-term price direction. Useful for detecting sustained moves.'
  },
  {
    name: 'Price Change (10d)',
    description: 'Similar to the 5-day version, but over 10 periods. This feature highlights longer-term price trends and can help the model distinguish between short-lived fluctuations and more persistent moves.'
  },
  {
    name: 'Open/Close Ratio',
    description: 'The ratio between the opening and closing prices for a period. This feature can indicate intraday sentiment—whether buyers or sellers dominated the session.'
  },
  {
    name: 'High/Low Ratio',
    description: 'Compares the highest and lowest prices within a period. It\'s a measure of volatility and trading range, helping the model assess how much price fluctuated during the session.'
  },
  {
    name: 'Volume',
    description: 'The total number of shares traded in a period. Volume is a key indicator of market participation and can confirm the strength of price moves or signal potential reversals when diverging from price.'
  },
  {
    name: 'SMA (5)',
    description: 'The 5-period Simple Moving Average of closing prices. This short-term trend indicator helps the model identify recent price direction and smooths out minor fluctuations.'
  },
  {
    name: 'SMA (10)',
    description: 'The 10-period Simple Moving Average. It provides a slightly longer-term view of price trends, helping to filter out short-term noise and highlight emerging trends.'
  },
  {
    name: 'SMA (20)',
    description: 'The 20-period Simple Moving Average. Often used as a baseline for trend analysis, it helps the model recognize established trends and potential support/resistance levels.'
  },
  {
    name: 'Price vs SMA(5)',
    description: 'Compares the current price to its 5-period SMA. This feature indicates whether the price is above or below its recent average, signaling short-term bullishness or bearishness.'
  },
  {
    name: 'Price vs SMA(10)',
    description: 'Similar to the above, but with a 10-period SMA. It helps the model assess medium-term price positioning relative to trend.'
  },
  {
    name: 'Price vs SMA(20)',
    description: 'Compares price to the 20-period SMA, providing insight into longer-term trend alignment and potential overbought/oversold conditions.'
  },
  {
    name: 'MACD',
    description: 'The Moving Average Convergence Divergence indicator, which measures the difference between two EMAs (typically 12 and 26 periods). It\'s a popular momentum and trend-following tool, helping the model spot shifts in market direction.'
  },
  {
    name: 'MACD Signal',
    description: 'The 9-period EMA of the MACD line. Used to generate buy/sell signals when it crosses the MACD, this feature helps the model identify potential entry and exit points.'
  },
  {
    name: 'MACD Histogram',
    description: 'The difference between the MACD and its signal line. It visualizes the strength and direction of momentum, helping the model gauge the intensity of price moves.'
  },
  {
    name: 'RSI (14)',
    description: 'The 14-period Relative Strength Index, a momentum oscillator that measures the speed and change of price movements. It helps the model detect overbought or oversold conditions and potential reversal points.'
  },
  {
    name: 'ATR (14)',
    description: 'The 14-period Average True Range, a volatility indicator that measures the average range between high and low prices over 14 periods. It helps the model understand market volatility and adjust expectations for price movement.'
  }
];

const educationTopics = [
  {
    title: "Why This Matters",
    content: (
      <div className="why-matters">
        <div className="importance-card">
          <h3>Understanding the Basics</h3>
          <p>Technical analysis and trading concepts form the foundation of successful market participation. Whether you're a beginner or experienced trader, having a solid grasp of these fundamentals is crucial for:</p>
          <ul>
            <li>Making informed trading decisions</li>
            <li>Understanding market movements and patterns</li>
            <li>Developing effective trading strategies</li>
            <li>Managing risk and identifying opportunities</li>
          </ul>
        </div>
        <div className="importance-card">
          <h3>Our Approach</h3>
          <p>We've designed this education center to provide you with:</p>
          <ul>
            <li>Clear, concise explanations of complex concepts</li>
            <li>Practical examples and visual aids</li>
            <li>Step-by-step guides for using our platform</li>
            <li>Essential knowledge for successful trading</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    title: "Using the Website",
    subSections: [
      {
        title: "Dashboard Overview",
        content: (
          <div>
            <p>The Dashboard provides a comprehensive overview of your trading activities and market insights.</p>
            <ul>
              <li>Quick access to your favorite stocks</li>
              <li>Market overview and key statistics</li>
              <li>Recent alerts and notifications</li>
              <li>Performance metrics and analysis</li>
            </ul>
          </div>
        )
      },
      {
        title: "Search Ticker",
        content: (
          <div>
            <p>The Search Ticker feature allows you to look up any stock symbol and view its detailed information.</p>
            <ul>
              <li>Enter any valid stock symbol (e.g., AAPL, MSFT)</li>
              <li>View real-time price data and charts</li>
              <li>Access historical data and analysis</li>
              <li>Set up alerts and notifications</li>
            </ul>
          </div>
        )
      },
      {
        title: "Technical Charts",
        content: (
          <div>
            <p>Our Technical Charts section provides advanced charting capabilities for detailed market analysis.</p>
            <ul>
              <li>Multiple chart types and timeframes</li>
              <li>Technical indicators and overlays</li>
              <li>Drawing tools and annotations</li>
              <li>Customizable chart settings</li>
            </ul>
          </div>
        )
      },
      {
        title: "Predictions",
        content: (
          <div>
            <p>The Predictions section uses advanced algorithms to provide market insights and forecasts.</p>
            <ul>
              <li>AI-powered market predictions</li>
              <li>Trend analysis and forecasting</li>
              <li>Risk assessment and probability metrics</li>
              <li>Historical prediction accuracy</li>
            </ul>
          </div>
        )
      },
      {
        title: "Strategy Tester",
        content: (
          <div>
            <p>Test and optimize your trading strategies using historical data and real-time market conditions.</p>
            <ul>
              <li>Backtest trading strategies</li>
              <li>Performance analytics</li>
              <li>Risk management tools</li>
              <li>Strategy optimization features</li>
            </ul>
          </div>
        )
      },
      {
        title: "News & Sentiment",
        content: (
          <div>
            <p>Stay informed with the latest market news and sentiment analysis.</p>
            <ul>
              <li>Real-time market news</li>
              <li>Social media sentiment analysis</li>
              <li>Market impact assessment</li>
              <li>Custom news filters</li>
            </ul>
          </div>
        )
      },
      {
        title: "Education Center",
        content: (
          <div>
            <p>Your comprehensive resource for learning about trading and market concepts.</p>
            <ul>
              <li>Interactive tutorials</li>
              <li>Market concept explanations</li>
              <li>Best practices and strategies</li>
              <li>Regular updates and new content</li>
            </ul>
          </div>
        )
      },
      {
        title: "Alerts",
        content: (
          <div>
            <p>Set up and manage custom alerts for price movements and market conditions.</p>
            <ul>
              <li>Price movement alerts</li>
              <li>Technical indicator alerts</li>
              <li>News and event alerts</li>
              <li>Custom alert conditions</li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    title: "Stock Market Concepts and Vocab",
    subSections: [
      {
        title: "Understanding Candlestick Charts",
        content: (
          <div>
            <p>Candlestick charts are a type of financial chart used to represent price movements of securities, derivatives, or currencies. They are essential tools for technical analysis because they provide more information than simple line charts.</p>
            
            <div className="candlestick-example">
              <div className="candlestick bullish">
                <div className="body"></div>
                <div className="wick"></div>
              </div>
              <div className="candlestick bearish">
                <div className="body"></div>
                <div className="wick"></div>
              </div>
            </div>

            <h4>Why Candlesticks Matter:</h4>
            <ul>
              <li>They show the relationship between opening and closing prices</li>
              <li>They reveal price volatility through their wicks</li>
              <li>They help identify market sentiment and potential reversals</li>
              <li>They form patterns that can predict future price movements</li>
            </ul>

            <h4>Timeframes Explained:</h4>
            <div className="timeframe-grid">
              <div className="timeframe">
                <h5>Intraday Timeframes</h5>
                <ul>
                  <li>1 Minute (1m)</li>
                  <li>5 Minutes (5m)</li>
                  <li>15 Minutes (15m)</li>
                  <li>30 Minutes (30m)</li>
                  <li>1 Hour (1h)</li>
                  <li>4 Hours (4h)</li>
                </ul>
                <p>Best for: Day trading and short-term analysis</p>
              </div>
              <div className="timeframe">
                <h5>Daily Timeframes</h5>
                <ul>
                  <li>Daily (1d)</li>
                  <li>Weekly (1w)</li>
                  <li>Monthly (1M)</li>
                </ul>
                <p>Best for: Long-term analysis and position trading</p>
              </div>
            </div>

            <div className="timeframe-comparison">
              <h4>How Timeframes Affect Analysis:</h4>
              <ul>
                <li><strong>Shorter Timeframes:</strong> Show more detail but more noise</li>
                <li><strong>Longer Timeframes:</strong> Show clearer trends but less detail</li>
                <li><strong>Multiple Timeframes:</strong> Using different timeframes together provides a more complete picture</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        title: "OHLC Data Explained",
        content: (
          <div>
            <p>OHLC stands for Open, High, Low, and Close - the four key price points for any given time period.</p>
            <ul>
              <li><strong>Open (O):</strong> The first trading price of the period</li>
              <li><strong>High (H):</strong> The highest price reached during the period</li>
              <li><strong>Low (L):</strong> The lowest price reached during the period</li>
              <li><strong>Close (C):</strong> The last trading price of the period</li>
            </ul>
            <p>These four values are essential for technical analysis and are used to create candlestick charts.</p>
          </div>
        )
      },
      {
        title: "Bullish vs Bearish",
        content: (
          <div>
            <div className="market-sentiment">
              <div className="sentiment bullish">
                <h4>Bullish</h4>
                <p>Indicates an upward trend or positive market sentiment</p>
                <ul>
                  <li>Prices are rising</li>
                  <li>Investors are optimistic</li>
                  <li>Market is expected to go up</li>
                  <li>Often represented by green/white candlesticks</li>
                </ul>
              </div>
              <div className="sentiment bearish">
                <h4>Bearish</h4>
                <p>Indicates a downward trend or negative market sentiment</p>
                <ul>
                  <li>Prices are falling</li>
                  <li>Investors are pessimistic</li>
                  <li>Market is expected to go down</li>
                  <li>Often represented by red/black candlesticks</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      {
        title: "Basic Trading Terms",
        content: (
          <div>
            <div className="terms-grid">
              <div className="term">
                <h4>Volume</h4>
                <p>The number of shares or contracts traded in a security or market during a given period.</p>
              </div>
              <div className="term">
                <h4>Liquidity</h4>
                <p>How easily an asset can be bought or sold without affecting its price.</p>
              </div>
              <div className="term">
                <h4>Volatility</h4>
                <p>The rate at which the price of a security increases or decreases for a given set of returns.</p>
              </div>
              <div className="term">
                <h4>Support</h4>
                <p>A price level where a downtrend can be expected to pause due to a concentration of demand.</p>
              </div>
              <div className="term">
                <h4>Resistance</h4>
                <p>A price level where an uptrend can be expected to pause due to a concentration of supply.</p>
              </div>
              <div className="term">
                <h4>Trend</h4>
                <p>The general direction in which a market or asset price is moving.</p>
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    title: "Understanding Features",
    content: (
      <div className="understanding-features-section">
        <h3 className="text-xl font-semibold mb-4">Understanding Features</h3>
        <p className="mb-2">
          In machine learning, a <strong>feature</strong> is a measurable property or characteristic of the data that the model uses to make predictions. Features can be as simple as a stock's closing price, or as complex as a technical indicator derived from multiple data points. The quality and relevance of features are key to building effective predictive models.
        </p>
        <p className="mb-2">
          A <strong>Feature Dictionary</strong> is a reference guide that explains each input variable (feature) used in a machine learning model. It helps users understand what data the model is using, why each feature matters, and how it's calculated. This transparency is crucial for both learning and trust in the model's predictions.
        </p>
        <p className="mb-4">
          The following 17 features are the current default set used in our app's machine learning model for stock prediction. They were chosen to capture a broad range of price action, momentum, trend, and volatility signals. As our platform evolves, we may add or customize features to further improve model performance.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-border rounded-lg bg-bg-panel">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left font-semibold bg-bg-main border-b border-border">Feature Name</th>
                <th className="px-4 py-2 text-left font-semibold bg-bg-main border-b border-border">In-Depth Description</th>
              </tr>
            </thead>
            <tbody>
              {featureDescriptions.map((feature) => (
                <tr key={feature.name}>
                  <td className="px-4 py-2 align-top font-medium border-b border-border text-text-main bg-bg-panel">{feature.name}</td>
                  <td className="px-4 py-2 align-top border-b border-border text-text-main bg-bg-panel">{feature.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  },
  {
    title: "Finance & Analysis Education",
    subSections: [
      {
        title: "Basic Technical Indicators",
        content: (
          <div>
            <p>Technical indicators are mathematical calculations based on price, volume, or other market data that help traders make decisions.</p>
            <div className="terms-grid">
              <div className="term">
                <h4>RSI (Relative Strength Index)</h4>
                <p>A momentum oscillator that measures the speed and change of price movements, typically used to identify overbought or oversold conditions.</p>
              </div>
              <div className="term">
                <h4>MACD (Moving Average Convergence Divergence)</h4>
                <p>A trend-following momentum indicator that shows the relationship between two moving averages of a security's price.</p>
              </div>
              <div className="term">
                <h4>Moving Averages</h4>
                <p>Technical indicators that smooth out price data by creating a constantly updated average price, helping identify trends.</p>
              </div>
            </div>
          </div>
        )
      },
      {
        title: "Fundamental vs Technical Analysis",
        content: (
          <div>
            <div className="market-sentiment">
              <div className="sentiment bullish">
                <h4>Fundamental Analysis</h4>
                <p>Analyzes a company's financial health and market position</p>
                <ul>
                  <li>Financial statements</li>
                  <li>Industry position</li>
                  <li>Management quality</li>
                  <li>Economic factors</li>
                </ul>
              </div>
              <div className="sentiment bearish">
                <h4>Technical Analysis</h4>
                <p>Studies price movements and market behavior</p>
                <ul>
                  <li>Price patterns</li>
                  <li>Volume analysis</li>
                  <li>Technical indicators</li>
                  <li>Market psychology</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
      {
        title: "Market Psychology & Emotions",
        content: (
          <div>
            <p>Understanding market psychology is crucial for successful trading. Here are key emotional factors that influence market behavior:</p>
            <div className="terms-grid">
              <div className="term">
                <h4>Fear</h4>
                <p>Can lead to panic selling and missed opportunities. Successful traders learn to manage fear through proper risk management.</p>
              </div>
              <div className="term">
                <h4>Greed</h4>
                <p>Often results in overtrading or holding positions too long. Setting clear profit targets helps manage greed.</p>
              </div>
              <div className="term">
                <h4>FOMO (Fear of Missing Out)</h4>
                <p>Can cause impulsive trading decisions. Having a clear trading plan helps avoid FOMO-driven trades.</p>
              </div>
            </div>
          </div>
        )
      }
    ]
  },
  {
    title: "Learning & Strategy",
    subSections: [
      {
        title: "Common Trading Strategies",
        content: (
          <div>
            <p>Different trading strategies suit different market conditions and trader personalities. Here are some popular approaches:</p>
            <div className="terms-grid">
              <div className="term">
                <h4>Scalping</h4>
                <p>Making numerous small trades to capture small price movements, typically holding positions for minutes or seconds.</p>
              </div>
              <div className="term">
                <h4>Swing Trading</h4>
                <p>Holding positions for several days to weeks, aiming to capture 'swings' in price momentum.</p>
              </div>
              <div className="term">
                <h4>Trend Following</h4>
                <p>Identifying and trading in the direction of the prevailing market trend, using technical indicators for confirmation.</p>
              </div>
            </div>
          </div>
        )
      },
      {
        title: "Backtesting & Risk Management",
        content: (
          <div>
            <div className="importance-card">
              <h3>Risk Management Fundamentals</h3>
              <ul>
                <li>Always use stop losses to limit potential losses</li>
                <li>Maintain proper position sizing (typically 1-2% of capital per trade)</li>
                <li>Understand and calculate risk/reward ratios before entering trades</li>
                <li>Monitor drawdowns to protect your trading capital</li>
              </ul>
            </div>
            <div className="importance-card">
              <h3>Backtesting Importance</h3>
              <ul>
                <li>Test strategies on historical data before live trading</li>
                <li>Identify potential flaws in trading approaches</li>
                <li>Optimize strategy parameters</li>
                <li>Build confidence in your trading system</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        title: "Glossary of Terms",
        content: (
          <div>
            <div className="terms-grid">
              <div className="term">
                <h4>Drawdown</h4>
                <p>The peak-to-trough decline during a specific period for an investment or trading account.</p>
              </div>
              <div className="term">
                <h4>Stop Loss</h4>
                <p>An order to sell a security when it reaches a certain price, limiting potential losses.</p>
              </div>
              <div className="term">
                <h4>Risk/Reward Ratio</h4>
                <p>The relationship between potential profit and potential loss in a trade.</p>
              </div>
              <div className="term">
                <h4>Position Sizing</h4>
                <p>The process of determining how much capital to risk on a particular trade.</p>
              </div>
              <div className="term">
                <h4>Backtesting</h4>
                <p>The process of testing a trading strategy using historical data to see how it would have performed.</p>
              </div>
              <div className="term">
                <h4>Technical Analysis</h4>
                <p>The study of price movements and patterns to predict future price action.</p>
              </div>
            </div>
          </div>
        )
      }
    ]
  }
];

const EducationCenter = () => {
  // For sticky TOC
  const tocRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [location]);

  return (
    <div className="education-center-page">
      <div className="education-center-header">
        <h2>Education Center</h2>
      </div>
      <div className="education-center-content-wrapper">
        <div className="education-center-main-content">
          {educationTopics.map((section, i) => (
            <div key={section.title} id={toSlug(section.title)} className="education-section">
              <h2>{section.title}</h2>
              {section.content && <div>{section.content}</div>}
              {section.subSections && section.subSections.map((sub, j) => (
                <div key={sub.title} id={toSlug(sub.title)} className="education-subsection">
                  <h3>{sub.title}</h3>
                  <div>{sub.content}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <nav className="education-center-toc" ref={tocRef}>
          <div className="toc-title">Contents</div>
          <ul>
            {educationTopics.map((section) => (
              <React.Fragment key={section.title}>
                <li>
                  <a href={`#${toSlug(section.title)}`}>{section.title}</a>
                </li>
                {section.subSections && (
                  <ul>
                    {section.subSections.map((sub) => (
                      <li key={sub.title} className="toc-subsection">
                        <a href={`#${toSlug(sub.title)}`}>{sub.title}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </React.Fragment>
            ))}
          </ul>
        </nav>
      </div>
      <button className="back-to-top-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        Back to Top
      </button>
    </div>
  );
};

export default EducationCenter; 
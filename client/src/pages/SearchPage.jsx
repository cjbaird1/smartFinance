import React, { useState } from "react";
import { Link } from "react-router-dom";
import CandlestickChart from "../components/CandlestickChart";
import Button from "../components/Button";
import "../styles/search-page.css";

const TIMEFRAMES = [
  { value: "1m", label: "1 Minute" },
  { value: "5m", label: "5 Minute" },
  { value: "15m", label: "15 Minute" },
  { value: "30m", label: "30 Minute" },
  { value: "1h", label: "1 Hour" },
  { value: "4h", label: "4 Hour" },
  { value: "1d", label: "Daily" },
  { value: "1w", label: "Weekly" },
  { value: "1M", label: "Monthly" },
];

const INDICATORS = [
  { label: "SMA 20", value: "sma20" },
  { label: "EMA 20", value: "ema20" },
  { label: "RSI 14", value: "rsi14" },
  { label: "MACD", value: "macd" },
  // Add more indicators here as needed
];

const SearchPage = () => {
  const [ticker, setTicker] = useState("");
  const [timeframe, setTimeframe] = useState("1d");
  const [nBars, setNBars] = useState("");
  const [nBarsError, setNBarsError] = useState("");
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [highlightAfterHours, setHighlightAfterHours] = useState(false);
  const [selectedIndicators, setSelectedIndicators] = useState([]);

  const fetchStockData = async (e) => {
    e.preventDefault();
    setError(null);
    setStockData(null);
    setLoading(true);
    setNBarsError("");
    if (!ticker) {
      setError("Please enter a ticker symbol.");
      setLoading(false);
      return;
    }
    if (!nBars) {
      setNBarsError("Please specify number of bars to lookback.");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:5000/api/stock?ticker=${ticker}&n_bars=${nBars}&interval=${timeframe}`
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unknown error");
      }
      setStockData(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <h2>Search a Ticker</h2>
      <form onSubmit={fetchStockData} className="search-form">
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          placeholder="Enter stock ticker (e.g. AAPL)"
          className="search-input"
        />
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="timeframe-select"
        >
          {TIMEFRAMES.map((tf) => (
            <option key={tf.value} value={tf.value}>
              {tf.label}
            </option>
          ))}
        </select>
        <div className="nbars-input-container">
          <input
            id="nBarsInput"
            type="number"
            value={nBars}
            onChange={(e) => {
              let val = e.target.value;
              if (val === "") {
                setNBars("");
                setNBarsError("");
                return;
              }
              val = parseInt(val, 10);
              if (isNaN(val) || val < 1) val = 1;
              if (val > 999) val = 999;
              setNBars(val);
              setNBarsError("");
            }}
            min={1}
            max={999}
            placeholder="Number of Bars (Max 999)"
            className={`nbars-input ${nBarsError ? 'error' : ''}`}
          />
          {nBarsError && (
            <span className="error-message">{nBarsError}</span>
          )}
        </div>
        <button
          type="submit"
          className="search-button"
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Data"}
        </button>
      </form>
      {error && (
        <div className="error-message" style={{ marginBottom: 24, fontWeight: 500 }}>
          {error}
        </div>
      )}
      {stockData && stockData.data && stockData.data.length > 0 && (
        <div className="chart-container">
          <h3 className="chart-header">
            {stockData.ticker} - Last {stockData.data.length} Bars
          </h3>
          <button
            onClick={() => setHighlightAfterHours((v) => !v)}
            className={`after-hours-button ${highlightAfterHours ? 'active' : ''}`}
          >
            {highlightAfterHours ? "Hide After Hours" : "Highlight After Hours"}
          </button>
          {/* Indicator Selector UI */}
          <div className="indicator-selector" style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
            {INDICATORS.map(ind => (
              <button
                key={ind.value}
                className={`indicator-btn${selectedIndicators.includes(ind.value) ? ' active' : ''}`}
                style={{
                  padding: '6px 18px',
                  borderRadius: 6,
                  border: '1px solid #aaa',
                  background: selectedIndicators.includes(ind.value) ? '#1976d2' : '#f4f4f4',
                  color: selectedIndicators.includes(ind.value) ? '#fff' : '#222',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedIndicators(prev =>
                  prev.includes(ind.value)
                    ? prev.filter(v => v !== ind.value)
                    : [...prev, ind.value]
                )}
              >
                {ind.label}
              </button>
            ))}
          </div>
          <div className="indicator-education-link">
            <Link to="/education#basic-technical-indicators">
              What are these indicators? Learn more.
            </Link>
          </div>
          <div className="chart-wrapper">
            <CandlestickChart data={stockData.data} highlightAfterHours={highlightAfterHours} indicators={selectedIndicators} />
          </div>
          {/* Debug: Show raw data as JSON */}
          <pre style={{ 
            background: "#f4f4f4", 
            padding: "1em", 
            marginTop: "2em", 
            maxHeight: 300, 
            overflow: "auto", 
            fontSize: 12 
          }}>
            {JSON.stringify(stockData.data, null, 2)}
          </pre>
          {/* Debug: Show data as a table */}
          <div style={{ overflowX: "auto", marginTop: 20 }}>
            <table border="1" cellPadding="4" style={{ fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {Object.keys(stockData.data[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stockData.data.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage; 
import React, { useState, useRef } from 'react';
import CandlestickChart from '../components/CandlestickChart';
import ChartToolbar from '../components/ChartToolbar';
import '../styles/trade-simulator-page.css';

const TIMEFRAMES = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minute' },
  { value: '15m', label: '15 Minute' },
  { value: '30m', label: '30 Minute' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hour' },
  { value: '1d', label: 'Daily' },
  { value: '1w', label: 'Weekly' },
  { value: '1M', label: 'Monthly' },
];

const TradeSimulatorPage = () => {
  const [ticker, setTicker] = useState("");
  const [timeframe, setTimeframe] = useState("1d");
  const [nBars, setNBars] = useState("");
  const [nBarsError, setNBarsError] = useState("");
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleBars, setVisibleBars] = useState(1);
  const [speed, setSpeed] = useState(2); // 1: Slow, 2: Medium, 3: Fast
  const [isPlaying, setIsPlaying] = useState(false);
  const playInterval = useRef(null);

  // Play/Pause logic
  React.useEffect(() => {
    if (isPlaying && stockData && stockData.data && visibleBars < stockData.data.length) {
      let interval = 1000;
      if (speed === 1) interval = 2000;
      if (speed === 3) interval = 400;
      playInterval.current = setInterval(() => {
        setVisibleBars(v => {
          if (v < stockData.data.length) return v + 1;
          setIsPlaying(false);
          return v;
        });
      }, interval);
      return () => clearInterval(playInterval.current);
    } else {
      clearInterval(playInterval.current);
    }
  }, [isPlaying, speed, stockData, visibleBars]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else if (stockData && visibleBars < stockData.data.length) {
      setIsPlaying(true);
    }
  };

  const handleStep = () => {
    setVisibleBars(v => Math.min(v + 1, stockData.data.length));
    setIsPlaying(false);
  };

  // Reset visibleBars when new data is fetched
  React.useEffect(() => {
    if (stockData && stockData.data && stockData.data.length > 0) {
      setVisibleBars(1);
      setIsPlaying(false);
    }
  }, [stockData]);

  const currentTimeframeLabel = TIMEFRAMES.find(tf => tf.value === timeframe)?.label || timeframe;

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
    <div className="trade-simulator-page">
      <h2>Trade Simulator</h2>
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
      {/* Main content row: chart and order entry panel */}
      <div className="simulator-main-row">
        <div className="chart-section">
          {/* Chart Toolbar above chart */}
          {stockData && stockData.data && stockData.data.length > 0 && (
            <ChartToolbar
              speed={speed}
              setSpeed={setSpeed}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onStep={handleStep}
              currentTimeframe={currentTimeframeLabel}
            />
          )}
          {stockData && stockData.data && stockData.data.length > 0 ? (
            <CandlestickChart data={stockData.data.slice(0, visibleBars)} />
          ) : (
            <div className="chart-placeholder">Chart will appear here after you select a ticker.</div>
          )}
        </div>
        <div className="order-entry-panel">
          <h3>Order Entry</h3>
          {/* Placeholder for order entry form */}
          <div style={{ color: '#888', fontSize: 15 }}>Order form goes here</div>
        </div>
      </div>
      {/* Metrics Bar below chart */}
      <div className="metrics-bar">
        <div>Active P/L: $0.00</div>
        <div>Trades: 0</div>
        <div>Win Rate: 0%</div>
        <div>Avg. R/R: 0.00</div>
      </div>
      {/* Order table below chart and metrics */}
      <div className="orders-table-section">
        <h3>Orders</h3>
        {/* Placeholder for order table */}
        <div style={{ color: '#888', fontSize: 15 }}>Order table will be shown here</div>
      </div>
    </div>
  );
};

export default TradeSimulatorPage; 


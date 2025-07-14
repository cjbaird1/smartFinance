import React, { useState } from "react";
import { Link } from "react-router-dom";
import CandlestickChart from "../components/CandlestickChart";
import LightweightCandlestickChart from "../components/LightweightCandlestickChart";
import LineChart from "../components/LineChart";
import Button from "../components/Button";
import Tooltip from "../components/Tooltip";
import Snackbar from "../components/Snackbar";
import ValidatedInput from "../components/ValidatedInput";
import { useTickerValidation } from "../hooks/useTickerValidation";
import "../styles/search-page.css";
import "../styles/error-system.css";

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
  const [chartType, setChartType] = useState("candlestick");
  const [showControlsPanel, setShowControlsPanel] = useState(false);
  const [smaPeriod, setSmaPeriod] = useState(20);
  const [emaPeriod, setEmaPeriod] = useState(20);
  const [editingSma, setEditingSma] = useState(false);
  const [editingEma, setEditingEma] = useState(false);
  const [smaInput, setSmaInput] = useState(smaPeriod);
  const [emaInput, setEmaInput] = useState(emaPeriod);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Use the custom hook for ticker validation
  const { tickerError, validateTicker, handleTickerError, clearTickerError } = useTickerValidation();

  const fetchStockData = async (e) => {
    e.preventDefault();
    setError(null);
    setStockData(null);
    setLoading(true);
    setNBarsError("");
    clearTickerError();
    
    // Validate ticker using the custom hook
    if (!validateTicker(ticker)) {
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
        const tickerErrorMsg = handleTickerError(data.error, ticker);
        if (tickerErrorMsg) {
          throw new Error(tickerErrorMsg);
        }
        setError(data.error || "Unknown error");
        throw new Error(data.error || "Unknown error");
      }
      
      if (!data.data || data.data.length === 0) {
        const msg = `No Data Found for ticker symbol: "${ticker}"`;
        handleTickerError(msg, ticker);
        return;
      }
      
      setStockData(data);
    } catch (err) {
      if (!err.message.includes(`No Data Found for ticker symbol: "${ticker}"`)) {
        setError(err.message);
      }
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTickerChange = (e) => {
    // Only allow uppercase letters and numbers
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setTicker(val);
    clearTickerError();
  };

  return (
    <div className="search-page bg-bg-main min-h-screen w-full text-text-main">
      <h2 className="mb-6 text-text-main text-2xl font-semibold">Search a Ticker</h2>
      <form onSubmit={fetchStockData} className="search-form flex gap-4 items-start mb-8 bg-bg-panel p-6 rounded-radius shadow-shadow flex-wrap">
        <ValidatedInput
          type="text"
          value={ticker}
          onChange={handleTickerChange}
          placeholder="Enter stock ticker (e.g. AAPL)"
          error={tickerError}
        />
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="timeframe-select px-4 py-2 bg-bg-main text-text-main border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {TIMEFRAMES.map((tf) => (
            <option key={tf.value} value={tf.value}>
              {tf.label}
            </option>
          ))}
        </select>
        <div className="nbars-input-container flex flex-col flex-shrink-0">
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
            className={`nbars-input px-4 py-2 text-base border rounded-lg w-60 bg-bg-main text-text-main border-border focus:outline-none focus:ring-2 focus:ring-accent ${nBarsError ? 'border-error' : ''}`}
          />
          {nBarsError && (
            <span className="error-message text-error text-sm mt-1">{nBarsError}</span>
          )}
        </div>
        <button
          type="submit"
          className="search-button px-6 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Data"}
        </button>
      </form>
      <Snackbar
        message={error || ''}
        open={snackbarOpen && !!error}
        onClose={() => setSnackbarOpen(false)}
        type="error"
      />
      {stockData && stockData.data && stockData.data.length > 0 && (
        <div className="chart-duo-container flex gap-8 mb-6 flex-wrap">
          <div className="chart-duo-item flex-1 min-w-80 max-w-1/2 flex flex-col">
            {chartType === "candlestick" ? (
              <CandlestickChart data={stockData.data} highlightAfterHours={highlightAfterHours} indicators={selectedIndicators} />
            ) : (
              <LineChart data={stockData.data} indicators={selectedIndicators} />
            )}
          </div>
          <div className="chart-duo-item flex-1 min-w-80 max-w-1/2 flex flex-col">
            <LightweightCandlestickChart data={stockData.data.map(d => ({
              ...d,
              time: typeof d.time === 'number'
                ? d.time
                : Math.floor(new Date(d.time || d.datetime || d.date || d.timestamp).getTime() / 1000),
            }))} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage; 
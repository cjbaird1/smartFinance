import React, { useState } from "react";
import { Link } from "react-router-dom";
import CandlestickChart from "../components/CandlestickChart";
import LineChart from "../components/LineChart";
import Button from "../components/Button";
import Tooltip from "../components/Tooltip";
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
  const [chartType, setChartType] = useState("candlestick");
  const [showControlsPanel, setShowControlsPanel] = useState(false);
  const [smaPeriod, setSmaPeriod] = useState(20);
  const [emaPeriod, setEmaPeriod] = useState(20);
  const [editingSma, setEditingSma] = useState(false);
  const [editingEma, setEditingEma] = useState(false);
  const [smaInput, setSmaInput] = useState(smaPeriod);
  const [emaInput, setEmaInput] = useState(emaPeriod);

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
        <div className="chart-container" style={{ position: 'relative' }}>
          {/* Floating Controls Button - now above the title */}
          <button
            className="floating-controls-btn"
            onClick={() => setShowControlsPanel((v) => !v)}
            style={{ position: 'absolute', top: 18, left: 18, zIndex: 20 }}
            aria-label="Show chart controls"
          >
            &#9881;
          </button>
          <h3 className="chart-header" style={{ marginLeft: 60 }}>
            {stockData.ticker} - Last {stockData.data.length} Bars
          </h3>
          {/* Collapsible Controls Panel */}
          {showControlsPanel && (
            <div className="floating-controls-panel" style={{ position: 'absolute', top: 60, left: 18, zIndex: 30, background: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(44,62,80,0.18)', padding: 24, minWidth: 220, maxWidth: 320 }}>
              <button
                style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
                onClick={() => setShowControlsPanel(false)}
                aria-label="Close controls panel"
              >
                ×
              </button>
              <div className="chart-type-selector" style={{ marginBottom: 16 }}>
                <button
                  className={chartType === "candlestick" ? "active" : ""}
                  onClick={() => setChartType("candlestick")}
                >
                  Candlestick
                </button>
                <button
                  className={chartType === "line" ? "active" : ""}
                  onClick={() => setChartType("line")}
                >
                  Line
                </button>
              </div>
          <button
            onClick={() => setHighlightAfterHours((v) => !v)}
            className={`after-hours-button ${highlightAfterHours ? 'active' : ''}`}
                style={{ margin: '16px 0' }}
          >
            {highlightAfterHours ? "Hide After Hours" : "Highlight After Hours"}
          </button>
              <div className="indicator-selector" style={{ display: 'flex', flexDirection: 'column', gap: 10, margin: '16px 0' }}>
                {/* SMA Button with editable period */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    className={`indicator-btn${selectedIndicators.includes('sma20') ? ' active' : ''}`}
                    style={{
                      padding: '6px 18px',
                      borderRadius: 6,
                      border: '1px solid #aaa',
                      background: selectedIndicators.includes('sma20') ? '#1976d2' : '#f4f4f4',
                      color: selectedIndicators.includes('sma20') ? '#fff' : '#222',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setSelectedIndicators(prev =>
                      prev.includes('sma20')
                        ? prev.filter(v => v !== 'sma20')
                        : [...prev, 'sma20']
                    )}
                  >
                    {`SMA ${smaPeriod}`}
                  </button>
                  <Tooltip content="Edit the period for this indicator.">
                    <span
                      style={{ cursor: 'pointer', color: '#888', fontSize: 16 }}
                      onClick={() => { setEditingSma(true); setSmaInput(smaPeriod); }}
                    >&#9881;</span>
                  </Tooltip>
                  {editingSma && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 4 }}>
                      <input
                        type="number"
                        min={2}
                        max={200}
                        value={smaInput}
                        onChange={e => setSmaInput(e.target.value.replace(/[^0-9]/g, ''))}
                        style={{ width: 48, fontSize: 14, padding: '2px 6px', borderRadius: 4, border: '1px solid #aaa' }}
                      />
                      <button
                        style={{ marginLeft: 2, fontSize: 16, cursor: 'pointer', background: 'none', border: 'none', color: '#1976d2' }}
                        onClick={() => {
                          const val = parseInt(smaInput, 10);
                          if (!isNaN(val) && val >= 2 && val <= 200) {
                            setSmaPeriod(val);
                            setEditingSma(false);
                          }
                        }}
                        title="Confirm SMA period"
                      >✔️</button>
                      <button
                        style={{ marginLeft: 2, fontSize: 16, cursor: 'pointer', background: 'none', border: 'none', color: '#ef5350' }}
                        onClick={() => setEditingSma(false)}
                        title="Cancel"
                      >✖️</button>
                    </span>
                  )}
                </div>
                {/* EMA Button with editable period */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    className={`indicator-btn${selectedIndicators.includes('ema20') ? ' active' : ''}`}
                    style={{
                      padding: '6px 18px',
                      borderRadius: 6,
                      border: '1px solid #aaa',
                      background: selectedIndicators.includes('ema20') ? '#1976d2' : '#f4f4f4',
                      color: selectedIndicators.includes('ema20') ? '#fff' : '#222',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setSelectedIndicators(prev =>
                      prev.includes('ema20')
                        ? prev.filter(v => v !== 'ema20')
                        : [...prev, 'ema20']
                    )}
                  >
                    {`EMA ${emaPeriod}`}
                  </button>
                  <Tooltip content="Edit the period for this indicator.">
                    <span
                      style={{ cursor: 'pointer', color: '#888', fontSize: 16 }}
                      onClick={() => { setEditingEma(true); setEmaInput(emaPeriod); }}
                    >&#9881;</span>
                  </Tooltip>
                  {editingEma && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2, marginLeft: 4 }}>
                      <input
                        type="number"
                        min={2}
                        max={200}
                        value={emaInput}
                        onChange={e => setEmaInput(e.target.value.replace(/[^0-9]/g, ''))}
                        style={{ width: 48, fontSize: 14, padding: '2px 6px', borderRadius: 4, border: '1px solid #aaa' }}
                      />
                      <button
                        style={{ marginLeft: 2, fontSize: 16, cursor: 'pointer', background: 'none', border: 'none', color: '#1976d2' }}
                        onClick={() => {
                          const val = parseInt(emaInput, 10);
                          if (!isNaN(val) && val >= 2 && val <= 200) {
                            setEmaPeriod(val);
                            setEditingEma(false);
                          }
                        }}
                        title="Confirm EMA period"
                      >✔️</button>
                      <button
                        style={{ marginLeft: 2, fontSize: 16, cursor: 'pointer', background: 'none', border: 'none', color: '#ef5350' }}
                        onClick={() => setEditingEma(false)}
                        title="Cancel"
                      >✖️</button>
                    </span>
                  )}
                </div>
                {/* RSI and MACD buttons as before, each on their own line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    key="rsi14"
                    className={`indicator-btn${selectedIndicators.includes('rsi14') ? ' active' : ''}`}
                    style={{
                      padding: '6px 18px',
                      borderRadius: 6,
                      border: '1px solid #aaa',
                      background: selectedIndicators.includes('rsi14') ? '#1976d2' : '#f4f4f4',
                      color: selectedIndicators.includes('rsi14') ? '#fff' : '#222',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onClick={() => setSelectedIndicators(prev =>
                      prev.includes('rsi14')
                        ? prev.filter(v => v !== 'rsi14')
                        : [...prev, 'rsi14']
                    )}
                  >
                    RSI 14
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                    key="macd"
                    className={`indicator-btn${selectedIndicators.includes('macd') ? ' active' : ''}`}
                style={{
                  padding: '6px 18px',
                  borderRadius: 6,
                  border: '1px solid #aaa',
                      background: selectedIndicators.includes('macd') ? '#1976d2' : '#f4f4f4',
                      color: selectedIndicators.includes('macd') ? '#fff' : '#222',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setSelectedIndicators(prev =>
                      prev.includes('macd')
                        ? prev.filter(v => v !== 'macd')
                        : [...prev, 'macd']
                    )}
                  >
                    MACD
              </button>
                </div>
          </div>
              <div className="indicator-education-link" style={{ marginTop: 12 }}>
            <Link to="/education#basic-technical-indicators">
              What are these indicators? Learn more.
            </Link>
          </div>
            </div>
          )}
          <div className="chart-wrapper">
            {chartType === "candlestick" ? (
            <CandlestickChart data={stockData.data} highlightAfterHours={highlightAfterHours} indicators={selectedIndicators} smaPeriod={smaPeriod} emaPeriod={emaPeriod} />
            ) : (
              <LineChart data={stockData.data} indicators={selectedIndicators} />
            )}
          </div>
          {/* Debug: Show raw data as JSON */}
          {false && (
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
          )}
          {/* Debug: Show data as a table */}
          {false && (
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
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage; 
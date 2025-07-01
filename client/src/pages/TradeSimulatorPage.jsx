import React, { useState, useRef } from 'react';
import LightweightCandlestickChart from '../components/LightweightCandlestickChart';
import ChartToolbar from '../components/ChartToolbar';
import ChartSidebar from '../components/ChartSidebar';
import Snackbar from '../components/Snackbar';
import ValidatedInput from '../components/ValidatedInput';
import { useTickerValidation } from '../hooks/useTickerValidation';
import '../styles/trade-simulator-page.css';
import '../styles/error-system.css';

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

// Default chart settings
const defaultChartSettings = {
  showBody: true,
  showBorders: true,
  showWick: true,
  bodyUp: '#26a69a',
  bodyDown: '#ef5350',
  bordersUp: '#26a69a',
  bordersDown: '#ef5350',
  wickUp: '#26a69a',
  wickDown: '#ef5350',
  precision: 'default',
  timezone: 'UTC',
};

// Custom hook for draggable modal
function useDraggableModal(initial = { x: 0, y: 0 }) {
  const [position, setPosition] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const mouseStart = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    setDragging(true);
    dragStart.current = { ...position };
    mouseStart.current = { x: e.clientX, y: e.clientY };
    document.body.style.userSelect = 'none';
  };

  React.useEffect(() => {
    if (!dragging) return;
    const onMouseMove = (e) => {
      const dx = e.clientX - mouseStart.current.x;
      const dy = e.clientY - mouseStart.current.y;
      setPosition({ x: dragStart.current.x + dx, y: dragStart.current.y + dy });
    };
    const onMouseUp = () => {
      setDragging(false);
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging]);

  return { position, onMouseDown };
}

const TradeSimulatorPage = () => {
  const [ticker, setTicker] = useState("");
  const [timeframe, setTimeframe] = useState("1d");
  const [nBars, setNBars] = useState("");
  const [nBarsError, setNBarsError] = useState("");
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [visibleBars, setVisibleBars] = useState(1);
  const [speed, setSpeed] = useState(5); // 1 (slowest) to 15 (fastest)
  const [isPlaying, setIsPlaying] = useState(false);
  const [chartSettings, setChartSettings] = useState(defaultChartSettings);
  const playInterval = useRef(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const buyModalDrag = useDraggableModal({ x: 0, y: 0 });
  const sellModalDrag = useDraggableModal({ x: 0, y: 0 });

  // Unified order form state for both modals
  const [orderSide, setOrderSide] = useState("Buy");
  const [orderType, setOrderType] = useState("Limit");
  const [positionSize, setPositionSize] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');

  // Error states for form validation
  const [positionSizeError, setPositionSizeError] = useState("");
  const [entryPriceError, setEntryPriceError] = useState("");
  const [takeProfitError, setTakeProfitError] = useState("");
  const [stopLossError, setStopLossError] = useState("");

  // Active position and P&L state
  const [activePosition, setActivePosition] = useState(null);
  const [activePL, setActivePL] = useState(0);

  // Trading history and total P&L state
  const [totalPL, setTotalPL] = useState(10000); // Starting with $10,000 change this later to allow user to pick starting val
  const [tradeHistory, setTradeHistory] = useState([]);
  const [totalTrades, setTotalTrades] = useState(0);

  // Pending orders state
  const [pendingOrders, setPendingOrders] = useState([]);

  // Snackbar notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success'
  });

  // Use the custom hook for ticker validation
  const { tickerError, validateTicker, handleTickerError, clearTickerError } = useTickerValidation();

  // Helper function to get current closing price
  const getCurrentClosingPrice = () => {
    if (!stockData || !stockData.data || stockData.data.length === 0 || visibleBars === 0) {
      return 0;
    }
    const currentIndex = Math.min(visibleBars - 1, stockData.data.length - 1);
    return parseFloat(stockData.data[currentIndex].close);
  };

  // Helper function to get current candlestick data
  const getCurrentCandlestick = () => {
    if (!stockData || !stockData.data || stockData.data.length === 0 || visibleBars === 0) {
      return null;
    }
    const currentIndex = Math.min(visibleBars - 1, stockData.data.length - 1);
    return stockData.data[currentIndex];
  };

  // Helper function to check if an order should be filled
  const shouldOrderBeFilled = (order, candlestick) => {
    if (!candlestick) return false;
    
    const high = parseFloat(candlestick.high);
    const low = parseFloat(candlestick.low);
    const limitPrice = parseFloat(order.entryPrice);
    
    if (order.side === "Buy") {
      // Buy order is filled if price goes down to or below the limit price
      return low <= limitPrice;
    } else {
      // Sell order is filled if price goes up to or above the limit price
      return high >= limitPrice;
    }
  };

  // Calculate win rate from trade history
  const calculateWinRate = () => {
    if (tradeHistory.length === 0) return 0;
    const winningTrades = tradeHistory.filter(trade => trade.finalPL > 0).length;
    return (winningTrades / tradeHistory.length) * 100;
  };

  // Calculate P&L based on current position and price
  const calculatePL = (position, currentPrice) => {
    if (!position) return 0;
    
    const priceDifference = currentPrice - position.entryPrice;
    const pl = position.side === "Buy" ? priceDifference : -priceDifference;
    return pl * position.size;
  };

  // Calculate average R/R (Reward/Risk) from trade history
  const calculateAverageRR = () => {
    if (tradeHistory.length === 0) return '0.00';
    const totalReward = tradeHistory
      .filter(trade => trade.finalPL > 0)
      .reduce((sum, trade) => sum + trade.finalPL, 0);
    const totalRisk = tradeHistory
      .filter(trade => trade.finalPL < 0)
      .reduce((sum, trade) => sum + Math.abs(trade.finalPL), 0);
    if (totalRisk === 0) {
      // No losing trades, so R/R is infinite or undefined
      return totalReward > 0 ? 'N/A' : '0.00';
    }
    return (totalReward / totalRisk).toFixed(2);
  };

  // Update P&L when visible bars change (new candlestick)
  React.useEffect(() => {
    if (activePosition && stockData && stockData.data && stockData.data.length > 0) {
      const currentPrice = getCurrentClosingPrice();
      const newPL = calculatePL(activePosition, currentPrice);
      setActivePL(newPL);

      // Check for take profit and stop loss hits
      const high = parseFloat(getCurrentCandlestick()?.high || currentPrice);
      const low = parseFloat(getCurrentCandlestick()?.low || currentPrice);
      
      let shouldClosePosition = false;
      let closeReason = '';

      if (activePosition.takeProfit > 0) {
        if (activePosition.side === "Buy" && high >= activePosition.takeProfit) {
          shouldClosePosition = true;
          closeReason = "Take Profit";
        } else if (activePosition.side === "Sell" && low <= activePosition.takeProfit) {
          shouldClosePosition = true;
          closeReason = "Take Profit";
        }
      }

      if (activePosition.stopLoss > 0) {
        if (activePosition.side === "Buy" && low <= activePosition.stopLoss) {
          shouldClosePosition = true;
          closeReason = "Stop Loss";
        } else if (activePosition.side === "Sell" && high >= activePosition.stopLoss) {
          shouldClosePosition = true;
          closeReason = "Stop Loss";
        }
      }

      if (shouldClosePosition) {
        const finalPL = calculatePL(activePosition, activePosition.side === "Buy" ? 
          (closeReason === "Take Profit" ? activePosition.takeProfit : activePosition.stopLoss) :
          (closeReason === "Take Profit" ? activePosition.takeProfit : activePosition.stopLoss));
        
        const plText = finalPL >= 0 ? `+$${finalPL.toFixed(2)}` : `-$${Math.abs(finalPL).toFixed(2)}`;
        
        // Add to trade history
        const tradeRecord = {
          id: Date.now(),
          side: activePosition.side,
          size: activePosition.size,
          entryPrice: activePosition.entryPrice,
          exitPrice: closeReason === "Take Profit" ? activePosition.takeProfit : activePosition.stopLoss,
          finalPL: finalPL,
          closeReason: closeReason,
          timestamp: new Date().toISOString()
        };
        
        setTradeHistory(prev => [...prev, tradeRecord]);
        setTotalPL(prev => prev + finalPL);
        setTotalTrades(prev => prev + 1);
        setActivePosition(null);
        setActivePL(0);
        
        showSnackbar(`${closeReason} triggered - Position closed with ${plText} P&L`, finalPL >= 0 ? 'success' : 'error');
      }
    }
  }, [visibleBars, activePosition, stockData]);

  // Update entry price for market orders when current price changes
  React.useEffect(() => {
    if (orderType === "Market" && (showBuyModal || showSellModal)) {
      const currentPrice = getCurrentClosingPrice();
      if (currentPrice > 0) {
        setEntryPrice(currentPrice.toFixed(2));
      }
    }
  }, [visibleBars, orderType, showBuyModal, showSellModal, stockData]);

  // Execute pending orders when new candlestick appears
  React.useEffect(() => {
    if (visibleBars > 1 && pendingOrders.length > 0 && stockData && stockData.data) {
      const currentCandlestick = getCurrentCandlestick();
      if (!currentCandlestick) return;

      const ordersToExecute = pendingOrders.filter(order => shouldOrderBeFilled(order, currentCandlestick));
      
      ordersToExecute.forEach(order => {
        executeOrder(order, currentCandlestick);
      });
      
      // Remove executed orders from pending list
      setPendingOrders(prev => prev.filter(order => !shouldOrderBeFilled(order, currentCandlestick)));
    }
  }, [visibleBars, pendingOrders, stockData]);

  const executeOrder = (order, candlestick) => {
    const executionPrice = parseFloat(order.entryPrice);
    const newPosition = {
      side: order.side,
      size: order.size,
      entryPrice: executionPrice,
      takeProfit: parseFloat(order.takeProfit) || 0,
      stopLoss: parseFloat(order.stopLoss) || 0,
      timestamp: new Date().toISOString()
    };
    
    setActivePosition(newPosition);
    setActivePL(0);
    
    showSnackbar(`${order.side} order executed at $${executionPrice.toFixed(2)}`, 'success');
  };

  const cancelPendingOrder = (orderId) => {
    setPendingOrders(prev => prev.filter(order => order.id !== orderId));
    showSnackbar('Pending order cancelled', 'success');
  };

  const handlePlaceOrder = () => {
    // Reset errors
    setPositionSizeError("");
    setEntryPriceError("");
    setTakeProfitError("");
    setStopLossError("");

    // Validate inputs
    const parsedPositionSize = parseFloat(positionSize);
    const parsedEntryPrice = parseFloat(entryPrice);
    const parsedTakeProfit = parseFloat(takeProfit);
    const parsedStopLoss = parseFloat(stopLoss);

    let hasErrors = false;

    if (isNaN(parsedPositionSize) || parsedPositionSize <= 0) {
      setPositionSizeError("Position Size must be a positive number.");
      hasErrors = true;
    }

    if (isNaN(parsedEntryPrice) || parsedEntryPrice <= 0) {
      setEntryPriceError("Entry Price must be a positive number.");
      hasErrors = true;
    }

    // Validate take profit and stop loss based on order side
    if (parsedTakeProfit > 0 && parsedStopLoss > 0 && !hasErrors) {
      if (orderSide === "Buy") {
        if (parsedTakeProfit <= parsedEntryPrice) {
          setTakeProfitError("Take Profit must be above entry price for Buy orders.");
          hasErrors = true;
        }
        if (parsedStopLoss >= parsedEntryPrice) {
          setStopLossError("Stop Loss must be below entry price for Buy orders.");
          hasErrors = true;
        }
      } else {
        if (parsedTakeProfit >= parsedEntryPrice) {
          setTakeProfitError("Take Profit must be below entry price for Sell orders.");
          hasErrors = true;
        }
        if (parsedStopLoss <= parsedEntryPrice) {
          setStopLossError("Stop Loss must be above entry price for Sell orders.");
          hasErrors = true;
        }
      }
    }

    // Don't proceed if there are validation errors
    if (hasErrors) {
      return;
    }

    // Create the order
    const order = {
      id: Date.now(),
      side: orderSide,
      type: orderType,
      size: parsedPositionSize,
      entryPrice: parsedEntryPrice,
      takeProfit: parsedTakeProfit,
      stopLoss: parsedStopLoss,
      timestamp: new Date().toISOString()
    };

    if (orderType === "Market") {
      // Execute market order immediately
      const currentPrice = getCurrentClosingPrice();
      if (currentPrice > 0) {
        const executedOrder = { ...order, entryPrice: currentPrice };
        executeOrder(executedOrder, getCurrentCandlestick());
      } else {
        showSnackbar('Cannot execute market order - no current price available', 'error');
        return;
      }
    } else {
      // Add limit order to pending orders
      setPendingOrders(prev => [...prev, order]);
      showSnackbar(`${orderSide} limit order placed at $${parsedEntryPrice.toFixed(2)}`, 'success');
    }

    // Reset form
    setPositionSize('');
    setEntryPrice('');
    setTakeProfit('');
    setStopLoss('');
    setShowBuyModal(false);
    setShowSellModal(false);
  };

  const handleClosePosition = () => {
    if (!activePosition) return;

    const currentPrice = getCurrentClosingPrice();
    const finalPL = calculatePL(activePosition, currentPrice);
    const plText = finalPL >= 0 ? `+$${finalPL.toFixed(2)}` : `-$${Math.abs(finalPL).toFixed(2)}`;

    // Add to trade history
    const tradeRecord = {
      id: Date.now(),
      side: activePosition.side,
      size: activePosition.size,
      entryPrice: activePosition.entryPrice,
      exitPrice: currentPrice,
      finalPL: finalPL,
      closeReason: 'Manual Close',
      timestamp: new Date().toISOString()
    };

    setTradeHistory(prev => [...prev, tradeRecord]);
    setTotalPL(prev => prev + finalPL);
    setTotalTrades(prev => prev + 1);
    setActivePosition(null);
    setActivePL(0);

    showSnackbar(`Position closed with ${plText} P&L`, finalPL >= 0 ? 'success' : 'error');
  };

  const handleOrderSideChange = (newSide) => {
    setOrderSide(newSide);
  };

  const handleOrderTypeChange = (newType) => {
    setOrderType(newType);
    if (newType === "Market") {
      const currentPrice = getCurrentClosingPrice();
      if (currentPrice > 0) {
        setEntryPrice(currentPrice.toFixed(2));
      }
    }
  };

  const handlePositionSizeChange = (value) => {
    setPositionSize(value);
    setPositionSizeError("");
  };

  const handleEntryPriceChange = (value) => {
    setEntryPrice(value);
    setEntryPriceError("");
  };

  const handleTakeProfitChange = (value) => {
    setTakeProfit(value);
    setTakeProfitError("");
  };

  const handleStopLossChange = (value) => {
    setStopLoss(value);
    setStopLossError("");
  };

  const handleCloseBuyModal = () => {
    setShowBuyModal(false);
    setPositionSizeError("");
    setEntryPriceError("");
    setTakeProfitError("");
    setStopLossError("");
    setPositionSize('');
    setEntryPrice('');
    setTakeProfit('');
    setStopLoss('');
  };

  const handleCloseSellModal = () => {
    setShowSellModal(false);
    setPositionSizeError("");
    setEntryPriceError("");
    setTakeProfitError("");
    setStopLossError("");
    setPositionSize('');
    setEntryPrice('');
    setTakeProfit('');
    setStopLoss('');
  };

  const handleOpenBuyModal = () => {
    setOrderSide("Buy");
    setShowBuyModal(true);
    setPositionSizeError("");
    setEntryPriceError("");
    setTakeProfitError("");
    setStopLossError("");
    // Set entry price for market orders
    if (orderType === "Market") {
      const currentPrice = getCurrentClosingPrice();
      if (currentPrice > 0) {
        setEntryPrice(currentPrice.toFixed(2));
      }
    }
  };

  const handleOpenSellModal = () => {
    setOrderSide("Sell");
    setShowSellModal(true);
    setPositionSizeError("");
    setEntryPriceError("");
    setTakeProfitError("");
    setStopLossError("");
    // Set entry price for market orders
    if (orderType === "Market") {
      const currentPrice = getCurrentClosingPrice();
      if (currentPrice > 0) {
        setEntryPrice(currentPrice.toFixed(2));
      }
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (playInterval.current) {
        clearInterval(playInterval.current);
        playInterval.current = null;
      }
    } else {
      setIsPlaying(true);
      playInterval.current = setInterval(() => {
        setVisibleBars(prev => Math.min(prev + 1, stockData?.data?.length || 1));
      }, 1000 / speed);
    }
  };

  const handleStep = () => {
    setVisibleBars(prev => Math.min(prev + 1, stockData?.data?.length || 1));
  };

  const handleStepBack = () => {
    setVisibleBars(prev => Math.max(prev - 1, 1));
  };

  const fetchStockData = async (e) => {
    if (e) e.preventDefault();
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
      setVisibleBars(1);
    } catch (err) {
      if (!err.message.includes(`No Data Found for ticker symbol: "${ticker}"`)) {
        setError(err.message);
      }
      console.error('Error fetching stock data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to show snackbar notifications
  const showSnackbar = (message, type = 'success') => {
    setSnackbar({
      open: true,
      message,
      type
    });
  };

  // Helper function to close snackbar
  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleTickerChange = (e) => {
    setTicker(e.target.value.toUpperCase());
    clearTickerError();
  };

  const currentTimeframeLabel = TIMEFRAMES.find(tf => tf.value === timeframe)?.label || timeframe;

  return (
    <div className="trade-simulator-page">
      <h2>Trade Simulator</h2>
      <form onSubmit={fetchStockData} className="search-form">
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
            className={`nbars-input ${nBarsError ? 'input-error' : ''}`}
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
        <div className="chart-section" style={{ position: 'relative' }}>
          {/* Chart Toolbar above chart */}
          {stockData && stockData.data && stockData.data.length > 0 && (
            <ChartToolbar
              speed={speed}
              setSpeed={setSpeed}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onStep={handleStep}
              onStepBack={handleStepBack}
              canStepBack={visibleBars > 1}
              currentTimeframe={currentTimeframeLabel}
              chartSettings={chartSettings}
              onChartSettingsChange={setChartSettings}
            />
          )}
          {stockData && stockData.data && stockData.data.length > 0 ? (
            <LightweightCandlestickChart
              data={stockData.data.slice(0, visibleBars).map(d => ({
                ...d,
                time: typeof d.time === 'number'
                  ? d.time
                  : Math.floor(new Date(d.time || d.datetime || d.date || d.timestamp).getTime() / 1000),
              }))}
              height={400}
              chartSettings={chartSettings}
              takeProfit={activePosition && activePosition.takeProfit > 0 ? activePosition.takeProfit : null}
              stopLoss={activePosition && activePosition.stopLoss > 0 ? activePosition.stopLoss : null}
            />
          ) : (
            <div className="chart-placeholder">Chart will appear here after you select a ticker.</div>
          )}
        </div>
        <div className="order-entry-panel">
          <h3>Order Entry</h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: 16 }}>
            <button
              className="buy-btn"
              onClick={handleOpenBuyModal}
              disabled={false}
            >
              Buy
            </button>
            <button
              className="sell-btn"
              onClick={handleOpenSellModal}
              disabled={false}
            >
              Sell
            </button>
            {activePosition && (
              <button
                className="close-btn"
                onClick={handleClosePosition}
              >
                Close Position
              </button>
            )}
          </div>
          {activePosition && (
            <div style={{ 
              background: '#1a1d24', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              border: '1px solid #333'
            }}>
              <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '4px' }}>Active Position:</div>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                {activePosition.side} {activePosition.size} lot(s) @ ${activePosition.entryPrice.toFixed(2)}
              </div>
              {(activePosition.takeProfit > 0 || activePosition.stopLoss > 0) && (
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {activePosition.takeProfit > 0 && (
                    <div>Take Profit: ${activePosition.takeProfit.toFixed(2)}</div>
                  )}
                  {activePosition.stopLoss > 0 && (
                    <div>Stop Loss: ${activePosition.stopLoss.toFixed(2)}</div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Pending Orders Section */}
          {pendingOrders.length > 0 && (
            <div style={{ 
              background: '#1a1d24', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '16px',
              border: '1px solid #333'
            }}>
              <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '8px' }}>Pending Orders:</div>
              {pendingOrders.map((order, index) => (
                <div key={order.id} style={{ 
                  fontSize: '14px', 
                  marginBottom: '4px',
                  padding: '6px 8px',
                  background: '#23262F',
                  borderRadius: '4px',
                  border: '1px solid #444'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      color: order.side === 'Buy' ? '#22c55e' : '#ef4444',
                      fontWeight: '600'
                    }}>
                      {order.side} {order.size} lot(s) @ ${order.entryPrice.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        cancelPendingOrder(order.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '2px 6px'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Trading Metrics */}
          <div className="metrics-bar">
            <div>Active P&L: <span className={activePL > 0 ? 'pl-positive' : activePL < 0 ? 'pl-negative' : 'pl-neutral'}>
              ${activePL.toFixed(2)}
            </span></div>
            <div>Total P&L: <span className={totalPL >= 0 ? 'pl-positive' : 'pl-negative'}>
              ${totalPL.toFixed(2)}
            </span></div>
            <div>Win Rate: <span className="pl-neutral">{calculateWinRate().toFixed(1)}%</span></div>
            <div>Total Trades: <span className="pl-neutral">{totalTrades}</span></div>
            <div>Avg R/R: <span className="pl-neutral">{calculateAverageRR()}</span></div>
          </div>
        </div>
      </div>

      {/* Trade History Section */}
      {tradeHistory.length > 0 && (
        <div className="trade-history-section">
          <h3>Trade History</h3>
          <div style={{ 
            background: '#1a1d24', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            border: '1px solid #333',
            fontSize: '14px',
            color: '#aaa'
          }}>
            Starting Balance: $10,000.00 | Current Balance: ${totalPL.toFixed(2)} | 
            Net P&L: <span className={totalPL >= 10000 ? 'pl-positive' : 'pl-negative'}>
              ${(totalPL - 10000).toFixed(2)}
            </span>
          </div>
          <div className="trade-history-table">
            <div className="trade-history-header">
              <div>Trade #</div>
              <div>Side</div>
              <div>Size</div>
              <div>Entry Price</div>
              <div>Exit Price</div>
              <div>P&L</div>
              <div>Exit Reason</div>
            </div>
            {tradeHistory.map((trade, index) => (
              <div key={trade.id} className="trade-history-row">
                <div>{index + 1}</div>
                <div>{trade.side}</div>
                <div>{trade.size}</div>
                <div>${trade.entryPrice.toFixed(2)}</div>
                <div>${trade.exitPrice.toFixed(2)}</div>
                <div className={trade.finalPL > 0 ? 'pl-positive' : 'pl-negative'}>
                  ${trade.finalPL.toFixed(2)}
                </div>
                <div>{trade.closeReason || 'Manual'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="modal-overlay" onClick={handleCloseBuyModal}>
          <div
            className="modal-content order-modal"
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: `calc(50% + ${buyModalDrag.position.x}px)` ,
              top: `calc(50% + ${buyModalDrag.position.y}px)` ,
              transform: 'translate(-50%, -50%)',
              cursor: 'default',
            }}
          >
            <div className="modal-header" style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 8 }}>
              <div
                className="modal-drag-bar"
                onMouseDown={buyModalDrag.onMouseDown}
                style={{
                  width: '100%',
                  height: 18,
                  cursor: 'grab',
                  background: 'linear-gradient(90deg, #23262F 60%, #23262F00)',
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  marginBottom: 6,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 className="modal-title" style={{ margin: 0 }}>Place {orderSide} Order</h2>
                <button className="modal-close-btn" onClick={handleCloseBuyModal} aria-label="Close">&times;</button>
              </div>
            </div>
            <div className="order-modal-row">
              <div className="order-modal-field">
                <label htmlFor="side-select">Side</label>
                <select
                  id="side-select"
                  value={orderSide}
                  onChange={(e) => handleOrderSideChange(e.target.value)}
                >
                  <option>Buy</option>
                  <option>Sell</option>
                </select>
              </div>
              <div className="order-modal-field">
                <label htmlFor="type-select">Type</label>
                <select
                  id="type-select"
                  value={orderType}
                  onChange={(e) => handleOrderTypeChange(e.target.value)}
                >
                  <option>Limit</option>
                  <option>Market</option>
                </select>
              </div>
            </div>
            <div className="order-modal-row">
              <div className="order-modal-field">
                <label htmlFor="position-size">Position Size (Lots)</label>
                <input
                  id="position-size"
                  type="number"
                  min="0"
                  value={positionSize}
                  onChange={(e) => handlePositionSizeChange(e.target.value)}
                  className={positionSizeError ? 'input-error' : ''}
                />
                {positionSizeError && (
                  <span className="error-message">{positionSizeError}</span>
                )}
              </div>
              <div className="order-modal-field">
                <label htmlFor="entry-price">Entry Price</label>
                <input
                  id="entry-price"
                  type="number"
                  min="0"
                  value={entryPrice}
                  onChange={(e) => handleEntryPriceChange(e.target.value)}
                  readOnly={orderType === "Market"}
                  className={entryPriceError ? 'input-error' : ''}
                />
                {entryPriceError && (
                  <span className="error-message">{entryPriceError}</span>
                )}
              </div>
            </div>
            <div className="order-modal-toggle-row">
              <div className="order-modal-field">
                <label htmlFor="take-profit">Take Profit</label>
                <input
                  id="take-profit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={takeProfit}
                  onChange={(e) => handleTakeProfitChange(e.target.value)}
                  placeholder="Optional"
                  className={takeProfitError ? 'input-error' : ''}
                />
                {takeProfitError && (
                  <span className="error-message">{takeProfitError}</span>
                )}
              </div>
              <div className="order-modal-field">
                <label htmlFor="stop-loss">Stop Loss</label>
                <input
                  id="stop-loss"
                  type="number"
                  min="0"
                  step="0.01"
                  value={stopLoss}
                  onChange={(e) => handleStopLossChange(e.target.value)}
                  placeholder="Optional"
                  className={stopLossError ? 'input-error' : ''}
                />
                {stopLossError && (
                  <span className="error-message">{stopLossError}</span>
                )}
              </div>
            </div>
            <div className="order-modal-field" style={{ marginTop: 18 }}>
              <label>Tags (Press Enter or Click dropdown option to add)</label>
              <input type="text" placeholder="Select tags" disabled />
            </div>
            <div className="order-modal-actions">
              <button className="order-discard-btn" onClick={handleCloseBuyModal}>Discard</button>
              <button className="order-save-btn" onClick={handlePlaceOrder}>Save</button>
              <button className="order-save-journal-btn">Save & Journal</button>
            </div>
          </div>
        </div>
      )}
      {/* Sell Modal */}
      {showSellModal && (
        <div className="modal-overlay" onClick={handleCloseSellModal}>
          <div
            className="modal-content order-modal"
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              left: `calc(50% + ${sellModalDrag.position.x}px)` ,
              top: `calc(50% + ${sellModalDrag.position.y}px)` ,
              transform: 'translate(-50%, -50%)',
              cursor: 'default',
            }}
          >
            <div className="modal-header" style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 8 }}>
              <div
                className="modal-drag-bar"
                onMouseDown={sellModalDrag.onMouseDown}
                style={{
                  width: '100%',
                  height: 18,
                  cursor: 'grab',
                  background: 'linear-gradient(90deg, #23262F 60%, #23262F00)',
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  marginBottom: 6,
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 className="modal-title" style={{ margin: 0 }}>Place {orderSide} Order</h2>
                <button className="modal-close-btn" onClick={handleCloseSellModal} aria-label="Close">&times;</button>
              </div>
            </div>
            <div className="order-modal-row">
              <div className="order-modal-field">
                <label htmlFor="side-select">Side</label>
                <select
                  id="side-select"
                  value={orderSide}
                  onChange={(e) => handleOrderSideChange(e.target.value)}
                >
                  <option>Buy</option>
                  <option>Sell</option>
                </select>
              </div>
              <div className="order-modal-field">
                <label htmlFor="type-select">Type</label>
                <select
                  id="type-select"
                  value={orderType}
                  onChange={(e) => handleOrderTypeChange(e.target.value)}
                >
                  <option>Limit</option>
                  <option>Market</option>
                </select>
              </div>
            </div>
            <div className="order-modal-row">
              <div className="order-modal-field">
                <label htmlFor="position-size">Position Size (Lots)</label>
                <input
                  id="position-size"
                  type="number"
                  min="0"
                  value={positionSize}
                  onChange={(e) => handlePositionSizeChange(e.target.value)}
                  className={positionSizeError ? 'input-error' : ''}
                />
                {positionSizeError && (
                  <span className="error-message">{positionSizeError}</span>
                )}
              </div>
              <div className="order-modal-field">
                <label htmlFor="entry-price">Entry Price</label>
                <input
                  id="entry-price"
                  type="number"
                  min="0"
                  value={entryPrice}
                  onChange={(e) => handleEntryPriceChange(e.target.value)}
                  readOnly={orderType === "Market"}
                  className={entryPriceError ? 'input-error' : ''}
                />
                {entryPriceError && (
                  <span className="error-message">{entryPriceError}</span>
                )}
              </div>
            </div>
            <div className="order-modal-toggle-row">
              <div className="order-modal-field">
                <label htmlFor="take-profit">Take Profit</label>
                <input
                  id="take-profit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={takeProfit}
                  onChange={(e) => handleTakeProfitChange(e.target.value)}
                  placeholder="Optional"
                  className={takeProfitError ? 'input-error' : ''}
                />
                {takeProfitError && (
                  <span className="error-message">{takeProfitError}</span>
                )}
              </div>
              <div className="order-modal-field">
                <label htmlFor="stop-loss">Stop Loss</label>
                <input
                  id="stop-loss"
                  type="number"
                  min="0"
                  step="0.01"
                  value={stopLoss}
                  onChange={(e) => handleStopLossChange(e.target.value)}
                  placeholder="Optional"
                  className={stopLossError ? 'input-error' : ''}
                />
                {stopLossError && (
                  <span className="error-message">{stopLossError}</span>
                )}
              </div>
            </div>
            <div className="order-modal-field" style={{ marginTop: 18 }}>
              <label>Tags (Press Enter or Click dropdown option to add)</label>
              <input type="text" placeholder="Select tags" disabled />
            </div>
            <div className="order-modal-actions">
              <button className="order-discard-btn" onClick={handleCloseSellModal}>Discard</button>
              <button className="order-save-btn" onClick={handlePlaceOrder}>Save</button>
              <button className="order-save-journal-btn">Save & Journal</button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        message={snackbar.message}
        open={snackbar.open}
        onClose={closeSnackbar}
        type={snackbar.type}
      />
    </div>
  );
};

export default TradeSimulatorPage; 


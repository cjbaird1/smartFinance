import React, { useState, useRef } from 'react';
import LightweightCandlestickChart from '../components/LightweightCandlestickChart';
import ChartToolbar from '../components/ChartToolbar';
import ChartSidebar from '../components/ChartSidebar';
import Snackbar from '../components/Snackbar';
import ValidatedInput from '../components/ValidatedInput';
import { useTickerValidation } from '../hooks/useTickerValidation';
import '../styles/trade-simulator-page.css';
import '../styles/error-system.css';
import { getCurrentClosingPrice, getCurrentCandlestick, shouldOrderBeFilled, calculatePL } from '../utils/tradeSimulator';
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD } from '../utils/chartUtils';
import OrderModal from '../components/OrderModal';
import Tooltip from '../components/Tooltip';
import MlPrediction from '../components/MlPrediction';

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
  // Chart appearance settings
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
  
  // Indicator settings
  indicators: {
    sma: {
      period: 20,
      color: '#FF6B6B',
      enabled: false
    },
    ema: {
      period: 20,
      color: '#4ECDC4',
      enabled: false
    },
    rsi: {
      period: 14,
      color: '#45B7D1',
      enabled: false
    },
    macd: {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      color: '#96CEB4',
      enabled: false
    }
  }
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

  // ML signals toggle state
  const [showMlSignals, setShowMlSignals] = useState(false);
  const handleToggleMlSignals = (checked) => setShowMlSignals(checked);
  
  // ML prediction state
  const [mlPrediction, setMlPrediction] = useState(null);

  // Indicator state
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [indicatorData, setIndicatorData] = useState([]);

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

  // Add unified modal state and drag state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const orderModalDrag = useDraggableModal({ x: 0, y: 0 });

  // Calculate win rate from trade history
  const calculateWinRate = () => {
    if (tradeHistory.length === 0) return 0;
    const winningTrades = tradeHistory.filter(trade => trade.finalPL > 0).length;
    return (winningTrades / tradeHistory.length) * 100;
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
      const currentPrice = getCurrentClosingPrice(stockData, visibleBars);
      const newPL = calculatePL(activePosition, currentPrice);
      setActivePL(newPL);

      // Check for take profit and stop loss hits
      const high = parseFloat(getCurrentCandlestick(stockData, visibleBars)?.high || currentPrice);
      const low = parseFloat(getCurrentCandlestick(stockData, visibleBars)?.low || currentPrice);
      
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
        const closeBar = visibleBars - 1;
        const closeDate = stockData && stockData.data && stockData.data[closeBar] ? stockData.data[closeBar].time || stockData.data[closeBar].datetime || stockData.data[closeBar].date : null;
        const duration = activePosition.openBar !== undefined ? (closeBar - activePosition.openBar) : null;
        const tradeRecord = {
          id: Date.now(),
          side: activePosition.side,
          size: activePosition.size,
          entryPrice: activePosition.entryPrice,
          exitPrice: closeReason === "Take Profit" ? activePosition.takeProfit : activePosition.stopLoss,
          finalPL: finalPL,
          closeReason: closeReason,
          timestamp: new Date().toISOString(),
          openBar: activePosition.openBar,
          openDate: activePosition.openDate,
          closeBar,
          closeDate,
          duration
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
    if (orderType === "Market") {
      const currentPrice = getCurrentClosingPrice(stockData, visibleBars);
      if (currentPrice > 0) {
        setEntryPrice(currentPrice.toFixed(2));
      }
    }
  }, [visibleBars, orderType, stockData]);

  // Execute pending orders when new candlestick appears
  React.useEffect(() => {
    if (visibleBars > 1 && pendingOrders.length > 0 && stockData && stockData.data) {
      const currentCandlestick = getCurrentCandlestick(stockData, visibleBars);
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
    const openBar = visibleBars - 1;
    const openDate = stockData && stockData.data && stockData.data[openBar] ? stockData.data[openBar].time || stockData.data[openBar].datetime || stockData.data[openBar].date : null;
    const newPosition = {
      side: order.side,
      size: order.size,
      entryPrice: executionPrice,
      takeProfit: parseFloat(order.takeProfit) || 0,
      stopLoss: parseFloat(order.stopLoss) || 0,
      timestamp: new Date().toISOString(),
      openBar,
      openDate
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
      const currentPrice = getCurrentClosingPrice(stockData, visibleBars);
      if (currentPrice > 0) {
        const executedOrder = { ...order, entryPrice: currentPrice };
        executeOrder(executedOrder, getCurrentCandlestick(stockData, visibleBars));
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

    // Close the modal after successful order
    setOrderModalOpen(false);
  };

  const handleClosePosition = () => {
    if (!activePosition) return;

    const currentPrice = getCurrentClosingPrice(stockData, visibleBars);
    const finalPL = calculatePL(activePosition, currentPrice);
    const plText = finalPL >= 0 ? `+$${finalPL.toFixed(2)}` : `-$${Math.abs(finalPL).toFixed(2)}`;

    // Add to trade history
    const closeBar = visibleBars - 1;
    const closeDate = stockData && stockData.data && stockData.data[closeBar] ? stockData.data[closeBar].time || stockData.data[closeBar].datetime || stockData.data[closeBar].date : null;
    const duration = activePosition.openBar !== undefined ? (closeBar - activePosition.openBar) : null;
    const tradeRecord = {
      id: Date.now(),
      side: activePosition.side,
      size: activePosition.size,
      entryPrice: activePosition.entryPrice,
      exitPrice: currentPrice,
      finalPL: finalPL,
      closeReason: 'Manual Close',
      timestamp: new Date().toISOString(),
      openBar: activePosition.openBar,
      openDate: activePosition.openDate,
      closeBar,
      closeDate,
      duration
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
      const currentPrice = getCurrentClosingPrice(stockData, visibleBars);
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

  // Effect to handle play/pause and speed changes for candlestick rendering
  React.useEffect(() => {
    if (isPlaying) {
      // Clear any existing interval first
      if (playInterval.current) {
        clearInterval(playInterval.current);
      }
      playInterval.current = setInterval(() => {
        setVisibleBars(prev => Math.min(prev + 1, stockData?.data?.length || 1));
      }, 1000 / speed);
    } else {
      if (playInterval.current) {
        clearInterval(playInterval.current);
        playInterval.current = null;
      }
    }
    // Cleanup on unmount or when dependencies change
    return () => {
      if (playInterval.current) {
        clearInterval(playInterval.current);
        playInterval.current = null;
      }
    };
  }, [isPlaying, speed, stockData]);

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
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
     // console.log('First candle from backend:', data.data[0]);
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

  // Calculate indicator data when selection changes
  React.useEffect(() => {
    if (!selectedIndicator || !stockData || !stockData.data || stockData.data.length === 0) {
      setIndicatorData([]);
      return;
    }
    try {
      const data = stockData.data.slice(0, visibleBars);
      let calculatedData = [];
      switch (selectedIndicator) {
        case 'sma':
          calculatedData = calculateSMA(data, chartSettings.indicators.sma.period);
          break;
        case 'ema':
          calculatedData = calculateEMA(data, chartSettings.indicators.ema.period);
          break;
        case 'rsi':
          calculatedData = calculateRSI(data, chartSettings.indicators.rsi.period);
          break;
        case 'macd':
          const macdData = calculateMACD(
            data,
            chartSettings.indicators.macd.fastPeriod,
            chartSettings.indicators.macd.slowPeriod,
            chartSettings.indicators.macd.signalPeriod
          );
          calculatedData = macdData.macdLine;
          break;
        default:
          calculatedData = [];
      }
      setIndicatorData(calculatedData);
    } catch (error) {
      console.error('Error calculating indicator:', error);
      setIndicatorData([]);
      showSnackbar(`Failed to calculate ${selectedIndicator.toUpperCase()} indicator`, 'error');
    }
  }, [selectedIndicator, chartSettings, stockData, visibleBars]);

  // Get the currently enabled indicator
  const getEnabledIndicator = () => {
    const indicators = chartSettings.indicators;
    if (indicators.sma.enabled) return 'sma';
    if (indicators.ema.enabled) return 'ema';
    if (indicators.rsi.enabled) return 'rsi';
    if (indicators.macd.enabled) return 'macd';
    return '';
  };

  // Update indicator when settings change
  React.useEffect(() => {
    const enabledIndicator = getEnabledIndicator();
    if (enabledIndicator !== selectedIndicator) {
      setSelectedIndicator(enabledIndicator);
    }
  }, [chartSettings.indicators]);

  // Handle quick indicator selection from dropdown
  const handleQuickIndicatorSelect = (indicator) => {
    setSelectedIndicator(indicator);
    
    if (!indicator) {
      // Disable all indicators
      const updatedSettings = {
        ...chartSettings,
        indicators: {
          ...chartSettings.indicators,
          sma: { ...chartSettings.indicators.sma, enabled: false },
          ema: { ...chartSettings.indicators.ema, enabled: false },
          rsi: { ...chartSettings.indicators.rsi, enabled: false },
          macd: { ...chartSettings.indicators.macd, enabled: false }
        }
      };
      setChartSettings(updatedSettings);
      setIndicatorData([]);
      return;
    }

    // Enable the selected indicator with default settings
    const updatedSettings = {
      ...chartSettings,
      indicators: {
        ...chartSettings.indicators,
        sma: { ...chartSettings.indicators.sma, enabled: indicator === 'sma' },
        ema: { ...chartSettings.indicators.ema, enabled: indicator === 'ema' },
        rsi: { ...chartSettings.indicators.rsi, enabled: indicator === 'rsi' },
        macd: { ...chartSettings.indicators.macd, enabled: indicator === 'macd' }
      }
    };
    setChartSettings(updatedSettings);
  };

  // Helper to format UNIX timestamp or date string
  function formatDate(val) {
    if (!val) return '-';
    // If it's a number or numeric string, treat as UNIX timestamp (seconds)
    const num = typeof val === 'string' ? Number(val) : val;
    if (!isNaN(num) && num > 1000000000 && num < 5000000000) {
      // Likely a UNIX timestamp in seconds
      const d = new Date(num * 1000);
      return d.toLocaleDateString();
    }
    // Otherwise, return as is
    return val;
  }

  return (
    <div className="trade-simulator-page bg-bg-main min-h-screen w-full text-text-main">
      <h2 className="mb-6 text-text-main text-2xl font-semibold">Trade Simulator</h2>
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
            className={`px-4 py-2 text-base border rounded-lg w-60 bg-bg-main text-text-main border-border focus:outline-none focus:ring-2 focus:ring-accent ${nBarsError ? 'border-error' : ''}`}
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
      {error && (
        <div className="error-message text-error text-base font-medium mb-6">
          {error}
        </div>
      )}
      {/* Main content row: chart and order entry panel */}
      <div className="simulator-main-row flex flex-col gap-6">
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
              showMlSignals={showMlSignals}
              onToggleMlSignals={handleToggleMlSignals}
              selectedIndicator={selectedIndicator}
              onIndicatorChange={setSelectedIndicator}
            />
          )}
          {stockData && stockData.data && stockData.data.length > 0 ? (
            <LightweightCandlestickChart
              data={stockData.data.slice(0, visibleBars).map(d => ({
                ...d,
                time: d.time, // Use backend-provided UNIX timestamp (seconds)
              }))}
              height={400}
              chartSettings={chartSettings}
              takeProfit={activePosition && activePosition.takeProfit > 0 ? activePosition.takeProfit : null}
              stopLoss={activePosition && activePosition.stopLoss > 0 ? activePosition.stopLoss : null}
              limitOrders={pendingOrders.filter(order => typeof order.entryPrice === 'number' && !isNaN(order.entryPrice)).map(order => ({ id: order.id, price: order.entryPrice }))}
              selectedIndicator={selectedIndicator}
              indicatorData={indicatorData}
            />
          ) : (
            <div className="chart-placeholder bg-bg-panel rounded-radius p-12 shadow-shadow min-h-80 flex items-center justify-center text-text-muted text-lg">Chart will appear here after you select a ticker.</div>
          )}
        </div>
        <div className="order-entry-panel bg-bg-panel rounded-radius p-6 shadow-shadow">
          <h3 className="text-text-main text-xl font-semibold mb-4">Order Entry</h3>
          <div className="flex gap-3 mb-4">
            <button
              className="buy-btn bg-green-500 text-white border-none rounded-full px-7 py-2 text-base font-semibold cursor-pointer transition-all duration-200 shadow-lg hover:bg-green-600 disabled:bg-gray-500 disabled:cursor-not-allowed"
              onClick={() => {
                setOrderSide("Buy");
                setOrderModalOpen(true);
                setPositionSizeError("");
                setEntryPriceError("");
                setTakeProfitError("");
                setStopLossError("");
                // Set entry price for market orders
                if (orderType === "Market") {
                  const currentPrice = getCurrentClosingPrice(stockData, visibleBars);
                  if (currentPrice > 0) {
                    setEntryPrice(currentPrice.toFixed(2));
                  }
                }
              }}
              disabled={false}
            >
              Buy
            </button>
            <button
              className="sell-btn bg-red-500 text-white border-none rounded-full px-7 py-2 text-base font-semibold cursor-pointer transition-all duration-200 shadow-lg hover:bg-red-600 disabled:bg-gray-500 disabled:cursor-not-allowed"
              onClick={() => {
                setOrderSide("Sell");
                setOrderModalOpen(true);
                setPositionSizeError("");
                setEntryPriceError("");
                setTakeProfitError("");
                setStopLossError("");
                // Set entry price for market orders
                if (orderType === "Market") {
                  const currentPrice = getCurrentClosingPrice(stockData, visibleBars);
                  if (currentPrice > 0) {
                    setEntryPrice(currentPrice.toFixed(2));
                  }
                }
              }}
              disabled={false}
            >
              Sell
            </button>
            {activePosition && (
              <button
                className="close-btn bg-yellow-500 text-white border-none rounded-full px-4 py-2 text-base font-semibold cursor-pointer transition-all duration-200 shadow-lg hover:bg-yellow-600"
                onClick={handleClosePosition}
              >
                Close Position
              </button>
            )}
          </div>
          {activePosition && (
            <div className="bg-bg-panel p-3 rounded-lg mb-4 border border-border">
              <div className="text-sm text-text-muted mb-1">Active Position:</div>
              <div className="text-base font-semibold mb-2">
                {activePosition.side} {activePosition.size} lot(s) @ ${activePosition.entryPrice.toFixed(2)}
              </div>
              {(activePosition.takeProfit > 0 || activePosition.stopLoss > 0) && (
                <div className="text-xs text-gray-400">
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
            <div className="bg-bg-panel p-3 rounded-lg mb-4 border border-border">
              <div className="text-sm text-text-muted mb-2">Pending Orders:</div>
              {pendingOrders.map((order, index) => (
                <div
                  key={order.id}
                  className="text-sm mb-1 p-2 bg-bg-panel rounded border border-border"
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-semibold ${order.side === 'Buy' ? 'text-green-500' : 'text-error'}`}
                    >
                      {order.side} {order.size} lot(s) @ ${order.entryPrice.toFixed(2)}
                    </span>
                    <button
                      onClick={() => {
                        cancelPendingOrder(order.id);
                      }}
                      className="pending-cancel-btn text-xs text-error hover:underline ml-4"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Trading Metrics */}
          <div className="flex flex-wrap justify-between items-center gap-x-8 gap-y-2 bg-[#23262F] p-3 rounded-[8px] mt-4 border border-[#333] text-[14px]">
            <div>
              <span className="text-[#A0A4AE] font-medium">Active P&L: </span>
              <span className={activePL > 0 ? 'text-[#22c55e] font-semibold text-base' : activePL < 0 ? 'text-[#ef4444] font-semibold text-base' : 'text-[#f4f4f4] font-semibold text-base'}>
                ${activePL.toFixed(2)}
              </span>
            </div>
            <div className="border-l border-[#333] pl-6">
              <span className="text-[#A0A4AE] font-medium">Net P&L: </span>
              <span className={(totalPL - 10000) >= 0 ? 'text-[#22c55e] font-semibold text-base' : 'text-[#ef4444] font-semibold text-base'}>
                ${(totalPL - 10000).toFixed(2)}
              </span>
            </div>
            <div className="border-l border-[#333] pl-6">
              <span className="text-[#A0A4AE] font-medium">Win Rate: </span>
              <span className="text-[#f4f4f4] font-semibold text-base">{calculateWinRate().toFixed(1)}%</span>
            </div>
            <div className="border-l border-[#333] pl-6">
              <span className="text-[#A0A4AE] font-medium">Total Trades: </span>
              <span className="text-[#f4f4f4] font-semibold text-base">{totalTrades}</span>
            </div>
            <div className="border-l border-[#333] pl-6">
              <Tooltip content="Average Risk-Reward">
                <span className="text-[#A0A4AE] font-medium">Avg R/R: </span>
                <span className="text-[#f4f4f4] font-semibold text-base">{calculateAverageRR()}</span>
              </Tooltip>
            </div>
          </div>
          {/* ML Prediction Component: only render after valid stock data is loaded */}
          {stockData && stockData.data && stockData.data.length > 0 && (
            <MlPrediction 
              ticker={ticker}
              timeframe={timeframe}
              onPredictionUpdate={setMlPrediction}
            />
          )}
        </div>
      </div>

      {/* Trade History Section */}
      {tradeHistory.length > 0 && (
        <div className="trade-history-section">
          <h3 className="text-xl font-semibold mb-3">Trade History</h3>
          <div className="bg-bg-panel p-3 rounded-lg mb-4 border border-border flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <span className="text-[#A0A4AE] font-medium">Starting Balance: </span>
              <span className="text-[#f4f4f4] font-semibold text-base">$10,000.00</span>
            </div>
            <div className="border-l border-[#333] pl-6">
              <span className="text-[#A0A4AE] font-medium">Current Balance: </span>
              <span className="text-[#f4f4f4] font-semibold text-base">${totalPL.toFixed(2)}</span>
            </div>
            <div className="border-l border-[#333] pl-6">
              <span className="text-[#A0A4AE] font-medium">Net P&L: </span>
              <span className={totalPL >= 10000 ? 'text-[#22c55e] font-semibold text-base' : 'text-[#ef4444] font-semibold text-base'}>
                ${(totalPL - 10000).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="flex font-semibold bg-bg-panel border-b border-border py-2 px-2 text-text-main">
                <div className="w-16">Trade #</div>
                <div className="w-16">Side</div>
                <div className="w-16">Size</div>
                <div className="w-28">Entry Price</div>
                <div className="w-28">Exit Price</div>
                <div className="w-28">Open Day</div>
                <div className="w-28">Close Day</div>
                <div className="w-20">Duration</div>
                <div className="w-24">P&L</div>
                <div className="w-32">Exit Reason</div>
              </div>
              {tradeHistory.map((trade, index) => (
                <div key={trade.id} className="flex items-center border-b border-border last:border-b-0 py-2 px-2 text-text-main text-sm">
                  <div className="w-16">{index + 1}</div>
                  <div className="w-16">{trade.side}</div>
                  <div className="w-16">{trade.size}</div>
                  <div className="w-28">${trade.entryPrice.toFixed(2)}</div>
                  <div className="w-28">${trade.exitPrice.toFixed(2)}</div>
                  <div className="w-28">{formatDate(trade.openDate)}</div>
                  <div className="w-28">{formatDate(trade.closeDate)}</div>
                  <div className="w-20">{trade.duration !== null && trade.duration !== undefined ? trade.duration : '-'}</div>
                  <div className={`w-24 font-semibold ${trade.finalPL > 0 ? 'text-green-500' : 'text-error'}`}>${trade.finalPL.toFixed(2)}</div>
                  <div className="w-32">{trade.closeReason || 'Manual'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        open={orderModalOpen}
        onClose={() => {
          setOrderModalOpen(false);
          setPositionSizeError("");
          setEntryPriceError("");
          setTakeProfitError("");
          setStopLossError("");
          setPositionSize('');
          setEntryPrice('');
          setTakeProfit('');
          setStopLoss('');
        }}
        dragState={orderModalDrag}
        orderSide={orderSide}
        orderType={orderType}
        positionSize={positionSize}
        entryPrice={entryPrice}
        takeProfit={takeProfit}
        stopLoss={stopLoss}
        positionSizeError={positionSizeError}
        entryPriceError={entryPriceError}
        takeProfitError={takeProfitError}
        stopLossError={stopLossError}
        onOrderSideChange={handleOrderSideChange}
        onOrderTypeChange={handleOrderTypeChange}
        onPositionSizeChange={handlePositionSizeChange}
        onEntryPriceChange={handleEntryPriceChange}
        onTakeProfitChange={handleTakeProfitChange}
        onStopLossChange={handleStopLossChange}
        onPlaceOrder={handlePlaceOrder}
        onDiscard={() => {
          setOrderModalOpen(false);
          setPositionSizeError("");
          setEntryPriceError("");
          setTakeProfitError("");
          setStopLossError("");
          setPositionSize('');
          setEntryPrice('');
          setTakeProfit('');
          setStopLoss('');
        }}
        onSaveJournal={() => {}}
      />

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


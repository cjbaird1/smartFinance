import React, { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts';
import '../styles/candlestick-chart.css';
import { formatCandleTimestamp } from '../utils/dateUtils';
import { getHoveredIndexAndPrev, calculateSMA, calculateEMA, calculateRSI, calculateMACD } from '../utils/chartUtils';

const LightweightCandlestickChart = ({ data, height = 400, chartSettings, takeProfit, stopLoss, limitOrders = [], selectedIndicator, indicatorData }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const indicatorSeriesRef = useRef();
  const takeProfitLineRef = useRef();
  const stopLossLineRef = useRef();
  const limitOrderLineRefs = useRef({});
  const [hoveredBar, setHoveredBar] = useState(null);

  // Only create chart and series on mount
  useEffect(() => {
    if (!chartContainerRef.current) return;
    chartRef.current = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { type: 'solid', color: '#181A20' },
        textColor: '#F4F4F4',
      },
      grid: {
        vertLines: { color: '#23262F' },
        horzLines: { color: '#23262F' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#282B33',
      },
      timeScale: {
        borderColor: '#282B33',
        tickMarkFormatter: (time) => {
          // Handle both UNIX timestamp (number) and business day object
          if (typeof time === 'number') {
            return formatCandleTimestamp(time);
          } else if (typeof time === 'object' && time !== null) {
            // Convert business day to timestamp (assume UTC)
            const { year, month, day } = time;
            const date = new Date(Date.UTC(year, month - 1, day));
            return formatCandleTimestamp(Math.floor(date.getTime() / 1000));
          }
          return '';
        },
      },
    });
    seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: chartSettings?.bodyUp || '#26a69a',
      downColor: chartSettings?.bodyDown || '#ef5350',
      borderVisible: chartSettings?.showBorders !== false,
      wickUpColor: chartSettings?.wickUp || '#26a69a',
      wickDownColor: chartSettings?.wickDown || '#ef5350',
    });

    // Add crosshairMove event for OHLC info panel
    chartRef.current.subscribeCrosshairMove(param => {
      console.log('crosshairMove param:', param);
      if (param && param.seriesData && param.seriesData.size > 0) {
        const priceData = param.seriesData.get(seriesRef.current);
        if (priceData && param.time) {
          setHoveredBar({
            open: priceData.open,
            high: priceData.high,
            low: priceData.low,
            close: priceData.close
          });
        } else {
          setHoveredBar(null);
        }
      } else {
        setHoveredBar(null);
      }
    });

    // Resize chart on container resize
    const handleResize = () => {
      chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current.remove();
      chartRef.current = null;
      seriesRef.current = null;
      takeProfitLineRef.current = null;
      stopLossLineRef.current = null;
      limitOrderLineRefs.current = {};
    };
  // Only run on mount/unmount
  }, []);

  // Update chart settings if they change
  useEffect(() => {
    if (seriesRef.current && chartSettings) {
      seriesRef.current.applyOptions({
        upColor: chartSettings.bodyUp || '#26a69a',
        downColor: chartSettings.bodyDown || '#ef5350',
        borderVisible: chartSettings.showBorders !== false,
        wickUpColor: chartSettings.wickUp || '#26a69a',
        wickDownColor: chartSettings.wickDown || '#ef5350',
      });
    }
  }, [chartSettings]);

  // Update series data when data changes
  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      const formatted = data.map(d => ({
        time: d.time, // Use only the UNIX timestamp (seconds)
        open: +d.open,
        high: +d.high,
        low: +d.low,
        close: +d.close,
      }));
      // console.log('First candle sent to chart:', formatted[0]);
      seriesRef.current.setData(formatted);
    }
  }, [data]);

  // Handle takeProfit, stopLoss, and limit order price lines
  useEffect(() => {
    if (!seriesRef.current) return;
    // Remove previous lines if they exist
    if (takeProfitLineRef.current) {
      try {
        seriesRef.current.removePriceLine(takeProfitLineRef.current);
      } catch (e) {}
      takeProfitLineRef.current = null;
    }
    if (stopLossLineRef.current) {
      try {
        seriesRef.current.removePriceLine(stopLossLineRef.current);
      } catch (e) {}
      stopLossLineRef.current = null;
    }
    // Remove previous limit order lines
    Object.values(limitOrderLineRefs.current).forEach(line => {
      try {
        seriesRef.current.removePriceLine(line);
      } catch (e) {}
    });
    limitOrderLineRefs.current = {};

    // Add new take profit line
    if (typeof takeProfit === 'number' && !isNaN(takeProfit)) {
      takeProfitLineRef.current = seriesRef.current.createPriceLine({
        price: takeProfit,
        color: 'green',
        lineWidth: 2,
        lineStyle: 2, // dashed
        axisLabelVisible: true,
        title: 'Take Profit',
      });
    }
    // Add new stop loss line
    if (typeof stopLoss === 'number' && !isNaN(stopLoss)) {
      stopLossLineRef.current = seriesRef.current.createPriceLine({
        price: stopLoss,
        color: 'red',
        lineWidth: 2,
        lineStyle: 2, // dashed
        axisLabelVisible: true,
        title: 'Stop Loss',
      });
    }
    // Add limit order lines
    if (Array.isArray(limitOrders)) {
      limitOrders.forEach(order => {
        if (typeof order.price === 'number' && !isNaN(order.price)) {
          const line = seriesRef.current.createPriceLine({
            price: order.price,
            color: '#888', // neutral gray
            lineWidth: 2,
            lineStyle: 2, // dashed
            axisLabelVisible: true,
            title: 'Limit Order',
          });
          limitOrderLineRefs.current[order.id] = line;
        }
      });
    }
    // Cleanup on unmount
    return () => {
      if (seriesRef.current && takeProfitLineRef.current) {
        try {
          seriesRef.current.removePriceLine(takeProfitLineRef.current);
        } catch (e) {}
        takeProfitLineRef.current = null;
      }
      if (seriesRef.current && stopLossLineRef.current) {
        try {
          seriesRef.current.removePriceLine(stopLossLineRef.current);
        } catch (e) {}
        stopLossLineRef.current = null;
      }
      Object.values(limitOrderLineRefs.current).forEach(line => {
        try {
          seriesRef.current.removePriceLine(line);
        } catch (e) {}
      });
      limitOrderLineRefs.current = {};
    };
  }, [takeProfit, stopLoss, limitOrders]);

  // Handle indicator display
  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return;

    try {
      // Remove existing indicator series
      if (indicatorSeriesRef.current) {
        try {
          chartRef.current.removeSeries(indicatorSeriesRef.current);
        } catch (e) {
          console.warn('Failed to remove existing indicator series:', e);
        }
        indicatorSeriesRef.current = null;
      }

      // Add new indicator series if selected
      if (selectedIndicator && indicatorData && indicatorData.length > 0) {
        // Get color from chart settings
        const indicatorColor = chartSettings?.indicators?.[selectedIndicator]?.color || '#2962FF';
        
        indicatorSeriesRef.current = chartRef.current.addSeries(LineSeries, {
          color: indicatorColor,
          lineWidth: 2,
          title: selectedIndicator.toUpperCase(),
        });

        indicatorSeriesRef.current.setData(indicatorData);
      }
    } catch (error) {
      console.error('Error displaying indicator:', error);
      // Clean up on error
      if (indicatorSeriesRef.current) {
        try {
          chartRef.current.removeSeries(indicatorSeriesRef.current);
        } catch (e) {}
        indicatorSeriesRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (chartRef.current && indicatorSeriesRef.current) {
        try {
          chartRef.current.removeSeries(indicatorSeriesRef.current);
        } catch (e) {
          console.warn('Failed to cleanup indicator series:', e);
        }
        indicatorSeriesRef.current = null;
      }
    };
  }, [selectedIndicator, indicatorData, data, chartSettings]);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <div
        ref={chartContainerRef}
        className="lw-candlestick-chart-container"
        style={{ width: '100%', height }}
      />
      {((hoveredBar || (data && data.length > 0)) && (() => {
        // Use hoveredBar if present, otherwise use last visible candle
        const barToShow = hoveredBar || {
          open: +data[data.length - 1].open,
          high: +data[data.length - 1].high,
          low: +data[data.length - 1].low,
          close: +data[data.length - 1].close
        };
        const upclose = barToShow.close > barToShow.open;
        const { hoveredIndex, prevBar } = getHoveredIndexAndPrev(barToShow, data);
        const prevClose = prevBar ? +prevBar.close : null;
        const diff = prevClose !== null ? barToShow.close - prevClose : null;
        const percent = prevClose !== null ? (diff / prevClose) * 100 : null;
        // Get the timestamp from the barToShow in the data array
        let timestamp = null;
        if (hoveredIndex !== -1 && data[hoveredIndex]) {
          timestamp = data[hoveredIndex].time;
        }
        return (
          <>
            <div style={{
              position: 'absolute',
              top: 8,
              left: 12,
              background: 'rgba(24,26,32,0.92)',
              color: '#ef4444',
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 600,
              zIndex: 10,
              letterSpacing: 0.5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <span style={{color:'#fff'}}>O</span> <span style={{color: upclose ? '#22c55e' : '#ef4444'}}>{barToShow.open}</span> {' '}
              <span style={{color:'#fff'}}>H</span> <span style={{color: upclose ? '#22c55e' : '#ef4444'}}>{barToShow.high}</span> {' '}
              <span style={{color:'#fff'}}>L</span> <span style={{color: upclose ? '#22c55e' : '#ef4444'}}>{barToShow.low}</span> {' '}
              <span style={{color:'#fff'}}>C</span> <span style={{color: upclose ? '#22c55e' : '#ef4444'}}>{barToShow.close}</span>
              {diff !== null && percent !== null && (
                <span style={{color: upclose ? '#22c55e' : '#ef4444', marginLeft: 8}}>
                  {diff > 0 ? '+' : ''}{diff.toFixed(2)} ({percent > 0 ? '+' : ''}{percent.toFixed(2)}%)
                </span>
              )}
            </div>
            {timestamp && (
              <div style={{
                position: 'absolute',
                top: 40,
                left: 12,
                background: 'rgba(24,26,32,0.92)',
                color: '#f4f4f4',
                padding: '2px 12px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                zIndex: 10,
                letterSpacing: 0.5,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              }}>
                {formatCandleTimestamp(timestamp)}
              </div>
            )}
          </>
        );
      })())}
    </div>
  );
};

export default LightweightCandlestickChart; 
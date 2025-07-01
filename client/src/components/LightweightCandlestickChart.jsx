import React, { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import '../styles/candlestick-chart.css';

const LightweightCandlestickChart = ({ data, height = 400, chartSettings, takeProfit, stopLoss, limitOrders = [] }) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const seriesRef = useRef();
  const takeProfitLineRef = useRef();
  const stopLossLineRef = useRef();
  const limitOrderLineRefs = useRef({});

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
      },
    });
    seriesRef.current = chartRef.current.addSeries(CandlestickSeries, {
      upColor: chartSettings?.bodyUp || '#26a69a',
      downColor: chartSettings?.bodyDown || '#ef5350',
      borderVisible: chartSettings?.showBorders !== false,
      wickUpColor: chartSettings?.wickUp || '#26a69a',
      wickDownColor: chartSettings?.wickDown || '#ef5350',
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
        time: d.time || d.datetime || d.date || d.timestamp,
        open: +d.open,
        high: +d.high,
        low: +d.low,
        close: +d.close,
      }));
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

  return (
    <div
      ref={chartContainerRef}
      className="lw-candlestick-chart-container"
      style={{ width: '100%', height }}
    />
  );
};

export default LightweightCandlestickChart; 
// src/CandlestickChart.js

import React from 'react';
import Plot from 'react-plotly.js';
import '../styles/candlestick-chart.css';

function CandlestickChart({ data, highlightAfterHours, indicators = [], smaPeriod = 20, emaPeriod = 20 }) {
  if (!data || data.length === 0) return <div>No data to display.</div>;

  // Prepare data for Plotly
  const dates = data.map(item => new Date(item.datetime).toISOString());
  const open = data.map(item => parseFloat(item.open));
  const high = data.map(item => parseFloat(item.high));
  const low = data.map(item => parseFloat(item.low));
  const close = data.map(item => parseFloat(item.close));

  // Calculate min and max date for xaxis range
  const minDate = dates.length > 0 ? dates[0] : undefined;
  const maxDate = dates.length > 0 ? dates[dates.length - 1] : undefined;

  // Calculate min and max for y-axis with padding
  const minY = Math.min(...low);
  const maxY = Math.max(...high);
  const yPadding = (maxY - minY) * 0.05; // 5% padding
  const paddedMinY = minY - yPadding;
  const paddedMaxY = maxY + yPadding;

  // Calculate x-axis padding for candlesticks
  const minDateObj = dates.length > 0 ? new Date(dates[0]) : undefined;
  const maxDateObj = dates.length > 0 ? new Date(dates[dates.length - 1]) : undefined;
  let xPaddingMs = 0;
  if (dates.length > 1) {
    xPaddingMs = (new Date(dates[1]) - new Date(dates[0])) * 0.7; // 70% of bar width
  }
  const paddedMinDate = minDateObj ? new Date(minDateObj.getTime() - xPaddingMs) : minDateObj;
  const paddedMaxDate = maxDateObj ? new Date(maxDateObj.getTime() + xPaddingMs) : maxDateObj;

  // --- Indicator Calculations ---
  function calculateSMA(values, window) {
    let sma = [];
    for (let i = 0; i < values.length; i++) {
      if (i < window - 1) {
        sma.push(null);
      } else {
        const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
        sma.push(sum / window);
      }
    }
    return sma;
  }
  function calculateEMA(values, window) {
    let ema = [];
    let k = 2 / (window + 1);
    for (let i = 0; i < values.length; i++) {
      if (i === 0) {
        ema.push(values[0]);
      } else {
        ema.push(values[i] * k + ema[i - 1] * (1 - k));
      }
    }
    for (let i = 0; i < window - 1; i++) ema[i] = null;
    return ema;
  }
  function calculateRSI(values, period = 14) {
    let rsi = [];
    let gains = 0, losses = 0;
    for (let i = 1; i < period; i++) {
      let diff = values[i] - values[i - 1];
      if (diff >= 0) gains += diff; else losses -= diff;
    }
    gains /= period;
    losses /= period;
    rsi[period - 1] = 100 - 100 / (1 + (gains / (losses || 1e-10)));
    for (let i = period; i < values.length; i++) {
      let diff = values[i] - values[i - 1];
      if (diff >= 0) {
        gains = (gains * (period - 1) + diff) / period;
        losses = (losses * (period - 1)) / period;
      } else {
        gains = (gains * (period - 1)) / period;
        losses = (losses * (period - 1) - diff) / period;
      }
      rsi[i] = 100 - 100 / (1 + (gains / (losses || 1e-10)));
    }
    for (let i = 0; i < period - 1; i++) rsi[i] = null;
    return rsi;
  }
  function calculateMACD(values, fast = 12, slow = 26, signal = 9) {
    const emaFast = calculateEMA(values, fast);
    const emaSlow = calculateEMA(values, slow);
    let macd = emaFast.map((val, i) => (val !== null && emaSlow[i] !== null) ? val - emaSlow[i] : null);
    let macdSignal = calculateEMA(macd.map(v => v === null ? 0 : v), signal);
    let macdHist = macd.map((v, i) => (v !== null && macdSignal[i] !== null) ? v - macdSignal[i] : null);
    return { macd, macdSignal, macdHist };
  }

  // Build indicator traces
  let indicatorTraces = [];
  if (indicators.includes('sma20')) {
    indicatorTraces.push({
      x: dates,
      y: calculateSMA(close, smaPeriod),
      type: 'scatter',
      mode: 'lines',
      name: `SMA ${smaPeriod}`,
      line: { color: 'orange', width: 2 },
      hoverinfo: 'skip',
      yaxis: 'y',
    });
  }
  if (indicators.includes('ema20')) {
    indicatorTraces.push({
      x: dates,
      y: calculateEMA(close, emaPeriod),
      type: 'scatter',
      mode: 'lines',
      name: `EMA ${emaPeriod}`,
      line: { color: 'purple', width: 2, dash: 'dot' },
      hoverinfo: 'skip',
      yaxis: 'y',
    });
  }

  // Subplot traces
  let subplotTraces = [];
  let rowCount = 1;
  let hasRSI = indicators.includes('rsi14');
  let hasMACD = indicators.includes('macd');
  if (hasRSI) rowCount++;
  if (hasMACD) rowCount++;
  let subplotRow = 2;
  if (hasRSI) {
    subplotTraces.push({
      x: dates,
      y: calculateRSI(close, 14),
      type: 'scatter',
      mode: 'lines',
      name: 'RSI 14',
      line: { color: '#1976d2', width: 2 },
      yaxis: 'y2',
      xaxis: 'x',
      hoverinfo: 'skip',
    });
    subplotRow++;
  }
  if (hasMACD) {
    const { macd, macdSignal, macdHist } = calculateMACD(close, 12, 26, 9);
    subplotTraces.push(
      {
        x: dates,
        y: macd,
        type: 'scatter',
        mode: 'lines',
        name: 'MACD',
        line: { color: '#009688', width: 2 },
        yaxis: hasRSI ? 'y3' : 'y2',
        xaxis: 'x',
        hoverinfo: 'skip',
      },
      {
        x: dates,
        y: macdSignal,
        type: 'scatter',
        mode: 'lines',
        name: 'MACD Signal',
        line: { color: '#e91e63', width: 2, dash: 'dot' },
        yaxis: hasRSI ? 'y3' : 'y2',
        xaxis: 'x',
        hoverinfo: 'skip',
      },
      {
        x: dates,
        y: macdHist,
        type: 'bar',
        name: 'MACD Hist',
        marker: { color: '#bdbdbd' },
        yaxis: hasRSI ? 'y3' : 'y2',
        xaxis: 'x',
        hoverinfo: 'skip',
      }
    );
  }

  // Layout for subplots
  let layout = {
    dragmode: 'zoom',
    margin: { r: 10, t: 25, b: 80, l: 60 },
    showlegend: true,
    xaxis: {
      rangeslider: { visible: false },
      type: 'date',
      tickformat: '%m/%d/%Y',
      tickangle: -45,
      tickmode: 'auto',
      nticks: Math.min(dates.length, 10),
      showline: true,
      linecolor: '#222',
      linewidth: 2,
      mirror: true,
      range: paddedMinDate && paddedMaxDate ? [paddedMinDate.toISOString(), paddedMaxDate.toISOString()] : undefined,
      domain: [0, 1],
      anchor: 'y',
    },
    yaxis: {
      autorange: false,
      fixedrange: false,
      tickprefix: '$',
      showline: true,
      linecolor: '#222',
      linewidth: 2,
      mirror: true,
      domain: [hasRSI && hasMACD ? 0.4 : hasRSI || hasMACD ? 0.3 : 0, 1],
      title: '',
      range: [paddedMinY, paddedMaxY],
    },
    plot_bgcolor: '#fff',
    paper_bgcolor: '#fff',
    font: { family: 'inherit', size: 12 },
    autosize: true,
    legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
  };
  if (hasRSI) {
    layout.yaxis2 = {
      domain: [hasMACD ? 0.2 : 0, hasMACD ? 0.4 : 0.3],
      title: 'RSI',
      showline: true,
      linecolor: '#1976d2',
      linewidth: 2,
      mirror: true,
      range: [0, 100],
      fixedrange: false,
    };
  }
  if (hasMACD) {
    layout.yaxis3 = {
      domain: [0, 0.2],
      title: 'MACD',
      showline: true,
      linecolor: '#009688',
      linewidth: 2,
      mirror: true,
      fixedrange: false,
    };
  }

  return (
    <Plot
      data={[
        {
          x: dates,
          open: open,
          high: high,
          low: low,
          close: close,
          type: 'candlestick',
          xaxis: 'x',
          yaxis: 'y',
          increasing: { line: { color: '#26a69a' } },
          decreasing: { line: { color: '#ef5350' } },
          text: data.map(item => item.datetime),
          hovertemplate:
            'Time: %{text}<br>' +
            'Open: %{open}<br>' +
            'High: %{high}<br>' +
            'Low: %{low}<br>' +
            'Close: %{close}<br>' +
            '<extra></extra>',
        },
        ...indicatorTraces,
        ...subplotTraces
      ]}
      layout={layout}
      config={{ 
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
      }}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true}
    />
  );
}

export default CandlestickChart;

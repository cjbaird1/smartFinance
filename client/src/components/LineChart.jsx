import React from 'react';
import Plot from 'react-plotly.js';
import '../styles/candlestick-chart.css'; // reuse styles

function LineChart({ data, indicators = [] }) {
  if (!data || data.length === 0) return <div>No data to display.</div>;

  const dates = data.map(item => new Date(item.datetime).toISOString());
  const close = data.map(item => parseFloat(item.close));

  // Calculate min and max for y-axis with padding
  const minY = Math.min(...close);
  const maxY = Math.max(...close);
  const yPadding = (maxY - minY) * 0.05; // 5% padding
  const paddedMinY = minY - yPadding;
  const paddedMaxY = maxY + yPadding;

  // --- Indicator Calculations (reuse from CandlestickChart) ---
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

  // Build indicator traces
  let indicatorTraces = [];
  if (indicators.includes('sma20')) {
    indicatorTraces.push({
      x: dates,
      y: calculateSMA(close, 20),
      type: 'scatter',
      mode: 'lines',
      name: 'SMA 20',
      line: { color: 'orange', width: 2 },
      hoverinfo: 'skip',
    });
  }
  if (indicators.includes('ema20')) {
    indicatorTraces.push({
      x: dates,
      y: calculateEMA(close, 20),
      type: 'scatter',
      mode: 'lines',
      name: 'EMA 20',
      line: { color: 'purple', width: 2, dash: 'dot' },
      hoverinfo: 'skip',
    });
  }

  return (
    <Plot
      data={[
        {
          x: dates,
          y: close,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Close',
          line: { color: '#1976d2', width: 2 },
        },
        ...indicatorTraces
      ]}
      layout={{
        margin: { r: 10, t: 25, b: 80, l: 60 },
        showlegend: true,
        xaxis: {
          type: 'date',
          tickformat: '%m/%d/%Y',
          tickangle: -45,
          nticks: Math.min(dates.length, 10),
        },
        yaxis: {
          autorange: false,
          fixedrange: false,
          tickprefix: '$',
          range: [paddedMinY, paddedMaxY],
        },
        plot_bgcolor: '#fff',
        paper_bgcolor: '#fff',
        font: { family: 'inherit', size: 12 },
        autosize: true,
        legend: { orientation: 'h', y: -0.15, x: 0.5, xanchor: 'center' },
      }}
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

export default LineChart; 
import React, { useState } from 'react';
import '../styles/chart-toolbar.css';
import '../styles/indicator-dropdown.css';
import Tooltip from './Tooltip';
import Modal from './Modal';
import ChartSettingsModal from './ChartSettingsModal';
import { Link } from 'react-router-dom';

const SPEED_LABELS = [
  { value: 1, label: 'Slow' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Fast' },
];

const defaultSettings = {
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

const ChartToolbar = ({ speed, setSpeed, isPlaying, onPlayPause, onStep, onStepBack, currentTimeframe, canStepBack, chartSettings, onChartSettingsChange, showMlSignals, onToggleMlSignals, selectedIndicator, onIndicatorChange }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(chartSettings || defaultSettings);

  const openSettings = () => {
    setTempSettings(chartSettings || defaultSettings);
    setShowSettings(true);
  };
  const handleCancel = () => setShowSettings(false);
  const handleOk = () => {
    onChartSettingsChange(tempSettings);
    setShowSettings(false);
  };

  return (
    <div className="chart-toolbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="toolbar-timeframe">{currentTimeframe}</span>
        <div className="toolbar-slider-container">
          <input
            type="range"
            min={1}
            max={15}
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
            className="toolbar-slider"
            step={1}
            list="speed-ticks"
          />
          <datalist id="speed-ticks">
            {[...Array(15)].map((_, i) => (
              <option key={i+1} value={i+1} label={(i+1).toString()} />
            ))}
          </datalist>
        </div>
        <span className="toolbar-label">Speed: {speed}</span>
        <Tooltip content={canStepBack ? 'Go back one step' : 'Cannot go back further'}>
          <button onClick={onStepBack} className="toolbar-btn" aria-label="Step Back" disabled={!canStepBack}>
            <span>&#124;&#9664;</span>
          </button>
        </Tooltip>
        <Tooltip content={isPlaying ? 'Pause simulation' : 'Start simulation'}>
          <button onClick={onPlayPause} className="toolbar-btn" aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <span>&#10073;&#10073;</span> : <span>&#9654;</span>}
          </button>
        </Tooltip>
        <Tooltip content="Advance one step">
          <button onClick={onStep} className="toolbar-btn" aria-label="Step">
            <span>&#9654;&#124;</span>
          </button>
        </Tooltip>
        <Tooltip content="Turn on {fix this} Buy/Sell Signals">
          <label style={{ display: 'flex', alignItems: 'center', marginLeft: 16, cursor: 'pointer', fontSize: 14 }}>
            <input
              type="checkbox"
              checked={showMlSignals}
              onChange={e => onToggleMlSignals(e.target.checked)}
              style={{ marginRight: 6 }}
            />
            Show ML Signals
          </label>
        </Tooltip>
        {/* Quick Indicator Selection */}
        <Tooltip content="Select technical indicator">
          <select
            value={selectedIndicator || ''}
            onChange={e => onIndicatorChange(e.target.value)}
            className="indicator-dropdown-select"
          >
            <option value="">No Indicator</option>
            <option value="sma">SMA (20)</option>
            <option value="ema">EMA (20)</option>
            <option value="rsi">RSI (14)</option>
            <option value="macd">MACD</option>
          </select>
        </Tooltip>
        {/* Education Center Link */}
        <Tooltip content="Learn about technical indicators">
          <Link
            to="/education#basic-technical-indicators"
            className="toolbar-edu-link"
            aria-label="Learn about technical indicators"
            style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', fontSize: 14, textDecoration: 'underline', color: '#3b82f6', fontWeight: 500 }}
          >
            <span role="img" aria-label="book" style={{ marginRight: 4 }}>📘</span>
            Learn Indicators
          </Link>
        </Tooltip>
      </div>
      <div style={{ flex: 1 }} />
      <Tooltip content="Chart settings">
        <button
          className="toolbar-btn"
          aria-label="Chart settings"
          onClick={openSettings}
          style={{ marginLeft: 12, fontSize: 20 }}
        >
          &#9881;
        </button>
      </Tooltip>
      {showSettings && (
        <Modal onClose={handleCancel}>
          <ChartSettingsModal
            settings={tempSettings}
            onChange={setTempSettings}
            onCancel={handleCancel}
            onOk={handleOk}
          />
        </Modal>
      )}
    </div>
  );
};

export default ChartToolbar; 
import React, { useState } from 'react';
import '../styles/chart-toolbar.css';
import Tooltip from './Tooltip';
import Modal from './Modal';
import ChartSettingsModal from './ChartSettingsModal';

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

const ChartToolbar = ({ speed, setSpeed, isPlaying, onPlayPause, onStep, onStepBack, currentTimeframe, canStepBack, chartSettings, onChartSettingsChange }) => {
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
        <div className="slider-labels">
          {[...Array(15)].map((_, i) => (
            <span key={i+1} className="slider-label">{i+1}</span>
          ))}
        </div>
      </div>
      <span className="toolbar-label">Speed: {speed}</span>
      <Tooltip content={isPlaying ? 'Pause simulation' : 'Start simulation'}>
        <button onClick={onPlayPause} className="toolbar-btn" aria-label={isPlaying ? 'Pause' : 'Play'}>
          {isPlaying ? <span>&#10073;&#10073;</span> : <span>&#9654;</span>}
        </button>
      </Tooltip>
      <span className="toolbar-timeframe">{currentTimeframe}</span>
      <Tooltip content={canStepBack ? 'Go back one step' : 'Cannot go back further'}>
        <button onClick={onStepBack} className="toolbar-btn" aria-label="Step Back" disabled={!canStepBack}>
          <span>&#124;&#9664;</span>
        </button>
      </Tooltip>
      <Tooltip content="Advance one step">
        <button onClick={onStep} className="toolbar-btn" aria-label="Step">
          <span>&#9654;&#124;</span>
        </button>
      </Tooltip>
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
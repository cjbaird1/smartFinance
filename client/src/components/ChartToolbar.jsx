import React from 'react';
import '../styles/chart-toolbar.css';

const SPEED_LABELS = [
  { value: 1, label: 'Slow' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Fast' },
];

const ChartToolbar = ({ speed, setSpeed, isPlaying, onPlayPause, onStep, currentTimeframe }) => {
  return (
    <div className="chart-toolbar">
      <input
        type="range"
        min={1}
        max={3}
        value={speed}
        onChange={e => setSpeed(Number(e.target.value))}
        className="toolbar-slider"
      />
      <span className="toolbar-label">{SPEED_LABELS.find(s => s.value === speed)?.label}</span>
      <button onClick={onPlayPause} className="toolbar-btn" aria-label={isPlaying ? 'Pause' : 'Play'}>
        {isPlaying ? <span>&#10073;&#10073;</span> : <span>&#9654;</span>}
      </button>
      <span className="toolbar-timeframe">{currentTimeframe}</span>
      <button onClick={onStep} className="toolbar-btn" aria-label="Step">
        <span>&#9654;&#124;</span>
      </button>
    </div>
  );
};

export default ChartToolbar; 
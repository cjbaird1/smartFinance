import React, { useState, useEffect } from 'react';
import Button from './Button';
import '../styles/trade-simulator-page.css';
import '../styles/custom-scrollbar.css';
import Tooltip from './Tooltip';

export default function ChartSettingsModal({
  settings,
  onChange,
  onCancel,
  onOk
}) {
  const [activeTab, setActiveTab] = useState('chart'); // 'chart' or 'indicators'

  // Local state for period fields as strings
  const [smaPeriod, setSmaPeriod] = useState(settings.indicators.sma.period.toString());
  const [emaPeriod, setEmaPeriod] = useState(settings.indicators.ema.period.toString());
  const [rsiPeriod, setRsiPeriod] = useState(settings.indicators.rsi.period.toString());
  const [macdFast, setMacdFast] = useState(settings.indicators.macd.fastPeriod.toString());
  const [macdSlow, setMacdSlow] = useState(settings.indicators.macd.slowPeriod.toString());
  const [macdSignal, setMacdSignal] = useState(settings.indicators.macd.signalPeriod.toString());

  // Keep local state in sync if modal is reopened with different settings
  useEffect(() => {
    setSmaPeriod(settings.indicators.sma.period.toString());
    setEmaPeriod(settings.indicators.ema.period.toString());
    setRsiPeriod(settings.indicators.rsi.period.toString());
    setMacdFast(settings.indicators.macd.fastPeriod.toString());
    setMacdSlow(settings.indicators.macd.slowPeriod.toString());
    setMacdSignal(settings.indicators.macd.signalPeriod.toString());
  }, [settings]);

  // Helper to validate and clamp period
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  // On blur or confirm, validate and update parent
  const handlePeriodBlur = (indicator, value, min, max, setLocal) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) num = min;
    num = clamp(num, min, max);
    setLocal(num.toString());
    handleIndicatorChange(indicator.type, indicator.field, num);
  };

  // On modal confirm, validate all and update parent
  const handleOk = () => {
    const smaNum = clamp(parseInt(smaPeriod, 10) || 1, 1, 200);
    const emaNum = clamp(parseInt(emaPeriod, 10) || 1, 1, 200);
    const rsiNum = clamp(parseInt(rsiPeriod, 10) || 2, 2, 50);
    const macdFastNum = clamp(parseInt(macdFast, 10) || 2, 2, 50);
    // MACD slow must be at least 1 more than fast
    let macdSlowMin = Math.max(3, macdFastNum + 1);
    let macdSlowNum = clamp(parseInt(macdSlow, 10) || macdSlowMin, macdSlowMin, 100);
    const macdSignalNum = clamp(parseInt(macdSignal, 10) || 2, 2, 50);
    // Update all in parent
    handleIndicatorChange('sma', 'period', smaNum);
    handleIndicatorChange('ema', 'period', emaNum);
    handleIndicatorChange('rsi', 'period', rsiNum);
    handleIndicatorChange('macd', 'fastPeriod', macdFastNum);
    handleIndicatorChange('macd', 'slowPeriod', macdSlowNum);
    handleIndicatorChange('macd', 'signalPeriod', macdSignalNum);
    onOk();
  };

  const handleColor = (key, value) => onChange({ ...settings, [key]: value });
  const handleCheckbox = (key, value) => onChange({ ...settings, [key]: value });
  const handleSelect = (key, value) => onChange({ ...settings, [key]: value });

  // Indicator settings handlers
  const handleIndicatorChange = (indicatorType, field, value) => {
    const updatedIndicators = {
      ...settings.indicators,
      [indicatorType]: {
        ...settings.indicators[indicatorType],
        [field]: value
      }
    };
    onChange({ ...settings, indicators: updatedIndicators });
  };

  const handleIndicatorToggle = (indicatorType, enabled) => {
    handleIndicatorChange(indicatorType, 'enabled', enabled);
  };

  // Helper for consistent input styling
  const periodInputClass =
    "bg-bg-panel text-text-main border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent border-border w-20";
  // Add a helper for select fields
  const selectInputClass =
    "bg-bg-panel text-text-main border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent border-border";

  return (
    <div className="bg-[#181A20] text-[#F4F4F4] rounded-xl shadow-2xl min-w-96 max-w-md p-8 relative h-[600px] flex flex-col w-[420px]">
      {/* Close button */}
      <button className="absolute top-4 right-4 text-2xl text-[#A0A4AE] hover:text-[#F4F4F4] transition-colors" onClick={onCancel} aria-label="Close">&times;</button>
      <h2 className="text-xl font-semibold mb-6">Chart Settings</h2>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-[#282B33] mb-5 gap-0 flex-shrink-0">
        <button
          onClick={() => setActiveTab('chart')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'chart' 
              ? 'bg-bg-secondary text-text-main font-semibold border-b-2 border-blue-500' 
              : 'bg-transparent text-text-secondary hover:text-text-main'
          }`}
        >
          Chart Settings
        </button>
        <button
          onClick={() => setActiveTab('indicators')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'indicators' 
              ? 'bg-bg-secondary text-text-main font-semibold border-b-2 border-blue-500' 
              : 'bg-transparent text-text-secondary hover:text-text-main'
          }`}
        >
          Indicator Settings
        </button>
      </div>

      {/* Content Container with Scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 scrollbar-thin scrollbar-thumb-[#23262F] scrollbar-track-[#181A20]">
        {/* Chart Settings Tab */}
        {activeTab === 'chart' && (
          <div>
            <div className="font-semibold my-4 text-sm tracking-wide uppercase text-[#A0A4AE]">CANDLES</div>
            {/* Body Row */}
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0 w-6 flex justify-center">
                <input type="checkbox" checked={settings.showBody} onChange={e => handleCheckbox('showBody', e.target.checked)} id="body" className="accent-blue-500 w-4 h-4" />
              </div>
              <div className="w-20 min-w-[80px] flex-shrink-0">
                <label htmlFor="body" className="font-medium text-sm select-none">Body</label>
              </div>
              <div className="flex gap-2 ml-4">
                <Tooltip content="Body Up Color">
                  <input type="color" value={settings.bodyUp} onChange={e => handleColor('bodyUp', e.target.value)} className="w-7 h-7 rounded border border-black cursor-pointer" />
                </Tooltip>
                <Tooltip content="Body Down Color">
                  <input type="color" value={settings.bodyDown} onChange={e => handleColor('bodyDown', e.target.value)} className="w-7 h-7 rounded border border-black cursor-pointer" />
                </Tooltip>
              </div>
            </div>
            {/* Borders Row */}
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0 w-6 flex justify-center">
                <input type="checkbox" checked={settings.showBorders} onChange={e => handleCheckbox('showBorders', e.target.checked)} id="borders" className="accent-blue-500 w-4 h-4" />
              </div>
              <div className="w-20 min-w-[80px] flex-shrink-0">
                <label htmlFor="borders" className="font-medium text-sm select-none">Borders</label>
              </div>
              <div className="flex gap-2 ml-4">
                <Tooltip content="Borders Up Color">
                  <input type="color" value={settings.bordersUp} onChange={e => handleColor('bordersUp', e.target.value)} className="w-7 h-7 rounded border border-black cursor-pointer" />
                </Tooltip>
                <Tooltip content="Borders Down Color">
                  <input type="color" value={settings.bordersDown} onChange={e => handleColor('bordersDown', e.target.value)} className="w-7 h-7 rounded border border-black cursor-pointer" />
                </Tooltip>
              </div>
            </div>
            {/* Wick Row */}
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0 w-6 flex justify-center">
                <input type="checkbox" checked={settings.showWick} onChange={e => handleCheckbox('showWick', e.target.checked)} id="wick" className="accent-blue-500 w-4 h-4" />
              </div>
              <div className="w-20 min-w-[80px] flex-shrink-0">
                <label htmlFor="wick" className="font-medium text-sm select-none">Wick</label>
              </div>
              <div className="flex gap-2 ml-4">
                <Tooltip content="Wick Up Color">
                  <input type="color" value={settings.wickUp} onChange={e => handleColor('wickUp', e.target.value)} className="w-7 h-7 rounded border border-black cursor-pointer" />
                </Tooltip>
                <Tooltip content="Wick Down Color">
                  <input type="color" value={settings.wickDown} onChange={e => handleColor('wickDown', e.target.value)} className="w-7 h-7 rounded border border-black cursor-pointer" />
                </Tooltip>
              </div>
            </div>
            <div className="border-t border-border-primary my-4"></div>
            <div className="font-semibold my-4 text-sm tracking-wide uppercase text-[#A0A4AE]">DATA MODIFICATION</div>
            <div className="flex gap-4 mb-4">
              <div className="flex-1 flex flex-col">
                <label className="font-medium text-sm mb-1">Precision</label>
                <select value={settings.precision} onChange={e => handleSelect('precision', e.target.value)} className={selectInputClass}>
                  <option value="default">Default</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <div className="flex-1 flex flex-col">
                <label className="font-medium text-sm mb-1">Timezone</label>
                <select value={settings.timezone} onChange={e => handleSelect('timezone', e.target.value)} className={selectInputClass}>
                  <option value="UTC">UTC</option>
                  <option value="Local">Local</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Indicator Settings Tab */}
        {activeTab === 'indicators' && (
          <div>
            <div className="bg-bg-secondary p-3 rounded-md mb-4 border border-border-primary text-sm text-text-secondary">
              💡 <strong>Quick Tip:</strong> You can also quickly select indicators using the dropdown in the toolbar. Use this panel for customizing periods and colors.
            </div>
            <div className="font-semibold my-4 text-sm tracking-wide uppercase text-[#A0A4AE]">TECHNICAL INDICATORS</div>
            
            {/* SMA Settings */}
            <div className="bg-bg-secondary p-4 rounded-lg mb-3 border border-border-primary">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">Simple Moving Average (SMA)</div>
                <input 
                  type="checkbox" 
                  checked={settings.indicators.sma.enabled} 
                  onChange={e => handleIndicatorToggle('sma', e.target.checked)}
                  className="w-4 h-4 text-blue-500 bg-bg-main border-border-primary rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 flex flex-col">
                  <label className="font-medium text-sm mb-1">Period</label>
                  <input 
                    type="number" 
                    value={smaPeriod}
                    onChange={e => setSmaPeriod(e.target.value)}
                    onBlur={() => handlePeriodBlur({type: 'sma', field: 'period'}, smaPeriod, 1, 200, setSmaPeriod)}
                    min="1"
                    max="200"
                    className={periodInputClass}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="font-medium text-sm mb-1">Color</label>
                  <input 
                    type="color" 
                    value={settings.indicators.sma.color} 
                    onChange={e => handleIndicatorChange('sma', 'color', e.target.value)}
                    className="w-8 h-8 rounded border border-[#282B33] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* EMA Settings */}
            <div className="bg-bg-secondary p-4 rounded-lg mb-3 border border-border-primary">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">Exponential Moving Average (EMA)</div>
                <input 
                  type="checkbox" 
                  checked={settings.indicators.ema.enabled} 
                  onChange={e => handleIndicatorToggle('ema', e.target.checked)}
                  className="w-4 h-4 text-blue-500 bg-bg-main border-border-primary rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 flex flex-col">
                  <label className="font-medium text-sm mb-1">Period</label>
                  <input 
                    type="number" 
                    value={emaPeriod}
                    onChange={e => setEmaPeriod(e.target.value)}
                    onBlur={() => handlePeriodBlur({type: 'ema', field: 'period'}, emaPeriod, 1, 200, setEmaPeriod)}
                    min="1"
                    max="200"
                    className={periodInputClass}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="font-medium text-sm mb-1">Color</label>
                  <input 
                    type="color" 
                    value={settings.indicators.ema.color} 
                    onChange={e => handleIndicatorChange('ema', 'color', e.target.value)}
                    className="w-8 h-8 rounded border border-[#282B33] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* RSI Settings */}
            <div className="bg-bg-secondary p-4 rounded-lg mb-3 border border-border-primary">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">Relative Strength Index (RSI)</div>
                <input 
                  type="checkbox" 
                  checked={settings.indicators.rsi.enabled} 
                  onChange={e => handleIndicatorToggle('rsi', e.target.checked)}
                  className="w-4 h-4 text-blue-500 bg-bg-main border-border-primary rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 flex flex-col">
                  <label className="font-medium text-sm mb-1">Period</label>
                  <input 
                    type="number" 
                    value={rsiPeriod}
                    onChange={e => setRsiPeriod(e.target.value)}
                    onBlur={() => handlePeriodBlur({type: 'rsi', field: 'period'}, rsiPeriod, 2, 50, setRsiPeriod)}
                    min="2"
                    max="50"
                    className={periodInputClass}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="font-medium text-sm mb-1">Color</label>
                  <input 
                    type="color" 
                    value={settings.indicators.rsi.color} 
                    onChange={e => handleIndicatorChange('rsi', 'color', e.target.value)}
                    className="w-8 h-8 rounded border border-[#282B33] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* MACD Settings */}
            <div className="bg-bg-secondary p-4 rounded-lg mb-3 border border-border-primary">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold text-sm">MACD</div>
                <input 
                  type="checkbox" 
                  checked={settings.indicators.macd.enabled} 
                  onChange={e => handleIndicatorToggle('macd', e.target.checked)}
                  className="w-4 h-4 text-blue-500 bg-bg-main border-border-primary rounded focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 flex flex-col">
                  <label className="font-medium text-sm mb-1">Fast Period</label>
                  <input 
                    type="number" 
                    value={macdFast}
                    onChange={e => setMacdFast(e.target.value)}
                    onBlur={() => handlePeriodBlur({type: 'macd', field: 'fastPeriod'}, macdFast, 2, 50, setMacdFast)}
                    min="2"
                    max="50"
                    className={periodInputClass}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="font-medium text-sm mb-1">Slow Period</label>
                  <input 
                    type="number" 
                    value={macdSlow}
                    onChange={e => setMacdSlow(e.target.value)}
                    onBlur={() => handlePeriodBlur({type: 'macd', field: 'slowPeriod'}, macdSlow, Math.max(3, parseInt(macdFast, 10) + 1 || 3), 100, setMacdSlow)}
                    min={Math.max(3, parseInt(macdFast, 10) + 1 || 3)}
                    max="100"
                    className={periodInputClass}
                  />
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <div className="flex-1 flex flex-col">
                  <label className="font-medium text-sm mb-1">Signal Period</label>
                  <input 
                    type="number" 
                    value={macdSignal}
                    onChange={e => setMacdSignal(e.target.value)}
                    onBlur={() => handlePeriodBlur({type: 'macd', field: 'signalPeriod'}, macdSignal, 2, 50, setMacdSignal)}
                    min="2"
                    max="50"
                    className={periodInputClass}
                  />
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="font-medium text-sm mb-1">Color</label>
                  <input 
                    type="color" 
                    value={settings.indicators.macd.color} 
                    onChange={e => handleIndicatorChange('macd', 'color', e.target.value)}
                    className="w-8 h-8 rounded border border-[#282B33] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6 justify-center flex-shrink-0">
        <Button variant="filter" onClick={onCancel} className="min-w-[90px]">Cancel</Button>
        <Button variant="search" onClick={handleOk} className="min-w-[90px]">Ok</Button>
      </div>
    </div>
  );
} 
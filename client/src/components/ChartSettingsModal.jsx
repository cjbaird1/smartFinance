import React, { useState, useEffect } from 'react';
import Button from './Button';
import '../styles/trade-simulator-page.css';
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

  return (
    <div className="order-modal" style={{ position: 'relative', height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Close button */}
      <button className="modal-close-btn" onClick={onCancel} aria-label="Close">&times;</button>
      <h2 className="modal-title">Chart Settings</h2>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #333', 
        marginBottom: '20px',
        gap: '0',
        flexShrink: 0
      }}>
        <button
          onClick={() => setActiveTab('chart')}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: activeTab === 'chart' ? '#333' : 'transparent',
            border: 'none',
            color: activeTab === 'chart' ? '#fff' : '#aaa',
            cursor: 'pointer',
            fontWeight: activeTab === 'chart' ? '600' : '400',
            fontSize: '14px',
            borderBottom: activeTab === 'chart' ? '2px solid #3b82f6' : 'none'
          }}
        >
          Chart Settings
        </button>
        <button
          onClick={() => setActiveTab('indicators')}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: activeTab === 'indicators' ? '#333' : 'transparent',
            border: 'none',
            color: activeTab === 'indicators' ? '#fff' : '#aaa',
            cursor: 'pointer',
            fontWeight: activeTab === 'indicators' ? '600' : '400',
            fontSize: '14px',
            borderBottom: activeTab === 'indicators' ? '2px solid #3b82f6' : 'none'
          }}
        >
          Indicator Settings
        </button>
      </div>

      {/* Content Container with Scroll */}
      <div className="modal-scrollable-content" style={{ 
        flex: 1, 
        overflowY: 'auto', 
        overflowX: 'hidden',
        paddingRight: '8px'
      }}>
        {/* Chart Settings Tab */}
        {activeTab === 'chart' && (
          <div>
            <div style={{ fontWeight: 600, margin: '18px 0 8px 0', fontSize: 13, letterSpacing: 0.5 }}>CANDLES</div>
            <div className="order-modal-row">
              <div className="order-modal-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={settings.showBody} onChange={e => handleCheckbox('showBody', e.target.checked)} id="body" style={{ marginRight: 8 }} />
                <label htmlFor="body" style={{ minWidth: 70, fontWeight: 500, marginRight: 8, fontSize: 14 }}>Body</label>
                <Tooltip content="Body Up Color">
                  <input type="color" value={settings.bodyUp} onChange={e => handleColor('bodyUp', e.target.value)} className="color-picker-square" />
                </Tooltip>
                <Tooltip content="Body Down Color">
                  <input type="color" value={settings.bodyDown} onChange={e => handleColor('bodyDown', e.target.value)} className="color-picker-square" />
                </Tooltip>
              </div>
            </div>
            <div className="order-modal-row">
              <div className="order-modal-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={settings.showBorders} onChange={e => handleCheckbox('showBorders', e.target.checked)} id="borders" style={{ marginRight: 8 }} />
                <label htmlFor="borders" style={{ minWidth: 70, fontWeight: 500, marginRight: 8, fontSize: 14 }}>Borders</label>
                <Tooltip content="Borders Up Color">
                  <input type="color" value={settings.bordersUp} onChange={e => handleColor('bordersUp', e.target.value)} className="color-picker-square" />
                </Tooltip>
                <Tooltip content="Borders Down Color">
                  <input type="color" value={settings.bordersDown} onChange={e => handleColor('bordersDown', e.target.value)} className="color-picker-square" />
                </Tooltip>
              </div>
            </div>
            <div className="order-modal-row">
              <div className="order-modal-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={settings.showWick} onChange={e => handleCheckbox('showWick', e.target.checked)} id="wick" style={{ marginRight: 8 }} />
                <label htmlFor="wick" style={{ minWidth: 70, fontWeight: 500, marginRight: 8, fontSize: 14 }}>Wick</label>
                <Tooltip content="Wick Up Color">
                  <input type="color" value={settings.wickUp} onChange={e => handleColor('wickUp', e.target.value)} className="color-picker-square" />
                </Tooltip>
                <Tooltip content="Wick Down Color">
                  <input type="color" value={settings.wickDown} onChange={e => handleColor('wickDown', e.target.value)} className="color-picker-square" />
                </Tooltip>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #333', margin: '18px 0' }}></div>
            <div style={{ fontWeight: 600, margin: '18px 0 8px 0', fontSize: 13, letterSpacing: 0.5 }}>DATA MODIFICATION</div>
            <div className="order-modal-row">
              <div className="order-modal-field">
                <label style={{ fontWeight: 500, fontSize: 14 }}>Precision</label>
                <select value={settings.precision} onChange={e => handleSelect('precision', e.target.value)}>
                  <option value="default">Default</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <div className="order-modal-field">
                <label style={{ fontWeight: 500, fontSize: 14 }}>Timezone</label>
                <select value={settings.timezone} onChange={e => handleSelect('timezone', e.target.value)}>
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
            <div style={{ 
              background: '#1a1d24', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '16px',
              border: '1px solid #333',
              fontSize: 13,
              color: '#aaa'
            }}>
              💡 <strong>Quick Tip:</strong> You can also quickly select indicators using the dropdown in the toolbar. Use this panel for customizing periods and colors.
            </div>
            <div style={{ fontWeight: 600, margin: '18px 0 8px 0', fontSize: 13, letterSpacing: 0.5 }}>TECHNICAL INDICATORS</div>
            
            {/* SMA Settings */}
            <div style={{ 
              background: '#1a1d24', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '12px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Simple Moving Average (SMA)</div>
                <input 
                  type="checkbox" 
                  checked={settings.indicators.sma.enabled} 
                  onChange={e => handleIndicatorToggle('sma', e.target.checked)}
                />
              </div>
              <div className="order-modal-row">
                <div className="order-modal-field">
                  <label style={{ fontWeight: 500, fontSize: 14 }}>Period</label>
                  <input 
                    type="number" 
                    value={smaPeriod}
                    onChange={e => setSmaPeriod(e.target.value)}
                    onBlur={() => handlePeriodBlur({type: 'sma', field: 'period'}, smaPeriod, 1, 200, setSmaPeriod)}
                    min="1"
                    max="200"
                    style={{ width: '80px' }}
                  />
                </div>
                <div className="order-modal-field">
                  <label style={{ fontWeight: 500, fontSize: 14 }}>Color</label>
                  <input 
                    type="color" 
                    value={settings.indicators.sma.color} 
                    onChange={e => handleIndicatorChange('sma', 'color', e.target.value)}
                    className="color-picker-square"
                  />
                </div>
              </div>
            </div>

            {/* EMA Settings */}
            <div style={{ 
              background: '#1a1d24', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '12px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Exponential Moving Average (EMA)</div>
                <input 
                  type="checkbox" 
                  checked={settings.indicators.ema.enabled} 
                  onChange={e => handleIndicatorToggle('ema', e.target.checked)}
                />
              </div>
              <div className="order-modal-row">
                <div className="order-modal-field">
                  <label style={{ fontWeight: 500, fontSize: 14 }}>Period</label>
                  <input 
                    type="number" 
                    value={emaPeriod}
                    onChange={e => setEmaPeriod(e.target.value)}
                    onBlur={() => handlePeriodBlur({type: 'ema', field: 'period'}, emaPeriod, 1, 200, setEmaPeriod)}
                    min="1"
                    max="200"
                    style={{ width: '80px' }}
                  />
                </div>
                <div className="order-modal-field">
                  <label style={{ fontWeight: 500, fontSize: 14 }}>Color</label>
                  <input 
                    type="color" 
                    value={settings.indicators.ema.color} 
                    onChange={e => handleIndicatorChange('ema', 'color', e.target.value)}
                    className="color-picker-square"
                  />
                </div>
              </div>
            </div>

            {/* RSI Settings */}
            <div style={{ 
              background: '#1a1d24', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '12px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Relative Strength Index (RSI)</div>
                <input 
                  type="checkbox" 
                  checked={settings.indicators.rsi.enabled} 
                  onChange={e => handleIndicatorToggle('rsi', e.target.checked)}
                />
              </div>
              <div className="order-modal-row">
                <div className="order-modal-field">
                  <label style={{ fontWeight: 500, fontSize: 14 }}>Period</label>
                  <input 
                    type="number" 
                    value={rsiPeriod}
                    onChange={e => setRsiPeriod(e.target.value)}
                    onBlur={() => handlePeriodBlur({type: 'rsi', field: 'period'}, rsiPeriod, 2, 50, setRsiPeriod)}
                    min="2"
                    max="50"
                    style={{ width: '80px' }}
                  />
                </div>
                <div className="order-modal-field">
                  <label style={{ fontWeight: 500, fontSize: 14 }}>Color</label>
                  <input 
                    type="color" 
                    value={settings.indicators.rsi.color} 
                    onChange={e => handleIndicatorChange('rsi', 'color', e.target.value)}
                    className="color-picker-square"
                  />
                </div>
              </div>
            </div>

            {/* MACD Settings */}
            <div style={{ 
              background: '#1a1d24', 
              padding: '16px', 
              borderRadius: '8px', 
              marginBottom: '12px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>MACD</div>
                <input 
                  type="checkbox" 
                  checked={settings.indicators.macd.enabled} 
                  onChange={e => handleIndicatorToggle('macd', e.target.checked)}
                />
              </div>
              <div className="order-modal-row">
                <div className="order-modal-field">
                  <label style={{ fontWeight: 500, fontSize: 14 }}>Fast Period</label>
                  <input 
                    type="number" 
                    value={macdFast}
                    onChange={e => setMacdFast(e.target.value)}
                    onBlur={() => handlePeriodBlur({type: 'macd', field: 'fastPeriod'}, macdFast, 2, 50, setMacdFast)}
                    min="2"
                    max="50"
                    style={{ width: '80px' }}
                  />
                </div>
                <div className="order-modal-field">
                  <label style={{ fontWeight: 500, fontSize: 14 }}>Slow Period</label>
                  <input 
                    type="number" 
                    value={macdSlow}
                    onChange={e => setMacdSlow(e.target.value)}
                    onBlur={() => handlePeriodBlur({type: 'macd', field: 'slowPeriod'}, macdSlow, Math.max(3, parseInt(macdFast, 10) + 1 || 3), 100, setMacdSlow)}
                    min={Math.max(3, parseInt(macdFast, 10) + 1 || 3)}
                    max="100"
                    style={{ width: '80px' }}
                  />
                </div>
              </div>
              <div className="order-modal-row">
                <div className="order-modal-field">
                  <label style={{ fontWeight: 500, fontSize: 14 }}>Signal Period</label>
                  <input 
                    type="number" 
                    value={macdSignal}
                    onChange={e => setMacdSignal(e.target.value)}
                    onBlur={() => handlePeriodBlur({type: 'macd', field: 'signalPeriod'}, macdSignal, 2, 50, setMacdSignal)}
                    min="2"
                    max="50"
                    style={{ width: '80px' }}
                  />
                </div>
                <div className="order-modal-field">
                  <label style={{ fontWeight: 500, fontSize: 14 }}>Color</label>
                  <input 
                    type="color" 
                    value={settings.indicators.macd.color} 
                    onChange={e => handleIndicatorChange('macd', 'color', e.target.value)}
                    className="color-picker-square"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="order-modal-actions" style={{ flexShrink: 0 }}>
        <Button variant="filter" onClick={onCancel} style={{ minWidth: 90 }}>Cancel</Button>
        <Button variant="search" onClick={handleOk} style={{ minWidth: 90 }}>Ok</Button>
      </div>
    </div>
  );
} 
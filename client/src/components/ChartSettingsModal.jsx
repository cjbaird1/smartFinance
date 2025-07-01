import React from 'react';
import Button from './Button';
import '../styles/trade-simulator-page.css';

export default function ChartSettingsModal({
  settings,
  onChange,
  onCancel,
  onOk
}) {
  const handleColor = (key, value) => onChange({ ...settings, [key]: value });
  const handleCheckbox = (key, value) => onChange({ ...settings, [key]: value });
  const handleSelect = (key, value) => onChange({ ...settings, [key]: value });

  return (
    <div className="order-modal" style={{ position: 'relative' }}>
      {/* Close button */}
      <button className="modal-close-btn" onClick={onCancel} aria-label="Close">&times;</button>
      <h2 className="modal-title">Chart settings</h2>
      <div style={{ fontWeight: 600, margin: '18px 0 8px 0', fontSize: 13, letterSpacing: 0.5 }}>CANDLES</div>
      <div className="order-modal-row">
        <div className="order-modal-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={settings.showBody} onChange={e => handleCheckbox('showBody', e.target.checked)} id="body" style={{ marginRight: 8 }} />
          <label htmlFor="body" style={{ minWidth: 70, fontWeight: 500, marginRight: 8 }}>Body</label>
          <input type="color" value={settings.bodyUp} onChange={e => handleColor('bodyUp', e.target.value)} className="color-picker-square" title="Body Up Color" />
          <input type="color" value={settings.bodyDown} onChange={e => handleColor('bodyDown', e.target.value)} className="color-picker-square" title="Body Down Color" />
        </div>
      </div>
      <div className="order-modal-row">
        <div className="order-modal-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={settings.showBorders} onChange={e => handleCheckbox('showBorders', e.target.checked)} id="borders" style={{ marginRight: 8 }} />
          <label htmlFor="borders" style={{ minWidth: 70, fontWeight: 500, marginRight: 8 }}>Borders</label>
          <input type="color" value={settings.bordersUp} onChange={e => handleColor('bordersUp', e.target.value)} className="color-picker-square" title="Borders Up Color" />
          <input type="color" value={settings.bordersDown} onChange={e => handleColor('bordersDown', e.target.value)} className="color-picker-square" title="Borders Down Color" />
        </div>
      </div>
      <div className="order-modal-row">
        <div className="order-modal-field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={settings.showWick} onChange={e => handleCheckbox('showWick', e.target.checked)} id="wick" style={{ marginRight: 8 }} />
          <label htmlFor="wick" style={{ minWidth: 70, fontWeight: 500, marginRight: 8 }}>Wick</label>
          <input type="color" value={settings.wickUp} onChange={e => handleColor('wickUp', e.target.value)} className="color-picker-square" title="Wick Up Color" />
          <input type="color" value={settings.wickDown} onChange={e => handleColor('wickDown', e.target.value)} className="color-picker-square" title="Wick Down Color" />
        </div>
      </div>
      <div style={{ borderTop: '1px solid #333', margin: '18px 0' }}></div>
      <div style={{ fontWeight: 600, margin: '18px 0 8px 0', fontSize: 13, letterSpacing: 0.5 }}>DATA MODIFICATION</div>
      <div className="order-modal-row">
        <div className="order-modal-field">
          <label style={{ fontWeight: 500 }}>Precision</label>
          <select value={settings.precision} onChange={e => handleSelect('precision', e.target.value)}>
            <option value="default">Default</option>
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </div>
        <div className="order-modal-field">
          <label style={{ fontWeight: 500 }}>Timezone</label>
          <select value={settings.timezone} onChange={e => handleSelect('timezone', e.target.value)}>
            <option value="UTC">UTC</option>
            <option value="Local">Local</option>
          </select>
        </div>
      </div>
      <div className="order-modal-actions">
        <Button variant="filter" onClick={onCancel} style={{ minWidth: 90 }}>Cancel</Button>
        <Button variant="search" onClick={onOk} style={{ minWidth: 90 }}>Ok</Button>
      </div>
    </div>
  );
} 
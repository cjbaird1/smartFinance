import React from 'react';
import OrderFormFields from './OrderFormFields';

const OrderModal = ({
  open,
  onClose,
  dragState,
  orderSide,
  orderType,
  positionSize,
  entryPrice,
  takeProfit,
  stopLoss,
  positionSizeError,
  entryPriceError,
  takeProfitError,
  stopLossError,
  onOrderSideChange,
  onOrderTypeChange,
  onPositionSizeChange,
  onEntryPriceChange,
  onTakeProfitChange,
  onStopLossChange,
  onPlaceOrder,
  onDiscard,
  onSaveJournal
}) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content order-modal"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: `calc(50% + ${dragState.position.x}px)` ,
          top: `calc(50% + ${dragState.position.y}px)` ,
          transform: 'translate(-50%, -50%)',
          cursor: 'default',
        }}
      >
        <div className="modal-header" style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 8 }}>
          <div
            className="modal-drag-bar"
            onMouseDown={dragState.onMouseDown}
            style={{
              width: '100%',
              height: 18,
              cursor: 'grab',
              background: 'linear-gradient(90deg, var(--bg-panel) 60%, rgba(35,38,47,0))',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              marginBottom: 6,
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="modal-title" style={{ margin: 0 }}>Place {orderSide} Order</h2>
            <button className="modal-close-btn" onClick={onClose} aria-label="Close">&times;</button>
          </div>
        </div>
        <div className="order-modal-row">
          <div className="order-modal-field">
            <label htmlFor="side-select">Side</label>
            <select
              id="side-select"
              value={orderSide}
              onChange={e => onOrderSideChange(e.target.value)}
            >
              <option>Buy</option>
              <option>Sell</option>
            </select>
          </div>
          <div className="order-modal-field">
            <label htmlFor="type-select">Type</label>
            <select
              id="type-select"
              value={orderType}
              onChange={e => onOrderTypeChange(e.target.value)}
            >
              <option>Limit</option>
              <option>Market</option>
            </select>
          </div>
        </div>
        <OrderFormFields
          orderType={orderType}
          positionSize={positionSize}
          entryPrice={entryPrice}
          takeProfit={takeProfit}
          stopLoss={stopLoss}
          positionSizeError={positionSizeError}
          entryPriceError={entryPriceError}
          takeProfitError={takeProfitError}
          stopLossError={stopLossError}
          onPositionSizeChange={onPositionSizeChange}
          onEntryPriceChange={onEntryPriceChange}
          onTakeProfitChange={onTakeProfitChange}
          onStopLossChange={onStopLossChange}
        />
        <div className="order-modal-field" style={{ marginTop: 18 }}>
          <label>Tags (Press Enter or Click dropdown option to add)</label>
          <input type="text" placeholder="Select tags" disabled />
        </div>
        <div className="order-modal-actions">
          <button className="order-discard-btn" onClick={onDiscard}>Discard</button>
          <button className="order-save-btn" onClick={onPlaceOrder}>Save</button>
          <button className="order-save-journal-btn" onClick={onSaveJournal}>Save & Journal</button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal; 
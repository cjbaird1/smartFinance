import React from 'react';

const OrderFormFields = ({
  orderType,
  positionSize,
  entryPrice,
  takeProfit,
  stopLoss,
  positionSizeError,
  entryPriceError,
  takeProfitError,
  stopLossError,
  onPositionSizeChange,
  onEntryPriceChange,
  onTakeProfitChange,
  onStopLossChange
}) => (
  <>
    <div className="order-modal-row">
      <div className="order-modal-field">
        <label htmlFor="position-size">Position Size (Lots)</label>
        <input
          id="position-size"
          type="number"
          min="0"
          value={positionSize}
          onChange={e => onPositionSizeChange(e.target.value)}
          className={positionSizeError ? 'input-error' : ''}
        />
        {positionSizeError && (
          <span className="error-message">{positionSizeError}</span>
        )}
      </div>
      <div className="order-modal-field">
        <label htmlFor="entry-price">Entry Price</label>
        <input
          id="entry-price"
          type="number"
          min="0"
          value={entryPrice}
          onChange={e => onEntryPriceChange(e.target.value)}
          readOnly={orderType === "Market"}
          className={entryPriceError ? 'input-error' : ''}
        />
        {entryPriceError && (
          <span className="error-message">{entryPriceError}</span>
        )}
      </div>
    </div>
    <div className="order-modal-toggle-row">
      <div className="order-modal-field">
        <label htmlFor="take-profit">Take Profit</label>
        <input
          id="take-profit"
          type="number"
          min="0"
          step="0.01"
          value={takeProfit}
          onChange={e => onTakeProfitChange(e.target.value)}
          placeholder="Optional"
          className={takeProfitError ? 'input-error' : ''}
        />
        {takeProfitError && (
          <span className="error-message">{takeProfitError}</span>
        )}
      </div>
      <div className="order-modal-field">
        <label htmlFor="stop-loss">Stop Loss</label>
        <input
          id="stop-loss"
          type="number"
          min="0"
          step="0.01"
          value={stopLoss}
          onChange={e => onStopLossChange(e.target.value)}
          placeholder="Optional"
          className={stopLossError ? 'input-error' : ''}
        />
        {stopLossError && (
          <span className="error-message">{stopLossError}</span>
        )}
      </div>
    </div>
  </>
);

export default OrderFormFields; 
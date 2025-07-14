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
    <div className="order-modal-row flex gap-4 mb-4">
      <div className="order-modal-field flex-1 flex flex-col">
        <label htmlFor="position-size" className="text-sm font-medium mb-1 text-text-main">Position Size (Lots)</label>
        <input
          id="position-size"
          type="number"
          min="0"
          value={positionSize}
          onChange={e => onPositionSizeChange(e.target.value)}
          className={`bg-bg-panel text-text-main border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent ${positionSizeError ? 'border-error' : 'border-border'}`}
        />
        {positionSizeError && (
          <span className="error-message text-error text-sm mt-1">{positionSizeError}</span>
        )}
      </div>
      <div className="order-modal-field flex-1 flex flex-col">
        <label htmlFor="entry-price" className="text-sm font-medium mb-1 text-text-main">Entry Price</label>
        <input
          id="entry-price"
          type="number"
          min="0"
          value={entryPrice}
          onChange={e => onEntryPriceChange(e.target.value)}
          readOnly={orderType === "Market"}
          className={`bg-bg-panel text-text-main border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent ${entryPriceError ? 'border-error' : 'border-border'} ${orderType === "Market" ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : ''}`}
        />
        {entryPriceError && (
          <span className="error-message text-error text-sm mt-1">{entryPriceError}</span>
        )}
      </div>
    </div>
    <div className="order-modal-toggle-row flex gap-4 mb-4">
      <div className="order-modal-field flex-1 flex flex-col">
        <label htmlFor="take-profit" className="text-sm font-medium mb-1 text-text-main">Take Profit</label>
        <input
          id="take-profit"
          type="number"
          min="0"
          step="0.01"
          value={takeProfit}
          onChange={e => onTakeProfitChange(e.target.value)}
          placeholder="Optional"
          className={`bg-bg-panel text-text-main border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent ${takeProfitError ? 'border-error' : 'border-border'}`}
        />
        {takeProfitError && (
          <span className="error-message text-error text-sm mt-1">{takeProfitError}</span>
        )}
      </div>
      <div className="order-modal-field flex-1 flex flex-col">
        <label htmlFor="stop-loss" className="text-sm font-medium mb-1 text-text-main">Stop Loss</label>
        <input
          id="stop-loss"
          type="number"
          min="0"
          step="0.01"
          value={stopLoss}
          onChange={e => onStopLossChange(e.target.value)}
          placeholder="Optional"
          className={`bg-bg-panel text-text-main border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent ${stopLossError ? 'border-error' : 'border-border'}`}
        />
        {stopLossError && (
          <span className="error-message text-error text-sm mt-1">{stopLossError}</span>
        )}
      </div>
    </div>
  </>
);

export default OrderFormFields; 
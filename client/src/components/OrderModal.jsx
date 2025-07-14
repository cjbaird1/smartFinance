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
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        className="modal-content order-modal bg-bg-main text-text-main rounded-xl shadow-2xl min-w-96 max-w-md p-8 relative"
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          left: `calc(50% + ${dragState.position.x}px)` ,
          top: `calc(50% + ${dragState.position.y}px)` ,
          transform: 'translate(-50%, -50%)',
          cursor: 'default',
        }}
      >
        <div className="modal-header flex flex-col gap-0 mb-2">
          <div
            className="modal-drag-bar w-full h-4 cursor-grab bg-gradient-to-r from-bg-panel to-transparent rounded-t-xl mb-2"
            onMouseDown={dragState.onMouseDown}
          />
          <div className="flex items-center justify-between">
            <h2 className="modal-title text-xl font-semibold m-0">Place {orderSide} Order</h2>
            <button 
              className="modal-close-btn absolute top-4 right-4 bg-transparent border-none text-gray-400 text-2xl cursor-pointer z-10 transition-colors hover:text-white" 
              onClick={onClose} 
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
        <div className="order-modal-row flex gap-4 mb-4">
          <div className="order-modal-field flex-1 flex flex-col">
            <label htmlFor="side-select" className="text-sm font-medium mb-1 text-text-main">Side</label>
            <select
              id="side-select"
              value={orderSide}
              onChange={e => onOrderSideChange(e.target.value)}
              className="bg-bg-panel text-text-main border border-border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option>Buy</option>
              <option>Sell</option>
            </select>
          </div>
          <div className="order-modal-field flex-1 flex flex-col">
            <label htmlFor="type-select" className="text-sm font-medium mb-1 text-text-main">Type</label>
            <select
              id="type-select"
              value={orderType}
              onChange={e => onOrderTypeChange(e.target.value)}
              className="bg-bg-panel text-text-main border border-border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent"
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
        <div className="order-modal-field mt-4 flex flex-col">
          <label className="text-sm font-medium mb-1 text-text-main">Tags (Press Enter or Click dropdown option to add)</label>
          <input 
            type="text" 
            placeholder="Select tags" 
            disabled 
            className="bg-bg-panel text-gray-400 border border-border rounded-lg px-3 py-2 text-base cursor-not-allowed"
          />
        </div>
        <div className="order-modal-actions flex gap-3 mt-6 justify-center">
          <button 
            className="order-discard-btn px-4 py-1.5 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors" 
            onClick={onDiscard}
          >
            Discard
          </button>
          <button 
            className="order-save-btn px-4 py-1.5 bg-accent text-white rounded text-sm font-medium hover:bg-accent-hover transition-colors" 
            onClick={onPlaceOrder}
          >
            Save
          </button>
          <button 
            className="order-save-journal-btn px-4 py-1.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors" 
            onClick={onSaveJournal}
          >
            Save & Journal
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal; 
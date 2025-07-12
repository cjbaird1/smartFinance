import { useState } from 'react';

export const useTickerValidation = () => {
  const [tickerError, setTickerError] = useState('');

  const validateTicker = (ticker) => {
    if (!ticker) {
      setTickerError("Please enter a ticker symbol.");
      return false;
    }
    
    // Check if ticker contains only letters and is reasonable length
    if (!/^[A-Z]{1,5}$/.test(ticker)) {
      setTickerError("Ticker must be 1-5 letters only.");
      return false;
    }
    
    setTickerError('');
    return true;
  };

  const handleTickerError = (error, ticker) => {
    if (error && typeof error === 'string' && (error.toLowerCase().includes('none') || 
                  error.toLowerCase().includes('not found') || 
                  error.toLowerCase().includes('invalid'))) {
      const msg = `No Data Found for ticker symbol: "${ticker}"`;
      setTickerError(msg);
      return msg;
    }
    return null;
  };

  const clearTickerError = () => {
    setTickerError('');
  };

  return {
    tickerError,
    validateTicker,
    handleTickerError,
    clearTickerError,
    setTickerError
  };
}; 
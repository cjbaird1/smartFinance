import { useState } from 'react';

export const useTickerValidation = () => {
  const [tickerError, setTickerError] = useState('');

  const validateTicker = (ticker) => {
    if (!ticker) {
      setTickerError("Please enter a ticker symbol.");
      return false;
    }
    setTickerError('');
    return true;
  };

  const handleTickerError = (error, ticker) => {
    if (error && (error.toLowerCase().includes('none') || 
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
import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import '../styles/date-range-picker.css';

const DateRangePicker = ({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  className = '',
  placeholderText = 'Select date range'
}) => {
  return (
    <div className={`date-range-picker ${className}`}>
      <DatePicker
        selected={startDate}
        onChange={onStartDateChange}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        maxDate={endDate || new Date()}
        placeholderText="Start Date"
        className="date-input"
      />
      <span className="date-separator">to</span>
      <DatePicker
        selected={endDate}
        onChange={onEndDateChange}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        maxDate={new Date()}
        placeholderText="End Date"
        className="date-input"
      />
    </div>
  );
};

export default DateRangePicker; 
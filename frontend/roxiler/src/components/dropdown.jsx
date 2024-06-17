import React from 'react';
import "./styles/dropdown.css"

const Dropdown = ({ selectedMonth, handleMonthChange }) => {
  const months = [
    'All', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="month-selector">
      <label htmlFor="month">Select Month: </label>
      <select id="month" value={selectedMonth} onChange={handleMonthChange}>
        {months.map((month) => (
          <option key={month} value={month}>
            {month}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;

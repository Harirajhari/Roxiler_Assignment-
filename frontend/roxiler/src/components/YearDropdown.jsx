// components/YearDropdown.jsx
import React from 'react';
import "./styles/dropdown.css"; // Ensure this path matches your project structure

const YearDropdown = ({ selectedYear, handleYearChange }) => {
  const years = [];
  for (let year = 2000; year <= new Date().getFullYear(); year++) {
    years.push(year);
  }

  return (
    <div className="year-selector">
      <label htmlFor="year">Select Year: </label>
      <select id="year" value={selectedYear} onChange={handleYearChange}>
        <option value="">Select Year</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default YearDropdown;

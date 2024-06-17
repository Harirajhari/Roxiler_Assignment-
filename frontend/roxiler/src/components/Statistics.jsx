// Statistics.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./styles/statistics.css";

const Statistics = ({ selectedMonth, selectedYear }) => {
  const [stats, setStats] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0
  });

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get('http://localhost:3030/statistics', {
          params: { month: selectedMonth, year: selectedYear }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    if (selectedMonth !== 'All' && selectedYear) {
      fetchStatistics();
    }
  }, [selectedMonth, selectedYear]);

  return (
    <div className="statistics-container">
      <h2>Statistics for {selectedMonth} {selectedYear}</h2>
      <div className="statistics">
        <div className="statistic-item">
          <span>Total Sale Amount:</span>
          <span>${stats.totalSaleAmount.toFixed(2)}</span>
        </div>
        <div className="statistic-item">
          <span>Total Sold Items:</span>
          <span>{stats.totalSoldItems}</span>
        </div>
        <div className="statistic-item">
          <span>Total Not Sold Items:</span>
          <span>{stats.totalNotSoldItems}</span>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

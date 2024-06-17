// components/PieChart.jsx
import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import "./styles/piechart.css"

const PieChart = ({ selectedMonth, selectedYear }) => {
  const [pieChartData, setPieChartData] = useState(null);

  useEffect(() => {
    const fetchPieChartData = async () => {
      try {
        const response = await axios.get('http://localhost:3030/piechart', {
          params: { month: selectedMonth, year: selectedYear }
        });

        const data = response.data;
        const formattedData = {
          labels: data.map(item => item.category),
          datasets: [
            {
              data: data.map(item => item.count),
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#FF6384',
                '#36A2EB',
                '#FFCE56'
              ]
            }
          ]
        };

        setPieChartData(formattedData);
      } catch (error) {
        console.error('Error fetching pie chart data:', error);
      }
    };

    if (selectedMonth !== 'All' && selectedYear) {
      fetchPieChartData();
    }
  }, [selectedMonth, selectedYear]);

  if (!pieChartData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="pie-chart-container">
        <h1>PieChart</h1>
      <Pie data={pieChartData} />
    </div>
  );
};

export default PieChart;

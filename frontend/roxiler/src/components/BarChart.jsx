import React, { useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import "./styles/barchart.css"

const BarChart = ({ chartData }) => {
  const chartContainerRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy(); // The previous chart will destroyed
    }

    if (chartData && chartContainerRef.current) {
      console.log('Rendering chart with data:', chartData);
      chartInstanceRef.current = new Chart(chartContainerRef.current, {
        type: 'bar',
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: false, // Disable begin at zero
              min: 0, // Start y-axis at 0
              max: 10, // End y-axis at 10
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }
  }, [chartData]);

  if (!chartData) {
    return <p>Loading...</p>;
  }

  return (
    <div className="chart-container">
      <h2>Bar Chart</h2>
      <div className="barchart">
        <canvas ref={chartContainerRef} />
      </div>
    </div>
  );
};

export default BarChart;

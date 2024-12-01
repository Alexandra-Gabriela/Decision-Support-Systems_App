import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';


ChartJS.register(ArcElement, Title, Tooltip, Legend);

const PieChart = ({ data, onHoverChange, description }) => {
  const [hovered, setHovered] = useState(false);

  const chartData = {
    labels: Object.keys(data), 
    datasets: [
      {
        label: 'Total Sale',
        data: Object.values(data),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40', 
          '#FF57A5', '#9B59B6', '#F39C12', '#1F77B4', '#8E44AD'
        ], 
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40',
          '#FF57A5', '#9B59B6', '#F39C12', '#1F77B4', '#8E44AD'
        ], 
        borderColor: '#ffffff',
        borderWidth: 2, 
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.label}: ${tooltipItem.raw} lei`; 
          },
        },
      },
    },
    hover: {
      onHover: (event, chartElement) => {
        if (chartElement.length > 0) {
          setHovered(true);
          onHoverChange(true);
        } else {
          setHovered(false);
          onHoverChange(false);
        }
      },
    },
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '200px',
        height: '260px', 
        overflow: 'hidden',
        margin: 'auto',
      }}
    >
      <p style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
        {description}
      </p>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;

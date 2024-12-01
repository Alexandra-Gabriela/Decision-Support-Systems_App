import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Înregistrează componentele necesare pentru chart.js
ChartJS.register(ArcElement, Title, Tooltip, Legend);

const PieChart = ({ data, onHoverChange, description }) => {
  const [hovered, setHovered] = useState(false);

  const chartData = {
    labels: Object.keys(data), // Subtipurile produselor
    datasets: [
      {
        label: 'Total Sale',
        data: Object.values(data), // Valorile vânzărilor
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40', 
          '#FF57A5', '#9B59B6', '#F39C12', '#1F77B4', '#8E44AD'
        ], // Culori personalizate pentru fiecare sector
        hoverBackgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40',
          '#FF57A5', '#9B59B6', '#F39C12', '#1F77B4', '#8E44AD'
        ], // Culori care se schimbă la hover
        borderColor: '#ffffff', // Contur alb pentru fiecare sector
        borderWidth: 2, // Grosimea conturului
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.label}: ${tooltipItem.raw} lei`; // Afișează etichetele cu valorile
          },
        },
      },
    },
    hover: {
      onHover: (event, chartElement) => {
        if (chartElement.length > 0) {
          setHovered(true);
          onHoverChange(true); // Setăm flag-ul pentru hover pe chart
        } else {
          setHovered(false);
          onHoverChange(false); // Dezactivăm flag-ul pentru hover pe chart
        }
      },
    },
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '200px', // Dimensiunea maximă a graficului
        height: '260px', // Dimensiunea maximă a graficului
        overflow: 'hidden', // Ascunde orice element care iese în afară
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

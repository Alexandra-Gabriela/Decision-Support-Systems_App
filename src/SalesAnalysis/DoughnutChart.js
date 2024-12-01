import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from 'chart.js';


ChartJS.register(ArcElement, Title, Tooltip, Legend);

const DoughnutChart = ({ data, description }) => {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'Total Sale',
        data: Object.values(data), 
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'], 
        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#FF9F40'],
      },
    ],
  };


  const options = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        display: false,
      }
  }};

  return (
    <div style={{ width: "165px", height: "200px", margin: "auto", textAlign: "center" }}>
      <p style={{ fontWeight: "bold", marginBottom: "10px" }}>{description}</p>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DoughnutChart;

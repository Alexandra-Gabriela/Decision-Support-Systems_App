import React from "react";
import { Bar } from "react-chartjs-2";

const BarChart = ({ data, description }) => {
  if (!data || Object.keys(data).length === 0) {

    return <p>Data not available.</p>;
  }

  const chartData = {
    labels: Object.keys(data), 
    datasets: [
      {
        label: "Sales Distribution",
        data: Object.values(data), 
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8A2BE2", "#FFA500", "#FF4500", "#32CD32", "#8B4513", "#FF69B4"],
        borderColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8A2BE2", "#FFA500", "#FF4500", "#32CD32", "#8B4513", "#FF69B4"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { font: { size: 10 } },
        grid: { display: false },
      },
      y: {
        ticks: { font: { size: 10 } },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false},
    },
  };

  return (
    <div style={{ width: "200px", height: "250px", margin: "auto", textAlign: "center" }}>
      <p style={{ fontWeight: "bold", marginBottom: "10px" }}>{description}</p>
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

export default BarChart;

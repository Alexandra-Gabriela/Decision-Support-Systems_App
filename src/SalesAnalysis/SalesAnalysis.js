import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


ChartJS.register(ArcElement, Tooltip, Legend);

const SalesAnalysis = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date()); 

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const selectedYear = selectedDate.getFullYear();
        const selectedMonth = selectedDate.getMonth() + 1;

        const q = query(
          collection(db, "date_csv"),
          where("Year", "==", selectedYear),
          where("Month", "==", selectedMonth)
        );

        const snapshot = await getDocs(q);
        const salesData = {};

        snapshot.forEach((doc) => {
          const sale = doc.data();
          const productType = sale["Product Type"];
          const totalSale = sale["Total Sale"];

          if (productType && totalSale) {
            salesData[productType] = (salesData[productType] || 0) + totalSale;
          }
        });

        const chartData = {
          labels: Object.keys(salesData),
          datasets: [
            {
              label: "Vânzări pe Tip de Produs",
              data: Object.values(salesData),
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8A2BE2", "#FFA500"],
            },
          ],
        };

        setData(chartData);
        setLoading(false);
      } catch (error) {
        console.error("Eroare la citirea datelor din Firestore:", error);
      }
    };

    fetchData();
  }, [selectedDate]);

  if (loading) return <p>Loading data...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2>Analiza Vânzărilor pe Tip de Produs</h2>
      
      {/* Selector de dată pentru lună și an */}
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="MM/yyyy"
        showMonthYearPicker
        showFullMonthYearPicker
        customInput={
          <input
            type="text"
            style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ddd" }}
          />
        }
      />

      {/* Graficul */}
      <div style={{ width: "400px", marginTop: "20px" }}>
        {data ? <Pie data={data} /> : <p>Nu există date disponibile.</p>}
      </div>
    </div>
  );
};

export default SalesAnalysis;

import React, { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { alignProperty } from "@mui/material/styles/cssUtils";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const ForecastingModel = () => {
    const [salesData, setSalesData] = useState([]);
    const [region, setRegion] = useState("Moldova"); // Setează regiunea prestabilită
    const [filteredSales, setFilteredSales] = useState([]);

    // Fetch data
    const fetchSalesData = async () => {
        try {
            const response = await fetch("/csvjson.json");
            const data = await response.json();
            setSalesData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchSalesData();
    }, []);

    // Filtrare după regiune
    useEffect(() => {
        const filtered = salesData.filter((sale) => sale.Region === region);
        setFilteredSales(filtered);
    }, [salesData, region]);

    // Calculează coeficientul de regresie și generează predicții
    const calculateLinearRegression = () => {
        const monthlySales = Array(12).fill(0);
        const years = [2019, 2020, 2021, 2022, 2023]; // Anii disponibili

        // Adună vânzările lunare
        filteredSales.forEach((sale) => {
            const month = sale.Month - 1; // Luna 0-indexed
            monthlySales[month] += sale["Total Sale"];
        });

        // Verifică dacă există date suficiente
        if (monthlySales.length === 0) {
            return {
                labels: [],
                datasets: [],
            };
        }

        // Calculul mediei
        const meanY = monthlySales.reduce((a, b) => a + b) / monthlySales.length;

        // Calcularea coeficientului pantei (m) și interceptului (b)
        const m = monthlySales.reduce((acc, curr, idx) => acc + (idx * curr), 0) / monthlySales.reduce((acc, curr) => acc + (Math.pow(curr, 2)), 0);
        const b = meanY - m * (monthlySales.length - 1) / 2; // Ajustare pentru intercept

        // Generarea predicțiilor pentru următoarele 2 ani (2024, 2025)
        const predictedSales = [];
        const futureMonths = Array.from({ length: 24 }, (_, i) => 12 + i + 1); // Predicții pentru lunile 13-36
        futureMonths.forEach((month) => {
            predictedSales.push(m * month + b);
        });

        // Generarea etichetelor pentru axa X (doar ani)
        const extendedLabels = years.flatMap(year => [year]); // Adaugă anii
        extendedLabels.push(2024, 2025); // Adaugă anul 2024 și 2025

        return {
            labels: extendedLabels,
            datasets: [
                {
                    label: "Total Sales",
                    data: monthlySales.slice(0, 5), // Primele 5 luni pentru anii 2019-2023
                    borderColor: "rgba(75,192,192,1)",
                    backgroundColor: "rgba(75,192,192,0.4)",
                    tension: 0.2,
                },
                {
                    label: "Forecast",
                    data: [...monthlySales.slice(0, 5), ...predictedSales], // Combină datele istorice cu previziunile
                    borderColor: "rgba(255,99,132,1)", // Culoare diferită pentru previziuni
                    backgroundColor: "rgba(255,99,132,0.4)", // Culoare de fundal diferită
                    tension: 0.2,
                    fill: false, // Nu umple sub linie
                    borderWidth: 3, // Lățimea liniei de previziune
                },
            ],
        };
    };

    return (
        <div style={{maxWidth: "800px", margin: "0 auto" }}>
            <h2 style={{textAlign: "center"}}>Sales Forecast by Region</h2>

            {/* Filtru pentru regiune */}
            <div>
                <label>Region: </label>
                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                    <option value="Moldova">Moldova</option>
                    <option value="Banat">Banat</option>
                    <option value="Dobrogea">Dobrogea</option>
                    <option value="Oltenia">Oltenia</option>
                    <option value="Ardeal">Ardeal</option>
                </select>
            </div>

            {/* Grafic de linie */}
            <div style={{ marginTop: "20px" }}>
                <Line
                    data={calculateLinearRegression()}
                    options={{
                        responsive: true,
                        scales: {
                            x: {
                                title: { display: true, text: "Years" },
                                ticks: {
                                    autoSkip: false, // Arată toate etichetele pe axa X
                                },
                            },
                            y: {
                                min: 0,
                                max: 300000, // Setează valoarea maximă la 300.000
                                title: { display: true, text: "Total Sales ($)" },
                                beginAtZero: true,
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default ForecastingModel;

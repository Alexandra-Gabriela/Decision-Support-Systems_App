import React, { useEffect, useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend } from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

const SalesHistogram = () => {
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [customerCategory, setCustomerCategory] = useState("");
    const [customerGender, setCustomerGender] = useState("");
    const [barLineData, setBarLineData] = useState({});
    const [pieData, setPieData] = useState({});
    const [maxSaleInfo, setMaxSaleInfo] = useState(null);
    const [minSaleInfo, setMinSaleInfo] = useState(null);

    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/csvjson.json`);
            const salesData = await response.json();

            const filteredData = salesData.filter((sale) => {
                const saleDate = new Date(sale.Date);
                const matchesDate = saleDate.getFullYear() === selectedDate.getFullYear() &&
                                    saleDate.getMonth() === selectedDate.getMonth();
                const matchesCategory = customerCategory ? sale["Customer Category"] === customerCategory : true;
                const matchesGender = customerGender ? sale["Customer Gender"] === customerGender : true;
                return matchesDate && matchesCategory && matchesGender;
            });

            const groupedData = groupSalesData(filteredData);
            setBarLineData(groupedData.barLineData);
            setPieData(groupedData.pieData);
            setMaxSaleInfo(groupedData.maxSaleInfo);
            setMinSaleInfo(groupedData.minSaleInfo);
            setLoading(false);
        } catch (error) {
            console.error("Error reading data from JSON:", error);
            setLoading(false);
        }
    };

    const groupSalesData = (data) => {
        const grouped = {};
        const categoryCounts = {};

        data.forEach((sale) => {
            const { "Product Type": productType, "Total Sale": totalSale, "Customer Category": customerCategory } = sale;
            if (!grouped[productType]) {
                grouped[productType] = 0;
            }
            grouped[productType] += totalSale;

            if (!categoryCounts[customerCategory]) {
                categoryCounts[customerCategory] = 0;
            }
            categoryCounts[customerCategory] += 1;
        });

        let maxSaleValue = -Infinity;
        let minSaleValue = Infinity;
        let maxSaleInfo = null;
        let minSaleInfo = null;

        for (const [productType, total] of Object.entries(grouped)) {
            if (total > maxSaleValue) {
                maxSaleValue = total;
                maxSaleInfo = { productType, total };
            }
            if (total < minSaleValue) {
                minSaleValue = total;
                minSaleInfo = { productType, total };
            }
        }

        const labels = Object.keys(grouped);
        const values = Object.values(grouped);

        return {
            barLineData: {
                labels,
                datasets: [
                    {
                        type: "bar",
                        label: "Total Sales (Bar)",
                        data: values,
                        backgroundColor: values.map((value) =>
                            value === maxSaleValue ? "rgba(173, 235, 173, 0.8)" :  // Pastel Green
                            value === minSaleValue ? "rgba(255, 173, 173, 0.8)" :  // Pastel Red
                            "rgba(173, 216, 230, 0.6)"  // Pastel Blue
                        ),
                    },
                    {
                        type: "line",
                        label: "Total Sales (Line)",
                        data: values,
                        borderColor: "rgba(144, 202, 249, 0.8)",  // Pastel Light Blue
                        borderWidth: 2,
                        pointBackgroundColor: "rgba(144, 202, 249, 0.8)",
                        fill: false,
                    }
                ],
            },
            pieData: {
                labels: Object.keys(categoryCounts),
                datasets: [
                    {
                        data: Object.values(categoryCounts),
                        backgroundColor: [
                            "rgba(255, 179, 186, 0.6)",  // Pastel Pink
                            "rgba(255, 223, 186, 0.6)",  // Pastel Orange
                            "rgba(255, 255, 186, 0.6)",  // Pastel Yellow
                            "rgba(186, 255, 201, 0.6)",  // Pastel Green
                        ],
                        borderColor: [
                            "rgba(255, 179, 186, 1)",
                            "rgba(255, 223, 186, 1)",
                            "rgba(255, 255, 186, 1)",
                            "rgba(186, 255, 201, 1)",
                        ],
                        borderWidth: 1,
                    },
                ],
            },
            maxSaleInfo,
            minSaleInfo,
        };
    };

    useEffect(() => {
        fetchSalesData();
    }, [selectedDate, customerCategory, customerGender]);

    if (loading) return <p>Loading data...</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "800px", margin: "0 auto" }}>
            <h2>Sales Dashboard</h2>

            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                customInput={
                    <input
                        type="text"
                        style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ddd", marginBottom: "10px" }}
                    />
                }
            />

            <select
                value={customerCategory}
                onChange={(e) => setCustomerCategory(e.target.value)}
                style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ddd", marginBottom: "10px" }}
            >
                <option value="">Select Customer Category</option>
                <option value="Children">Children</option>
                <option value="Youth">Youth</option>
                <option value="Adults">Adults</option>
                <option value="Seniors">Seniors</option>
            </select>

            <select
                value={customerGender}
                onChange={(e) => setCustomerGender(e.target.value)}
                style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ddd", marginBottom: "10px" }}
            >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
            </select>

            {/* Bar & Line Chart */}
            <div style={{ width: "100%", marginBottom: "20px" }}>
                {barLineData.labels && barLineData.labels.length > 0 ? (
                    <Bar data={barLineData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
                ) : (
                    <p>No data available.</p>
                )}
            </div>

            {/* Pie Chart for Customer Category Distribution */}
            <div style={{ width: "100%", maxWidth: "400px", marginTop: "20px" }}>
                <h3>Customer Category Distribution</h3>
                <Pie data={pieData} options={{ responsive: true }} />
            </div>

            {/* Display Max and Min Sales Info */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
                {maxSaleInfo && (
                    <p style={{ color: "green" }}>
                        Highest Sales: {maxSaleInfo.productType} - {maxSaleInfo.total.toFixed(2)}
                    </p>
                )}
                {minSaleInfo && (
                    <p style={{ color: "red" }}>
                        Lowest Sales: {minSaleInfo.productType} - {minSaleInfo.total.toFixed(2)}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SalesHistogram;

import React, { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import "react-datepicker/dist/react-datepicker.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const CustomerPreferencesScatterPlot = () => {
    const [loading, setLoading] = useState(true);
    const [salesData, setSalesData] = useState([]);
    const [gender, setGender] = useState("");
    const [income, setIncome] = useState("");
    const [preferences, setPreferences] = useState("");
    const [scatterData, setScatterData] = useState({ datasets: [] });

    // Fetch sales data
    const fetchSalesData = async () => {
        setLoading(true);
        try {
            const response = await fetch("/csvjson.json");
            const data = await response.json();
            setSalesData(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesData();
    }, []);

    // Filter data based on selected criteria
    const filterData = () => {
        return salesData.filter((sale) => {
            const matchesGender = gender ? sale["Customer Gender"] === gender : true;
            const matchesIncome = income ? sale["Income"] === income : true;
            const matchesPreferences = preferences ? sale["Product Type"] === preferences : true;

            return matchesGender && matchesIncome && matchesPreferences;
        });
    };

    // Generate data for scatter plot
    const generateScatterData = () => {
        const filteredData = filterData();

        const scatterData = {
            datasets: [{
                label: 'Customer Preferences',
                data: filteredData.map((sale) => {
                    const age = parseInt(sale["Age Range"].split('-')[0]); // Age from Age Range
                    const totalSale = sale["Total Sale"]; // Assuming Total Sale is a numerical value
                    return totalSale >= 1000 && totalSale <= 9000 ? { x: age, y: totalSale } : null;
                }).filter(point => point !== null), // Filter out null points
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            }],
        };

        return scatterData;
    };

    useEffect(() => {
        const data = generateScatterData();
        setScatterData(data);
    }, [salesData, gender, income, preferences]);

    if (loading) return <p>Loading data...</p>;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "800px", margin: "0 auto" }}>
            <h2>Customer Preferences Scatter Plot</h2>

            {/* Customer Details Filters */}
            <h3>Customer Details</h3>
            <div>
                <label htmlFor="gender">Gender:</label>
                <select id="gender" onChange={(e) => setGender(e.target.value)} style={{ padding: "8px", marginBottom: "10px" }} value={gender}>
                    <option value="">--</option> {/* Placeholder without an option to select */}
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
            </div>
            <div>
                <label htmlFor="income">Income Level:</label>
                <select id="income" onChange={(e) => setIncome(e.target.value)} style={{ padding: "8px", marginBottom: "10px" }} value={income}>
                    <option value="">--</option> {/* Placeholder without an option to select */}
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>

            {/* Cosmetic Preferences Filter */}
            <h3>Cosmetic Preferences</h3>
            <div>
                <label htmlFor="preferences">Preferred Product:</label>
                <select id="preferences" onChange={(e) => setPreferences(e.target.value)} style={{ padding: "8px", marginBottom: "10px" }} value={preferences}>
                    <option value="">--</option> {/* Placeholder without an option to select */}
                    <option value="Sun Protection">Sun Protection</option>
                    <option value="Moisturizer">Moisturizer</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Hair Care">Hair Care</option>
                </select>
            </div>

            {/* Scatter Plot */}
            <div style={{ width: "100%", marginTop: "20px" }}>
                <Scatter 
                    data={scatterData} 
                    options={{ 
                        responsive: true, 
                        scales: { 
                            x: { 
                                title: { display: true, text: 'Age Range (Years)' },
                                min: 20, // Adjust the minimum value as needed
                                max: 70, // Adjust the maximum value as needed
                            }, 
                            y: { 
                                title: { display: true, text: 'Total Sale ($)' }, 
                                min: 1000, // Keep Y-axis minimum
                                max: 9000, // Keep Y-axis maximum
                                ticks: {
                                    stepSize: 1000, // Set step size for Y-axis ticks
                                    callback: (value) => {
                                        return value >= 1000 && value <= 9000 ? value : '';
                                    }
                                },
                            } 
                        } 
                    }} 
                />
            </div>
        </div>
    );
};

export default CustomerPreferencesScatterPlot;

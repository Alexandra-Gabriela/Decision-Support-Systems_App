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
const ageRanges = ["13-22", "23-32", "33-42", "43-52", "53-62", "63-73"];

const ageRangeToIndex = (ageRange) => {
    switch (ageRange) {
        case "13-22": return 0;
        case "23-32": return 1;
        case "33-42": return 2;
        case "43-52": return 3;
        case "53-62": return 4;
        case "63-73": return 5;
        default: return null;
    }
};

const CustomerPreferencesScatterPlot = () => {
    const [loading, setLoading] = useState(true);
    const [salesData, setSalesData] = useState([]);
    const [gender, setGender] = useState("");
    const [preferences, setPreferences] = useState("");
    const [scatterData, setScatterData] = useState({ datasets: [] });

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

    const filterData = () => {
        const filtered = salesData.filter((sale) => {
            const matchesGender = gender ? sale["Customer Gender"] === gender : true;
            const matchesPreferences = preferences ? sale["Product Type"] === preferences : true;

            return matchesGender && matchesPreferences;
        });

       // console.log("Selected Filters:", { gender, preferences });
       // console.log("Filtered Data:", filtered.slice(0, 5));
        return filtered;
    };

    const generateScatterData = () => {
        const filteredData = filterData();
        const scatterData = {
            datasets: [
                {
                    label: "Customer Preferences",
                    data: filteredData
                        .map((sale) => {
                            const ageRange = sale["Age Range"];
                            const ageIndex = ageRangeToIndex(ageRange);
                            const totalSale = sale["Total Sale"];
                           // console.log(`Age Range: ${ageRange}, Age Index: ${ageIndex}, Total Sale: ${totalSale}`);
                            if (ageIndex !== null && totalSale >= 1000 && totalSale <= 9000) {
                                return { x: ageRanges[ageIndex], y: totalSale };
                            }
                            return null;
                        })
                        .filter((point) => point !== null),
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
            ],
        };
        return scatterData;
    };

    useEffect(() => {
        const data = generateScatterData();
        setScatterData(data);
    }, [salesData, gender, preferences]);

    if (loading) return <p>Loading data...</p>;
    

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "800px", margin: "0 auto" }}>
            <h2>Customer Preferences</h2>

            {/* Customer Details Filters */}
            <h3>Customer Details</h3>
            <div>
                <label htmlFor="gender">Gender:</label>
                <select id="gender" onChange={(e) => setGender(e.target.value)} style={{ padding: "8px", marginBottom: "10px" }} value={gender}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="">All</option>
                </select>
            </div>

            {/* Cosmetic Preferences Filter */}
            <h3>Cosmetic Preferences</h3>
            <div>
                <label htmlFor="preferences">Preferred Category:</label>
                <select id="preferences" onChange={(e) => setPreferences(e.target.value)} style={{ padding: "8px", marginBottom: "10px" }} value={preferences}>
                    <option value="Sun Protection">Sun Protection</option>
                    <option value="Moisturizer">Moisturizer</option>
                    <option value="Makeup">Makeup</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="">All</option>
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
                                type: "category", 
                                labels: ageRanges, 
                                title: { display: true, text: "Age Range (Years)" },
                                offset: true
                               
                            }, 
                            y: { 
                                title: { display: true, text: 'Total Sale ($)' }, 
                                min: 1000, 
                                max: 9000, 
                                ticks: {
                                    stepSize: 1000, 
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

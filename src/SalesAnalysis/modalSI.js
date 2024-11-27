import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ModalForm = ({ isOpen, onClose, onExportExcel, jsonData }) => {
    const [yearAndMonth, setYearAndMonth] = useState(null);

    const [productCategory, setProductCategory] = useState("");
    const [gender, setGender] = useState("");
    const [region, setRegion] = useState("");
    const [uniqueYears, setUniqueYears] = useState([]);
    const [uniqueCategories, setUniqueCategories] = useState([]);
    const [uniqueRegions, setUniqueRegions] = useState([]);

    // Populează datele unice la încărcarea modalului
    useEffect(() => {
        if (jsonData && jsonData.length > 0) {
            const years = [...new Set(jsonData.map((item) => item.Year))];
            const categories = [...new Set(jsonData.map((item) => item["Product Type"]))];
            const regions = [...new Set(jsonData.map((item) => item.Region))];

            setUniqueYears(years);
            setUniqueCategories(categories);
            setUniqueRegions(regions);
        }
    }, [jsonData]);

    const handleExport = () => {
        const filters = {
            year: yearAndMonth ? yearAndMonth.getFullYear() : null,
            month: yearAndMonth ? yearAndMonth.getMonth() + 1 : null, // Transmite doar luna
            productCategory,
            gender,
            region,
        };
        console.log("Filters sent to backend:", filters); // Verifică ce filtre trimiți
        onExportExcel(filters);
        onClose();
    };
    
    
    if (!isOpen) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "white",
                padding: "20px",
                borderRadius: "5px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                zIndex: 1000,
            }}
        >
            <h3>Export Options</h3>

            <div style={{ marginBottom: "10px" }}>
                <label>Select Year:</label>
                <DatePicker
    selected={yearAndMonth}
    onChange={(date) => setYearAndMonth(date)} // Actualizează cu un obiect Date
    dateFormat="MM/yyyy" // Formatare lună/an
    showMonthYearPicker
    placeholderText="Select Year and Month"
    customInput={
        <input
            type="text"
            style={{
                padding: "8px",
                borderRadius: "5px",
                width: "100%",
            }}
        />
    }
/>

            </div>

            <div style={{ marginBottom: "10px" }}>
                <label>Select Product Category:</label>
                <select
                    value={productCategory}
                    onChange={(e) => setProductCategory(e.target.value)}
                    style={{ padding: "8px", borderRadius: "5px", width: "100%" }}
                >
                    <option value="">All Categories</option>
                    {uniqueCategories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label>Select Gender:</label>
                <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                    <label>
                        <input
                            type="radio"
                            value="Male"
                            checked={gender === "Male"}
                            onChange={(e) => setGender(e.target.value)}
                        />
                        Male
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="Female"
                            checked={gender === "Female"}
                            onChange={(e) => setGender(e.target.value)}
                        />
                        Female
                    </label>
                    <label>
                        <input
                            type="radio"
                            value=""
                            checked={gender === ""}
                            onChange={(e) => setGender(e.target.value)}
                        />
                        Any
                    </label>
                </div>
            </div>

            <div style={{ marginBottom: "10px" }}>
                <label>Select Region:</label>
                <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{ padding: "8px", borderRadius: "5px", width: "100%" }}
                >
                    <option value="">All Regions</option>
                    {uniqueRegions.map((region) => (
                        <option key={region} value={region}>
                            {region}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
                <button
                    onClick={handleExport}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "blue",
                        color: "white",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Export
                </button>
                <button
                    onClick={onClose}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "gray",
                        color: "white",
                        borderRadius: "5px",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default ModalForm;

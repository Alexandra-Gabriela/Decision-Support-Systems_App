import React, { useEffect, useState } from "react";
import { SLR } from "ml-regression";
import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
    Legend
} from "chart.js";
import "./PriceElasticity.css"; // Importați fișierul CSS

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const PriceElasticity = () => {
    const [loading, setLoading] = useState(true);
    const [priceChangePercent, setPriceChangePercent] = useState(0);
    const [elasticityResults, setElasticityResults] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/csvjson.json`);
            const salesData = await response.json();

            const groupedData = groupDataByProduct(salesData);
            const elasticity = calculateElasticity(groupedData);
            setElasticityResults(elasticity);
            setLoading(false);
        } catch (error) {
            console.error("Error reading data from JSON:", error);
            setLoading(false);
        }
    };

    const groupDataByProduct = (data) => {
        const grouped = {};

        data.forEach((sale) => {
            const { "Product Type": productType, "Unit Price": unitPrice, "Total Sale": totalSale } = sale;

            if (!grouped[productType]) grouped[productType] = { prices: [], sales: [] };

            grouped[productType].prices.push(unitPrice);
            grouped[productType].sales.push(totalSale);
        });

        return grouped;
    };

    const calculateElasticity = (groupedData) => {
        const results = [];

        Object.keys(groupedData).forEach((productType) => {
            const { prices, sales } = groupedData[productType];

            if (prices.length > 1) {
                const regression = new SLR(prices, sales);
                const elasticity = regression.coefficients[1]; // β din regresie liniară

                const lastPrice = prices[prices.length - 1];
                const predictedIncrease = regression.predict(lastPrice * (1 + priceChangePercent / 100));
                const predictedDecrease = regression.predict(lastPrice * (1 - priceChangePercent / 100));

                results.push({
                    productType,
                    elasticity,
                    currentSales: sales[sales.length - 1],
                    predictedIncrease,
                    predictedDecrease,
                    prices,
                    sales
                });
            }
        });

        return results;
    };

    useEffect(() => {
        fetchData();
    }, [priceChangePercent]);

    // Date pentru graficul principal
    const mainChartData = {
        labels: elasticityResults.map(result => result.productType),
        datasets: [
            {
                label: "Vânzări Curente",
                data: elasticityResults.map(result => result.currentSales),
                borderColor: "blue",
                fill: false,
            },
            {
                label: "Vânzări Estimate la Creștere",
                data: elasticityResults.map(result => result.predictedIncrease),
                borderColor: "green",
                fill: false,
            },
            {
                label: "Vânzări Estimate la Reducere",
                data: elasticityResults.map(result => result.predictedDecrease),
                borderColor: "red",
                fill: false,
            }
        ]
    };

    return (
        <div className="content-wrapper">
            <h2>Estimarea Elasticității Prețului Cererii</h2>
            <div className="input-group">
                <label>Procent Schimbare Preț:</label>
                <input
                    type="number"
                    value={priceChangePercent}
                    onChange={(e) => setPriceChangePercent(parseFloat(e.target.value))}
                />
            </div>

            {!loading && (
                <>
                    <h3>Grafic Principal</h3>
                    <div className="chart-container">
                        <Line data={mainChartData} />
                    </div>

                    <h3>Predicții per Produs</h3>
                    <div className="small-charts-container">
                        {elasticityResults.map((result, index) => {
                            const productChartData = {
                                labels: result.prices,
                                datasets: [
                                    {
                                        label: "Vânzări",
                                        data: result.sales,
                                        borderColor: "blue",
                                        fill: false,
                                    }
                                ]
                            };

                            return (
                                <div key={index} className="product-chart">
                                    <h4>{result.productType}</h4>
                                    <Line data={productChartData} />
                                    <p>Elasticitate: {result.elasticity.toFixed(2)}</p>
                                    <p>Vânzări Curente: {result.currentSales.toFixed(2)}</p>
                                    <p>Vânzări Estimate la Creștere: {result.predictedIncrease.toFixed(2)}</p>
                                    <p>Vânzări Estimate la Reducere: {result.predictedDecrease.toFixed(2)}</p>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default PriceElasticity;

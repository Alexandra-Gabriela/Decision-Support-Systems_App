const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const { exec } = require("child_process");

const getFilteredData = (filters) => {
    const rawDataPath = path.join(__dirname, "../csvjson.json");

    if (!fs.existsSync(rawDataPath)) {
        throw new Error("File csvjson.json doesn't exist.");
    }

    const rawData = fs.readFileSync(rawDataPath);
    const salesData = JSON.parse(rawData);

    let filteredData = salesData;

    if (filters.year && filters.month) {
        filteredData = filteredData.filter((sale) => {
            const saleYear = parseInt(sale.Year);
            const saleMonth = parseInt(sale.Month);
            return saleYear === parseInt(filters.year) && saleMonth === parseInt(filters.month);
        });
    }

    if (filters.productCategory) {
        filteredData = filteredData.filter((sale) =>
            sale["Product Type"].toLowerCase() === filters.productCategory.toLowerCase()
        );
    }

    if (filters.gender) {
        filteredData = filteredData.filter((sale) =>
            sale["Customer Gender"].toLowerCase() === filters.gender.toLowerCase()
        );
    }

    if (filters.region) {
        filteredData = filteredData.filter((sale) =>
            sale.Region.toLowerCase() === filters.region.toLowerCase()
        );
    }

    return filteredData;
};

const calculateExtremes = (worksheet) => {
    let maxSalesAmount = Number.NEGATIVE_INFINITY;
    let minSalesAmount = Number.POSITIVE_INFINITY;
    let maxTotalSale = Number.NEGATIVE_INFINITY;
    let minTotalSale = Number.POSITIVE_INFINITY;
    let maxQuantitySold = Number.NEGATIVE_INFINITY;

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row
        const salesAmount = parseFloat(row.getCell("Sales Amount").value) || 0;
        const totalSale = parseFloat(row.getCell("Total Sale").value) || 0;
        const quantitySold = parseFloat(row.getCell("Quantity Sold").value) || 0;

        maxSalesAmount = Math.max(maxSalesAmount, salesAmount);
        minSalesAmount = Math.min(minSalesAmount, salesAmount);
        maxTotalSale = Math.max(maxTotalSale, totalSale);
        minTotalSale = Math.min(minTotalSale, totalSale);
        maxQuantitySold = Math.max(maxQuantitySold, quantitySold);
    });

    return { maxSalesAmount, minSalesAmount, maxTotalSale, minTotalSale, maxQuantitySold };
};

const generateExcelFile = async (filters) => {
    const data = getFilteredData(filters);

    if (data.length === 0) {
        throw new Error("No data matching the filters.");
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Filtered Data");

    worksheet.columns = [
        { header: "Date", key: "Date", width: 20 },
        { header: "Product Type", key: "Product Type", width: 20 },
        { header: "Product Subtype", key: "Product Subtype", width: 20 },
        { header: "Customer Category", key: "Customer Category", width: 20 },
        { header: "Customer Gender", key: "Customer Gender", width: 20 },
        { header: "Age Range", key: "Age Range", width: 20 },
        { header: "Country", key: "Country", width: 20 },
        { header: "Region", key: "Region", width: 20 },
        { header: "Sales Amount", key: "Sales Amount", width: 20 },
        { header: "Quantity Sold", key: "Quantity Sold", width: 20 },
        { header: "Unit Price", key: "Unit Price", width: 20 },
        { header: "Total Sale", key: "Total Sale", width: 20 },
        { header: "Sales Change (%)", key: "Sales Change (%)", width: 20 },
    ];

    worksheet.addRows(data);

    // Header formatting
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "5B9BD5" } }; // Blue
        cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    const extremes = calculateExtremes(worksheet);

    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const totalSale = parseFloat(row.getCell("Total Sale").value) || 0;
        const isMaxTotalSale = totalSale === extremes.maxTotalSale;
        const isMinTotalSale = totalSale === extremes.minTotalSale;

        if (isMaxTotalSale) {
            row.eachCell((cell) => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "C6EFCE" } }; // Light Green
                cell.font = { color: { argb: "006100" } }; // Dark Green text
            });
        } else if (isMinTotalSale) {
            row.eachCell((cell) => {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC7CE" } }; // Light Red
                cell.font = { color: { argb: "9C0006" } }; // Dark Red text
            });
        }

        const salesAmount = parseFloat(row.getCell("Sales Amount").value) || 0;
        if (!isMaxTotalSale && !isMinTotalSale) {
            if (salesAmount === extremes.maxSalesAmount) {
                row.getCell("Sales Amount").fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "C6EFCE" },
                }; // Light Green
                row.getCell("Sales Amount").font = { color: { argb: "006100" } };
            } else if (salesAmount === extremes.minSalesAmount) {
                row.getCell("Sales Amount").fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FFC7CE" },
                }; // Light Red
                row.getCell("Sales Amount").font = { color: { argb: "9C0006" } };
            }
        }

        const quantitySold = parseFloat(row.getCell("Quantity Sold").value) || 0;
        const barLength = Math.round((quantitySold / extremes.maxQuantitySold) * 10);
        const progressBar = `${"█".repeat(barLength)}${" ".repeat(10 - barLength)}`;
        row.getCell("Quantity Sold").value = `${progressBar} ${quantitySold}`;
        row.getCell("Quantity Sold").font = { bold: true, color: { argb: "5B9BD5" } };
        row.getCell("Quantity Sold").alignment = { horizontal: "left", vertical: "middle" };

        const salesChange = parseFloat(row.getCell("Sales Change (%)").value) || 0;
        let emoji = "";
        let fillColor = "";

        if (salesChange > 20) {
            emoji = "▲";
            fillColor = "006100"; // Dark Green
        } else if (salesChange >= 10) {
            emoji = "⇧";
            fillColor = "C6EFCE"; // Light Green
        } else if (salesChange > -10) {
            emoji = "➔";
            fillColor = "FFEB9C"; // Yellow
        } else if (salesChange >= -20) {
            emoji = "⇩";
            fillColor = "FFC7CE"; // Light Red
        } else {
            emoji = "▼";
            fillColor = "9C0006"; // Dark Red
        }

        const salesChangeCell = row.getCell("Sales Change (%)");
        salesChangeCell.value = `${emoji} ${salesChange.toFixed(2)}%`;
        salesChangeCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fillColor } };
    });

    // Add total row
    const totalRow = worksheet.addRow({
        "Date": "Total",
        "Sales Amount": { formula: `SUM(${worksheet.getColumn("Sales Amount").letter}2:${worksheet.getColumn("Sales Amount").letter}${worksheet.rowCount})` },
        "Quantity Sold": { formula: `SUM(${worksheet.getColumn("Quantity Sold").letter}2:${worksheet.getColumn("Quantity Sold").letter}${worksheet.rowCount})` },
        "Total Sale": { formula: `SUM(${worksheet.getColumn("Total Sale").letter}2:${worksheet.getColumn("Total Sale").letter}${worksheet.rowCount})` },
    });

    totalRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "5B9BD5" } }; // Blue
        cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    const filePath = path.join(__dirname, "../ExportedData.xlsx");
    await workbook.xlsx.writeFile(filePath);

    exec(`start excel "${filePath}"`, (err) => {
        if (err) {
            console.error("Error opening Excel file:", err);
        } else {
            console.log("Excel file opened successfully");
        }
    });

    return filePath;
};

module.exports = { generateExcelFile, getFilteredData };

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs'); // Asigură-te că ai importat ExcelJS
const { exec } = require('child_process');

// Funcția care filtrează datele
const getFilteredData = (filters) => {
    const rawDataPath = path.join(__dirname, "../csvjson.json");

    // Verificăm dacă fișierul există
    if (!fs.existsSync(rawDataPath)) {
        throw new Error("Fișierul csvjson.json nu există.");
    }

    const rawData = fs.readFileSync(rawDataPath);
    const salesData = JSON.parse(rawData);

    return salesData.filter((sale) => {
        const matchesYear = filters.year ? sale.Year === parseInt(filters.year) : true;
        const matchesCategory = filters.productCategory ? sale["Product Type"] === filters.productCategory : true;
        const matchesGender = filters.gender ? sale["Customer Gender"] === filters.gender : true;
        const matchesRegion = filters.region ? sale.Region === filters.region : true;

        return matchesYear && matchesCategory && matchesGender && matchesRegion;
    });
};

// Funcția care generează fișierul Excel
const generateExcelFile = async (filters) => {
    // Filtrăm datele pe baza criteriilor
    const data = getFilteredData(filters);

    // Verificăm dacă sunt date după filtrare
    if (data.length === 0) {
        throw new Error("Nu au fost găsite date care să corespundă filtrului.");
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

    // Formatarea antetului
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "4F81BD" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    worksheet.addRows(data);

    let maxSalesAmount = Number.NEGATIVE_INFINITY;
    let minSalesAmount = Number.POSITIVE_INFINITY;
    let maxTotalSale = Number.NEGATIVE_INFINITY;
    let minTotalSale = Number.POSITIVE_INFINITY;
    let maxQuantitySold = Number.NEGATIVE_INFINITY;

    // Determinarea valorilor maxime/minime pentru a aplica formatarea coloristică
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Ignoră antetul
        const salesAmount = parseFloat(row.getCell('Sales Amount').value) || 0;
        const totalSale = parseFloat(row.getCell('Total Sale').value) || 0;
        const quantitySold = parseFloat(row.getCell('Quantity Sold').value) || 0;

        maxSalesAmount = Math.max(maxSalesAmount, salesAmount);
        minSalesAmount = Math.min(minSalesAmount, salesAmount);
        maxTotalSale = Math.max(maxTotalSale, totalSale);
        minTotalSale = Math.min(minTotalSale, totalSale);
        maxQuantitySold = Math.max(maxQuantitySold, quantitySold);
    });

    // Aplicarea formatării
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Ignoră antetul

        const salesAmount = parseFloat(row.getCell('Sales Amount').value) || 0;
        const salesScale = (salesAmount - minSalesAmount) / (maxSalesAmount - minSalesAmount);
        const red = Math.round(255 - salesScale * 255);
        const green = Math.round(salesScale * 255);

        // Aplica culoarea la celula "Sales Amount"
        row.getCell('Sales Amount').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: `${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}00` },
        };

        const totalSale = parseFloat(row.getCell('Total Sale').value) || 0;
        // Adaugă emoji pentru creșterea sau scăderea vânzărilor în Total Sale
        if (totalSale === maxTotalSale) {
            row.getCell('Total Sale').value += " 🔼";
        } else if (totalSale === minTotalSale) {
            row.getCell('Total Sale').value += " 🔽";
        }

        const salesChange = parseFloat(row.getCell('Sales Change (%)').value) || 0;
        let emoji = '';
        let fontColor = '';
        let fillColor = '';

        // Determinarea emoji-urilor și a culorilor pentru "Sales Change (%)"
        if (salesChange > 20) {
            emoji = '▲'; // Creștere mare
            fillColor = '006400'; // Verde închis
            fontColor = 'FFFFFF'; // Alb
        } else if (salesChange >= 10 && salesChange <= 20) {
            emoji = '⇧'; // Creștere moderată
            fillColor = '90EE90'; // Verde deschis
            fontColor = '000000'; // Negru
        } else if (salesChange > -10 && salesChange < 10) {
            emoji = '➔'; // Constant
            fillColor = 'FFFF00'; // Galben
            fontColor = '000000'; // Negru
        } else if (salesChange >= -20 && salesChange <= -10) {
            emoji = '⇩'; // Scădere moderată
            fillColor = 'FFB6C1'; // Roșu deschis
            fontColor = '000000'; // Negru
        } else if (salesChange < -20) {
            emoji = '▼'; // Scădere mare
            fillColor = '8B0000'; // Roșu închis
            fontColor = 'FFFFFF'; // Alb
        }

        // Actualizează celula cu simbolul și valoarea
        const cell = row.getCell('Sales Change (%)');
        cell.value = `${emoji} ${salesChange.toFixed(2)}%`;

        // Aplica stilul de culoare și font
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: fillColor },
        };
        cell.font = {
            color: { argb: fontColor },
            bold: true,
        };

        // Actualizează celula "Quantity Sold" cu o bară de progres și culoare pastel
        const quantitySold = parseFloat(row.getCell('Quantity Sold').value) || 0;
        const barLength = Math.round((quantitySold / maxQuantitySold) * 10);

        // Creează bara de progres (simboluri █) și adaugă numărul de produse vândute la final
        row.getCell('Quantity Sold').value = `${'█'.repeat(barLength)} ${quantitySold}`;
        row.getCell('Quantity Sold').fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'ADD8E6' }, // Culoare albastru pastel
        };
    });

    const filePath = path.join(__dirname, "../ExportedData.xlsx");
    await workbook.xlsx.writeFile(filePath);

    // Deschide fișierul Excel automat
    exec(`start excel "${filePath}"`, (err) => {
        if (err) {
            console.error("Error opening Excel file:", err);
        } else {
            console.log("Excel file opened successfully");
        }
    });

    return filePath; // Returnează calea fișierului
};

module.exports = { generateExcelFile, getFilteredData };

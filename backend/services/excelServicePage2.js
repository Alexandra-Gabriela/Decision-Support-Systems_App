const ExcelJS = require('exceljs');
const path = require('path');
const { exec } = require('child_process');

const generateExcelFilePage2 = async (historicalSales, forecastSales, years) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Forecast');

    // Adăugăm antetul tabelului
    worksheet.addRow(['Year', 'Historical Sales', 'Forecast Sales']);
    worksheet.columns = [
        { key: 'year', width: 15 },
        { key: 'historical', width: 20 },
        { key: 'forecast', width: 20 },
    ];

    // Adăugăm datele
    years.forEach((year, index) => {
        worksheet.addRow({
            year,
            historical: historicalSales[index] || null,
            forecast: forecastSales[index] || null,
        });
    });

    // Adăugăm un exemplu de formulă (ex: R²)
    worksheet.addRow([]);
    worksheet.addRow(['Formula Example (R²): =RSQ(B2:B10, C2:C10)']);

    // Salvăm fișierul într-un folder local
    const filePath = path.join(__dirname, "../ExportedData.xlsx");
    await workbook.xlsx.writeFile(filePath);

    // Deschidem automat fișierul Excel (pentru testare locală)
    exec(`start excel "${filePath}"`, (err) => {
        if (err) {
            console.error('Error opening Excel file:', err);
        }
    });

    return filePath;
};

module.exports = { generateExcelFilePage2 };

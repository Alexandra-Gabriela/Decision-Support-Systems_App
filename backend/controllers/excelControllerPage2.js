const { generateExcelFilePage2 } = require('../services/excelServicePage2');

const exportExcelPage2 = async (req, res) => {
    try {
        const { historicalSales, forecastSales, years } = req.body;

        // Apelăm funcția din service pentru generarea fișierului Excel
        const filePath = await generateExcelFilePage2(historicalSales, forecastSales, years);

        res.status(200).json({ message: 'File generated successfully', filePath: `/public/${path.basename(filePath)}` });
    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).json({ message: 'Failed to generate Excel file' });
    }
};

module.exports = { exportExcelPage2 };

const { generateExcelFile, getFilteredData } = require("../services/excelService");

const generateExcel = async (req, res) => {
    try {
        const filters = req.body;
        const data = getFilteredData(filters); // Aici se folosește funcția getFilteredData
        const filePath = await generateExcelFile(data);

        res.status(200).json({ message: "Excel file generated successfully", path: filePath });
    } catch (error) {
        console.error("Error generating Excel file:", error);
        res.status(500).send("Failed to generate Excel file");
    }
};

module.exports = { generateExcel };

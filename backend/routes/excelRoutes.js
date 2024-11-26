// routes/excelRoutes.js
const express = require("express");
const { generateExcel } = require("../controllers/excelControllerFilter");

const router = express.Router();

router.post("/generate-excel", generateExcel);

module.exports = router;

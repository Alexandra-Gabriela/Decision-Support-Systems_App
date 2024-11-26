// server.js
const express = require("express");
const cors = require("cors");
const excelRoutes = require("./routes/excelRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", excelRoutes); // Folosim rutele pentru generarea fișierului Excel

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

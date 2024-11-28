const express = require('express');
const cors = require('cors');
const excelRoutes = require('../routes/excelRoutes');

const app = express();

// Listă cu origini permise
const allowedOrigins = ['http://localhost:3000', 'https://frontend-production.com'];

// Configurare dinamică a CORS
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Permite cererea
        } else {
            callback(new Error('Not allowed by CORS')); // Blochează cererea
        }
    },
    credentials: true // Permite transmiterea de cookie-uri/antete
}));

// Middleware pentru parsarea JSON-ului
app.use(express.json());

// Rute definite în submodule
app.use('/api/excel', excelRoutes);

// Poți adăuga mai multe rute sau configurări aici
module.exports = app;

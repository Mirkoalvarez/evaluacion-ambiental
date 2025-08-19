// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/config');
const { sequelize } = require('./models/index'); // <- usa el índice nuevo

// Rutas
const barrioRoutes = require('./routes/barrioRoutes');
const evaluacionRoutes = require('./routes/evaluacionRoutes');

const app = express();
const PORT = config.port;

// Middleware esencial
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api/barrios', barrioRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);

// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';
    res.status(statusCode).json({ error: message });
    });

// Sincronizar DB y arrancar
sequelize.sync({ alter: true })
    .then(() => {
        app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al conectar con la DB o sincronizar modelos:', err);
        process.exit(1);
    });

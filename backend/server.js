// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/config');
const { sequelize, User } = require('./models/index'); // <- usa el índice nuevo

// Rutas
const barrioRoutes = require('./routes/barrioRoutes');
const evaluacionRoutes = require('./routes/evaluacionRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = config.port;

// Middleware esencial
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api/barrios', barrioRoutes);
app.use('/api/evaluaciones', evaluacionRoutes);
app.use('/api/auth', userRoutes);

// Manejador de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';
    res.status(statusCode).json({ error: message });
    });

// Sincronizar DB y arrancar (sin alter para evitar recrear tablas con FKs en SQLite)
sequelize.sync()
    .then(async () => {
        // Seed básico de usuarios por defecto
        const seeds = [
            { username: 'Admin', email: 'admin@admin.com', password: 'Admin123', role: 'admin' },
            { username: 'Moderador', email: 'mod@mod.com', password: 'Mod123', role: 'moderador' },
        ];
        for (const s of seeds) {
            // Evitar duplicados por email o username
            const exists = await User.findOne({ where: { email: s.email } });
            if (!exists) {
                const bcrypt = require('bcryptjs');
                const hashed = await bcrypt.hash(s.password, 10);
                await User.create({ ...s, password: hashed });
            }
        }

        app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Error al conectar con la DB o sincronizar modelos:', err);
        process.exit(1);
    });

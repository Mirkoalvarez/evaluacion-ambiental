// backend/database.js
const { Sequelize } = require('sequelize');
const config = require('./config/config'); // Importar la configuración

const sequelize = new Sequelize({
    dialect: config.database.dialect,
    storage: config.database.storage,
    logging: config.database.logging,
    define: {
        timestamps: true,
        underscored: true
    }
});

module.exports = sequelize;

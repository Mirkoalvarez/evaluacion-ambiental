// backend/config/config.js
module.exports = {
    port: process.env.PORT || 3001,
    database: {
        dialect: 'sqlite',
        storage: process.env.SQLITE_PATH || './database.sqlite',
        logging: false, // Set to true to see SQL queries in console
    },
    // Otras configuraciones globales si son necesarias
};

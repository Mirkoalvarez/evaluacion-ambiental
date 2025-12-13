// backend/models/Barrio.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Barrio = sequelize.define('Barrio', {
        autor_id: { type: DataTypes.INTEGER, allowNull: true }, // allowNull true para compatibilidad con datos existentes; se setea en app
        nombre: { type: DataTypes.STRING, allowNull: false },
        resultado_total: { type: DataTypes.STRING(1), allowNull: true }, // A/B/C
    }, {
        tableName: 'Barrios',   // <- vuelve a 'Barrios' para coincidir con la tabla existente
        underscored: true,      // combina con tu config global
        timestamps: true,
    });
    return Barrio;
};


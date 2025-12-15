// backend/models/BarrioImagen.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BarrioImagen = sequelize.define('BarrioImagen', {
        barrio_id: { type: DataTypes.INTEGER, allowNull: false },
        file_name: { type: DataTypes.STRING, allowNull: false },
        original_name: { type: DataTypes.STRING, allowNull: false },
        mime_type: { type: DataTypes.STRING, allowNull: false },
        size: { type: DataTypes.INTEGER, allowNull: false },
        path: { type: DataTypes.STRING, allowNull: false }, // ruta relativa servida desde /uploads
    }, {
        tableName: 'barrio_imagenes',
        underscored: true,
    });

    return BarrioImagen;
};

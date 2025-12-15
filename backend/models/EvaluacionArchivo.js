// backend/models/EvaluacionArchivo.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const EvaluacionArchivo = sequelize.define('EvaluacionArchivo', {
        evaluacion_id: { type: DataTypes.INTEGER, allowNull: false },
        file_name: { type: DataTypes.STRING, allowNull: false },
        original_name: { type: DataTypes.STRING, allowNull: false },
        mime_type: { type: DataTypes.STRING, allowNull: false },
        size: { type: DataTypes.INTEGER, allowNull: false },
        path: { type: DataTypes.STRING, allowNull: false }, // ruta relativa que se sirve por /uploads
    }, {
        tableName: 'evaluacion_archivos',
        underscored: true,
    });

    return EvaluacionArchivo;
};

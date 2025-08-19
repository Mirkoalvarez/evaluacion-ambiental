// backend/models/Evaluacion.js
const { DataTypes } = require('sequelize');
const { calcularResultados } = require('../services/evaluacionService');

module.exports = (sequelize) => {
    const Evaluacion = sequelize.define('Evaluacion', {
        // FK
        barrio_id: { type: DataTypes.INTEGER, allowNull: false },

        // 1. Energía (e1_6 es Sí/No)
        e1_1: DataTypes.STRING, e1_2: DataTypes.STRING, e1_3: DataTypes.STRING,
        e1_4: DataTypes.STRING, e1_5: DataTypes.STRING, e1_6: DataTypes.STRING,
        e1_7: DataTypes.STRING, e1_8: DataTypes.STRING, e1_9: DataTypes.STRING,

        // 2. Agua (a2_3 invertido, a2_4 NPT normal)
        a2_1: DataTypes.STRING, a2_2: DataTypes.STRING, a2_3: DataTypes.STRING,
        a2_4: DataTypes.STRING, a2_5: DataTypes.STRING, a2_6: DataTypes.STRING,
        a2_7: DataTypes.STRING, a2_8: DataTypes.STRING,

        // 3. Residuos
        r3_1: DataTypes.STRING, r3_2: DataTypes.STRING, r3_3: DataTypes.INTEGER,
        r3_4: DataTypes.STRING, r3_5: DataTypes.STRING, r3_6: DataTypes.STRING,

        // 4. Espacios Verdes
        ev4_1: DataTypes.STRING, ev4_2: DataTypes.STRING, ev4_3: DataTypes.STRING,
        ev4_4: DataTypes.STRING, ev4_5: DataTypes.STRING, ev4_6: DataTypes.STRING,
        ev4_7: DataTypes.STRING, ev4_8: DataTypes.STRING,

        // 5. Gestión
        g5_1: DataTypes.STRING, g5_2: DataTypes.STRING, g5_3: DataTypes.STRING,
        g5_4: DataTypes.STRING, g5_5: DataTypes.STRING, g5_6: DataTypes.STRING,

        // Derivados por eje
        puntaje_energia: DataTypes.FLOAT,
        resultado_energia: DataTypes.STRING,

        puntaje_agua: DataTypes.FLOAT,
        resultado_agua: DataTypes.STRING,

        puntaje_residuos: DataTypes.FLOAT,
        resultado_residuos: DataTypes.STRING,

        puntaje_espacios_verdes: DataTypes.FLOAT,
        resultado_espacios_verdes: DataTypes.STRING,

        puntaje_gestion: DataTypes.FLOAT,
        resultado_gestion: DataTypes.STRING,

        // Total
        puntaje_final: DataTypes.FLOAT,
        resultado_total: DataTypes.STRING,

        // 👇 FECHA: usar DATEONLY para compatibilidad con <input type="date">
        fecha: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW, // guarda YYYY-MM-DD
        },
    }, {
        tableName: 'evaluaciones',
        underscored: true,
        hooks: {
        // IMPORTANTE: recalcular SIEMPRE antes de guardar (create/update)
        beforeSave: (ev) => {
            calcularResultados(ev);
        }
        }
    });

    return Evaluacion;
};

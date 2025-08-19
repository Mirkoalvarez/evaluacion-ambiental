// backend/models/index.js
const sequelize = require('../database');
const BarrioModel = require('./Barrio');
const EvaluacionModel = require('./Evaluacion');

// Inicializamos los modelos una sola vez
const Barrio = BarrioModel(sequelize);
const Evaluacion = EvaluacionModel(sequelize);

// Relaciones
Barrio.hasMany(Evaluacion, { foreignKey: 'barrio_id', as: 'evaluaciones', onDelete: 'CASCADE' });
Evaluacion.belongsTo(Barrio, { foreignKey: 'barrio_id', as: 'barrio' });

module.exports = {
    sequelize,
    Barrio,
    Evaluacion,
};

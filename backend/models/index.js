// backend/models/index.js
const sequelize = require('../database');
const BarrioModel = require('./Barrio');
const EvaluacionModel = require('./Evaluacion');
const UserModel = require('./User');
const BarrioMemberModel = require('./BarrioMember');
const EvaluacionArchivoModel = require('./EvaluacionArchivo');
const BarrioImagenModel = require('./BarrioImagen');

// Inicializamos los modelos una sola vez
const Barrio = BarrioModel(sequelize);
const Evaluacion = EvaluacionModel(sequelize);
const User = UserModel(sequelize);
const BarrioMember = BarrioMemberModel(sequelize);
const EvaluacionArchivo = EvaluacionArchivoModel(sequelize);
const BarrioImagen = BarrioImagenModel(sequelize);

// Relaciones
Barrio.hasMany(Evaluacion, { foreignKey: 'barrio_id', as: 'evaluaciones', onDelete: 'CASCADE' });
Evaluacion.belongsTo(Barrio, { foreignKey: 'barrio_id', as: 'barrio' });

// Archivos de evaluaciÃ³n
Evaluacion.hasMany(EvaluacionArchivo, { foreignKey: 'evaluacion_id', as: 'archivos', onDelete: 'CASCADE' });
EvaluacionArchivo.belongsTo(Evaluacion, { foreignKey: 'evaluacion_id', as: 'evaluacion' });

// Autor de barrio
Barrio.belongsTo(User, { foreignKey: 'autor_id', as: 'autor' });
User.hasMany(Barrio, { foreignKey: 'autor_id', as: 'barrios_propios' });

// Imagen principal del barrio
Barrio.hasOne(BarrioImagen, { foreignKey: 'barrio_id', as: 'imagen', onDelete: 'CASCADE' });
BarrioImagen.belongsTo(Barrio, { foreignKey: 'barrio_id', as: 'barrio' });

// Miembros de barrio
Barrio.belongsToMany(User, { through: BarrioMember, foreignKey: 'barrio_id', otherKey: 'user_id', as: 'miembros' });
User.belongsToMany(Barrio, { through: BarrioMember, foreignKey: 'user_id', otherKey: 'barrio_id', as: 'barrios' });
BarrioMember.belongsTo(User, { foreignKey: 'user_id', as: 'usuario' });
BarrioMember.belongsTo(Barrio, { foreignKey: 'barrio_id', as: 'barrio' });

// Autoria de evaluaciones
Evaluacion.belongsTo(User, { foreignKey: 'creado_por', as: 'creador' });
Evaluacion.belongsTo(User, { foreignKey: 'editado_por', as: 'editor' });

module.exports = {
    sequelize,
    Barrio,
    Evaluacion,
    User,
    BarrioMember,
    EvaluacionArchivo,
    BarrioImagen,
};

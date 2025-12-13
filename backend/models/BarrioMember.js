// backend/models/BarrioMember.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BarrioMember = sequelize.define('BarrioMember', {
        barrio_id: { type: DataTypes.INTEGER, allowNull: false },
        user_id: { type: DataTypes.INTEGER, allowNull: false },
        puede_editar_todas: { type: DataTypes.BOOLEAN, defaultValue: false },
        es_moderador_barrio: { type: DataTypes.BOOLEAN, defaultValue: false },
    }, {
        tableName: 'barrio_members',
        underscored: true,
        timestamps: true,
        indexes: [
            { unique: true, fields: ['barrio_id', 'user_id'] }
        ]
    });

    return BarrioMember;
};

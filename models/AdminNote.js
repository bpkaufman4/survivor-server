const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class AdminNote extends Model {}

AdminNote.init(
    {
        adminNoteId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        note: {
            type: DataTypes.STRING(1000),
            allowNull: false
        }
    },
    {
        paranoid: false,
        sequelize,
        freezeTableName: true,
        modelName: 'adminNote'
    }
);

module.exports = AdminNote;
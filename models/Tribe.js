const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Tribe extends Model {}

Tribe.init(
    {
        tribeId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        season: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: process.env.CURRENT_SEASON
        },
        color: {
            type: DataTypes.STRING(7),
            allowNull: false,
            defaultValue: '#000000'
        }
    },
    {
        paranoid: false,
        sequelize,
        freezeTableName: true,
        modelName: 'tribe'
    }
);

module.exports = Tribe;
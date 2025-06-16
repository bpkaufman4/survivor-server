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
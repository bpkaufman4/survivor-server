const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Statistic extends Model {}

Statistic.init(
    {
        statisticId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        defaultPoints: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        pointsText: {
            type: DataTypes.STRING
        },
        place: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        season: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: process.env.CURRENT_SEASON
        },
        description: DataTypes.STRING(1000)
    },
    {
        paranoid: false,
        sequelize,
        freezeTableName: true,
        modelName: 'statistic'
    }
);

module.exports = Statistic;
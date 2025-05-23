const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Episode extends Model {}

Episode.init(
    {
        episodeId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        season: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: process.env.CURRENT_SEASON
        },
        airDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        title: DataTypes.STRING(500),
        eliminationCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1  
        },
        immunityCount: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1  
        }
    },
    {
        paranoid: false,
        sequelize,
        freezeTableName: true,
        modelName: 'episode'
    }
);

module.exports = Episode;
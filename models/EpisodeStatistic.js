const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class EpisodeStatistic extends Model {}

EpisodeStatistic.init(
    {
        episodeStatisticId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        episodeId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'episode',
                key: 'episodeId'
            }
        },
        playerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'player',
                key: 'playerId'
            }
        },
        statisticId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'statistic',
                key: 'statisticId'
            }
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        }
    },
    {
        paranoid: false,
        sequelize,
        freezeTableName: true,
        modelName: 'episodeStatistic',
        indexes: [
            {
                unique: true,
                fields: ['playerId', 'episodeId', 'statisticId']
            }
        ]
    }
);

module.exports = EpisodeStatistic;
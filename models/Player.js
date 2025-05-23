const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Player extends Model {}

Player.init(
    {
        playerId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        season: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        eliminatedId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'episode',
                key: 'episodeId'
            }
        },
        photoUrl: DataTypes.STRING(255),
        tribeId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'tribe', 
                key: 'tribeId'
            }
        }
    },
    {
        paranoid: false,
        sequelize,
        freezeTableName: true,
        modelName: 'player'
    }
);

module.exports = Player;
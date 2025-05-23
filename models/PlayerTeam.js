const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class PlayerTeam extends Model {}

PlayerTeam.init(
    {
        playerTeamId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        playerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'player',
                key: 'playerId'
            }
        },
        teamId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'team',
                key: 'teamId'
            }
        }
    },
    {
        paranoid: false,
        sequelize,
        freezeTableName: true,
        modelName: 'playerTeam'
    }
);

module.exports = PlayerTeam;
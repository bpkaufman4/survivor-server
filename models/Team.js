const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Team extends Model {}

Team.init(
    {
        teamId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        ownerId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'user',
                key: 'userId'
            }
        },
        leagueId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'league',
                key: 'leagueId'
            }
        },
        bonus: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        }
    },
    {
        paranoid: false,
        sequelize,
        freezeTableName: true,
        modelName: 'team'
    }
);

module.exports = Team;
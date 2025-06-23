const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class League extends Model {}

League.init(
    {
        leagueId: {
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
        privateInd: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        password: {
            type: DataTypes.STRING,
        }
    },
    {
        paranoid: false,
        sequelize,
        freezeTableName: true,
        modelName: 'league'
    }
);

module.exports = League;
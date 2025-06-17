const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Draft extends Model { }

Draft.init(
  {
    draftId: {
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
    leagueId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'league',
        key: 'leagueId'
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    currentPick: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    paranoid: false,
    sequelize,
    freezeTableName: true,
    modelName: 'draft',
    indexes: [
      {
        unique: true,
        fields: ['season', 'leagueId']
      }
    ]
  }
);

module.exports = Draft;
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class DraftPick extends Model { }

DraftPick.init(
  {
    draftPickId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    draftId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'draft',
        key: 'draftId'
      }
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'team',
        key: 'teamId'
      }
    },
    playerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'player',
        key: 'playerId'
      }
    },
    pickNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    round: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    paranoid: false,
    sequelize,
    freezeTableName: true,
    modelName: 'draftPick'
  }
);

module.exports = DraftPick;
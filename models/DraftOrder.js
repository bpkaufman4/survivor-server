const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class DraftOrder extends Model { }

DraftOrder.init(
  {
    draftOrderId: {
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
    pickNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    }
  },
  {
    paranoid: false,
    sequelize,
    freezeTableName: true,
    modelName: 'draftOrder'
  }
);

module.exports = DraftOrder;
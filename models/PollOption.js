const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class PollOption extends Model { }

PollOption.init(
  {
    pollOptionId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    pollQuestionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'poll_question',
        key: 'poll_question_id'
      }
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    modelName: 'poll_option'
  }
);

module.exports = PollOption;

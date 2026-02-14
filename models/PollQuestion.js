const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class PollQuestion extends Model { }

PollQuestion.init(
  {
    pollQuestionId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    pollId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'poll',
        key: 'poll_id'
      }
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    questionType: {
      type: DataTypes.ENUM('single', 'multiple'),
      defaultValue: 'single',
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
    modelName: 'poll_question'
  }
);

module.exports = PollQuestion;

const { Model, DataTypes } = require("sequelize");
const sequelize = require('../config/connection');

class CorrectAnswer extends Model {};

CorrectAnswer.init({
  correctAnswerId: {
    primaryKey: true,
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4
  },
  questionId: {
    type: DataTypes.UUID,
    references: {
      model: 'question',
      key: 'questionId'
    },
    allowNull: false
  },
  answer: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'correctanswer',
  freezeTableName: true,
  paranoid: false
});

module.exports = CorrectAnswer;
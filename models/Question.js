const { Model, DataTypes } = require("sequelize");
const sequelize = require('../config/connection');

class Question extends Model {};

Question.init({
  questionId: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  surveyId: {
    allowNull: false,
    type: DataTypes.UUID,
    references: {
      model: 'survey',
      key: 'surveyId'
    }
  },
  prompt: {
    allowNull: false,
    type: DataTypes.STRING(1000)
  },
  type: {
    allowNull: false,
    type: DataTypes.STRING(100)
  },
  points: {
    allowNull: false,
    type: DataTypes.INTEGER
  },
  answerCount: {
    allowNull: false,
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  sequelize,
  paranoid: false,
  modelName: 'question',
  freezeTableName: true
})

module.exports = Question;
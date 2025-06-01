const { Model, DataTypes } = require("sequelize");
const sequelize = require('../config/connection');


class AnswerOption extends Model {};

AnswerOption.init({
  questionOptionId: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  questionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'question',
      key: 'questionId'
    }
  },
  answer: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  display: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  paranoid: false,
  sequelize,
  modelName: 'answeroption',
  freezeTableName: true
});

module.exports = AnswerOption;
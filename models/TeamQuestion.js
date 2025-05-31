const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class TeamQuestion extends Model {};

TeamQuestion.init({
  teamQuestionId: {
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
  teamSurveyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'teamsurvey',
      key: 'teamSurveyId'
    }
  },
  completed: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'teamquestion',
  freezeTableName: true,
  paranoid: false
});

module.exports = TeamQuestion;
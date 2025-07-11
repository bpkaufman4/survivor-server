const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class TeamAnswer extends Model {};

TeamAnswer.init({
  teamAnswerId: {
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4
  },
  questionId: {
    allowNull: false,
    type: DataTypes.UUID,
    references: {
      model: 'question',
      key: 'questionId'
    }
  },
  teamSurveyId: {
    allowNull: false,
    type: DataTypes.UUID,
    references: {
      model: 'teamsurvey',
      key: 'teamSurveyId'
    }
  },
  answerOptionId: {
    allowNull: false,
    type: DataTypes.UUID,
    references: {
      model: 'answeroption',
      key: 'questionOptionId'
    }
  }
}, {
  sequelize,
  paranoid: false,
  freezeTableName: true,
  modelName: 'teamanswer'
});

module.exports = TeamAnswer;
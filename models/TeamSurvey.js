const sequelize = require('../config/connection');
const { Model, DataTypes } = require('sequelize');

class TeamSurvey extends Model {};

TeamSurvey.init({
  teamSurveyId: {
    primaryKey: true,
    type: DataTypes.UUID,
    allowNull: false,
    defaultValue: DataTypes.UUIDV4
  },
  surveyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'survey',
      key: 'surveyId'
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
  completed: {
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['surveyId', 'teamId']
    }
  ],
  sequelize,
  freezeTableName: true,
  paranoid: false,
  modelName: 'teamsurvey'
});

module.exports = TeamSurvey;
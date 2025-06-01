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
  teamQuestionId: {
    allowNull: false,
    type: DataTypes.UUID,
    references: {
      model: 'teamquestion',
      key: 'teamQuestionId'
    }
  },
  answerOptionId: {
    allowNull: false,
    type: DataTypes.UUID,
    references: {
      model: 'answerOption',
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
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
  answer: {
    allowNull: false,
    type: DataTypes.STRING(100)
  }
}, {
  sequelize,
  paranoid: false,
  freezeTableName: true,
  modelName: 'teamanswer'
});

module.exports = TeamAnswer;
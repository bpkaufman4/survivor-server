const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class Survey extends Model {}

Survey.init(
  {
    surveyId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    episodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'episode',
        key: 'episodeId'
      }
    }
  },
  {
    paranoid: false,
    sequelize,
    freezeTableName: true,
    modelName: 'survey'
  }
);

module.exports = Survey;
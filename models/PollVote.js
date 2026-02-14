const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/connection');

class PollVote extends Model { }

PollVote.init(
  {
    voteId: {
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
    pollQuestionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'poll_question',
        key: 'poll_question_id'
      }
    },
    pollOptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'poll_option',
        key: 'poll_option_id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'user',
        key: 'userId'
      }
    }
  },
  {
    sequelize,
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    modelName: 'poll_vote'
  }
);

module.exports = PollVote;

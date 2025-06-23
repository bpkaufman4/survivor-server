const User = require('./User');
const League = require('./League');
const Player = require('./Player');
const Team = require('./Team');
const PlayerTeam = require('./PlayerTeam');
const Episode = require('./Episode');
const Statistic = require('./Statistic');
const EpisodeStatistic = require('./EpisodeStatistic');
const AdminNote = require('./AdminNote');
const Tribe = require('./Tribe');
const Survey = require('./Survey');
const Question = require('./Question');
const AnswerOption = require('./AnswerOption');
const TeamSurvey = require('./TeamSurvey');
const TeamAnswer = require('./TeamAnswer');
const Draft = require('./Draft');
const DraftOrder = require('./DraftOrder');
const DraftPick = require('./DraftPick');

League.hasMany(Team, {foreignKey: 'leagueId', as: 'teams', onDelete: 'CASCADE'});
Team.belongsTo(League, {foreignKey: 'leagueId', as: 'league', onDelete: 'CASCADE'});

User.hasMany(Team, {foreignKey: 'ownerId', as: 'teams', onDelete: 'CASCADE'});
Team.belongsTo(User, {foreignKey: 'ownerId', as: 'owner', onDelete: 'CASCADE'});

League.belongsTo(User, {foreignKey: 'ownerId', as: 'owner', onDelete: 'CASCADE'});
User.hasMany(League, {foreignKey: 'ownerId', as: 'leagues', onDelete: 'CASCADE'});

Player.belongsToMany(Team, {through: PlayerTeam, as: 'teams', foreignKey: 'playerId', onDelete: 'CASCADE' });
Team.belongsToMany(Player, { through: PlayerTeam, as: 'players', foreignKey: 'teamId', onDelete: 'CASCADE' });
PlayerTeam.belongsTo(Player, {foreignKey: 'playerId', as: 'player', onDelete: 'CASCADE'});
PlayerTeam.belongsTo(Team, {foreignKey: 'teamId', as: 'team', onDelete: 'CASCADE'});

Player.hasMany(EpisodeStatistic, {foreignKey: 'playerId', as: 'statistics', onDelete: 'CASCADE'});
Episode.hasMany(EpisodeStatistic, {foreignKey: 'episodeId', as: 'statistics', onDelete: 'CASCADE'});
Statistic.hasMany(EpisodeStatistic, {foreignKey: 'statisticId', as: 'statistic', onDelete: 'CASCADE'});
EpisodeStatistic.belongsTo(Player, {foreignKey: 'playerId', as: 'player', onDelete: 'CASCADE'});
EpisodeStatistic.belongsTo(Episode, {foreignKey: 'episodeId', as: 'episode', onDelete: 'CASCADE'});
EpisodeStatistic.belongsTo(Statistic, {foreignKey: 'statisticId', as: 'statistic', onDelete: 'CASCADE'});

Episode.hasMany(Player, {foreignKey: 'eliminatedId', as: 'eliminations', onDelete: 'SET NULL'});
Player.belongsTo(Episode, {foreignKey: 'eliminatedId', as: 'eliminatedEpisode', ondelete: 'SET NULL'});

Player.belongsTo(Tribe, {foreignKey: 'tribeId', as: 'tribe', onDelete: 'SET NULL'});
Tribe.hasMany(Player, {foreignKey: 'playerId', as: 'players', onDelete: 'SET NULL'});

Episode.hasOne(Survey, {foreignKey: 'episodeId', as: 'survey', onDelete: 'CASCADE'});
Survey.belongsTo(Episode, {foreignKey: 'episodeId', as: 'episode', onDelete: 'CASCADE'});

Survey.hasMany(Question, {foreignKey: 'surveyId', as: 'questions', onDelete: 'CASCADE'});
Question.belongsTo(Survey, {foreignKey: 'surveyId', as: 'survey', onDelete: 'CASCADE'});
Survey.hasMany(TeamSurvey, {foreignKey: 'surveyId', as: 'teamSurveys', onDelete: 'CASCADE'});
TeamSurvey.belongsTo(Survey, {foreignKey: 'surveyId', as: 'survey', onDelete: 'CASCADE'});

Question.hasMany(AnswerOption, {foreignKey: 'questionId', as: 'answerOptions', onDelete: 'CASCADE'});
AnswerOption.belongsTo(Question, {foreignKey: 'questionId', as: 'question', onDelete: 'CASCADE'});

TeamSurvey.hasMany(TeamAnswer, {foreignKey: 'teamSurveyId', as: 'teamAnswers', onDelete: 'CASCADE'});
TeamAnswer.belongsTo(TeamSurvey, {foreignKey: 'teamSurveyId', as: 'teamSurvey', onDelete: 'CASCADE'});

AnswerOption.hasMany(TeamAnswer, {foreignKey: 'answerOptionId', as: 'teamAnswers', onDelete: 'CASCADE'});
TeamAnswer.belongsTo(AnswerOption, {foreignKey: 'answerOptionId', as: 'answerOption', onDelete: 'CASCADE'});

Question.hasMany(TeamAnswer, {foreignKey: 'questionId', as: 'teamAnswers', onDelete: 'CASCADE'});
TeamAnswer.belongsTo(Question, {foreignKey: 'questionId', as: 'question', onDelete: 'CASCADE'});

League.hasMany(Draft, {foreignKey: 'leagueId', as: 'drafts', onDelete: 'CASCADE'});
Draft.belongsTo(League, {foreignKey: 'leagueId', as: 'league', onDelete: 'CASCADE'});

Draft.hasMany(DraftOrder, {foreignKey: 'draftId', as: 'draftOrder', onDelete: 'CASCADE'});
DraftOrder.belongsTo(Draft, {foreignKey: 'draftId', as: 'draft', onDelete: 'CASCADE'});

Team.hasMany(DraftOrder, {foreignKey: 'teamId', as: 'draftOrder', onDelete: 'CASCADE'});
DraftOrder.belongsTo(Team, {foreignKey: 'teamId', as: 'team', onDelete: 'CASCADE'});

Draft.hasMany(DraftPick, {foreignKey: 'draftId', as: 'draftPicks', onDelete: 'CASCADE'});
DraftPick.belongsTo(Draft, {foreignKey: 'draftId', as: 'draft', onDelete: 'CASCADE'});

Team.hasMany(DraftPick, {foreignKey: 'teamId', as: 'draftPicks', onDelete: 'CASCADE'});
DraftPick.belongsTo(Team, {foreignKey: 'teamId', as: 'team', onDelete: 'CASCADE'});

Player.hasMany(DraftPick, {foreignKey: 'playerId', as: 'draftPicks', onDelete: 'SET NULL'});
DraftPick.belongsTo(Player, {foreignKey: 'playerId', as: 'player', onDelete: 'SET NULL'});


module.exports = { User, League, Tribe, Player, Team, PlayerTeam, Episode, Statistic, EpisodeStatistic, AdminNote, Survey, Question, AnswerOption, TeamSurvey, TeamAnswer, Draft, DraftOrder, DraftPick };
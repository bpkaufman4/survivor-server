const User = require('../models/User');
const League = require('../models/League');
const Player = require('../models/Player');
const Team = require('../models/Team');
const PlayerTeam = require('../models/PlayerTeam');
const Episode = require('../models/Episode');
const Statistic = require('../models/Statistic');
const EpisodeStatistic = require('../models/EpisodeStatistic');
const AdminNote = require('../models/AdminNote');
const Tribe = require('./Tribe');

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

Player.belongsTo(Tribe, {foreignKey: 'tribeId', as: 'tribe', onDelete: 'CASCADE'});
Tribe.hasMany(Player, {foreignKey: 'playerId', as: 'players', onDelete: 'CASCADE'});


module.exports = { User, League, Tribe, Player, Team, PlayerTeam, Episode, Statistic, EpisodeStatistic, AdminNote };
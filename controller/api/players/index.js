const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Player, Tribe, EpisodeStatistic } = require('../../../models');
const sequelize = require('../../../config/connection');

router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      Player.findAll({
        where: {season: process.env.CURRENT_SEASON},
        include: [
          {
            model: Tribe, 
            as: 'tribe'
          }
        ],
        attributes: {
          include: [
            [
              sequelize.literal(`(
                SELECT IFNULL(SUM(episodeStatistic.points), 0) 
                FROM episodeStatistic 
                WHERE episodeStatistic.playerId = Player.playerId
              )`),
              'totalPoints'
            ],
            [
              sequelize.literal(`(
                SELECT COUNT(*) 
                FROM episodeStatistic 
                WHERE episodeStatistic.playerId = Player.playerId
              )`),
              'episodeCount'
            ]
          ]
        },
        order: [
          [sequelize.literal('totalPoints'), 'DESC']
        ]
      })
      .then(dbData => {
        const players = dbData.map(player => player.get({plain: true}));
        res.json({status: 'success', data: players});
      })
      .catch(err => {
        console.log(err);
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', message: 'invalid token'});
    }
  })
});

module.exports = router;

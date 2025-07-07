const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Team, Player } = require('../../../models');
const sequelize = require('sequelize')

router.get('/:leagueId', (req, res) => {
  const token = req.headers.authorization;
  if(token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if(decoded) {
        Team.findOne({
          where: {
            leagueId: req.params.leagueId,
            ownerId: decoded.id
          },
          include: [
            {
              model: Player,
              as: 'players',
              attributes: {
                include: [
                  [
                    sequelize.literal(`(select ifnull(sum(episodeStatistic.points), 0) from episodeStatistic where episodeStatistic.playerId = players.playerId)`),
                    'totalPoints'
                  ]
                ]
              },
              where: {
                season: process.env.CURRENT_SEASON
              }
            },
          ],
          attributes: {
            include: [
              [
                sequelize.literal(`(select ifnull(sum(episodeStatistic.points), 0) from episodeStatistic where episodeStatistic.playerId in (select playerId from playerTeam where playerTeam.teamId = team.teamId))`), 'totalPoints'
              ]
            ]
          }
        })
        .then(dbData => dbData.get({plain: true}))
        .then(data => {
          res.json({status: 'success', data});
        })
        .catch(err => {
          console.log(err);
          res.json({status: 'fail', err});
        })
      }
    })
  } else {
    res.json({status: 'fail', message: 'No token provided'})
  }
})

module.exports = router;
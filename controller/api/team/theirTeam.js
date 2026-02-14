const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Team, Player } = require('../../../models');
const sequelize = require('sequelize')

router.get('/:teamId', (req, res) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (decoded) {
        Team.findOne({
          where: {
            teamId: req.params.teamId
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
                sequelize.literal(`(select ifnull(sum(episodeStatistic.points), 0) from episodeStatistic join player p on p.playerId = episodeStatistic.playerId where p.season = ${process.env.CURRENT_SEASON} and episodeStatistic.playerId in (select playerId from playerTeam where playerTeam.teamId = team.teamId))`), 'totalPoints'
              ]
            ]
          }
        })
          .then(dbData => {
            console.log(dbData);
            if (dbData) {
              res.json({ status: 'success', data: dbData.get({ plain: true }) });
            } else {
              res.json({ status: 'success', data: [] });
            }
          })
          .catch(err => {
            console.log(err);
            res.json({ status: 'fail', err });
          })
      }
    })
  } else {
    res.json({ status: 'fail', message: 'No token provided' })
  }
})

module.exports = router;
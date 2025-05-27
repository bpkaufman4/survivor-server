const router = require('express').Router();
const sequelize = require('../../../config/connection');
const { Player } = require('../../../models');
const byLeagueRoute = require('./byLeague');
const jwt = require('jsonwebtoken');
router.use('/byLeague', byLeagueRoute);

const byTeamRoute = require('./byTeam');
router.use('/byTeam', byTeamRoute);

router.get('/:playerId', (req, res) => {
  const token = req.headers.authorization;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      Player.findOne({
        where: {
          playerId: req.params.playerId
        },
        attributes: {
          include: [
            [
              sequelize.literal(`(select ifnull(sum(episodeStatistic.points), 0) from episodeStatistic where episodeStatistic.playerId = player.playerId)`),
              'totalPoints'
            ]
          ]
        }
      })
      .then(data => {
        data = data.get({plain: true})
        res.json({status: 'success', data});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', err});
    }
  })
})

module.exports = router;
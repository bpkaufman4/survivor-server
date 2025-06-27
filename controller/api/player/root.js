const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Player, Tribe } = require('../../../models');
const sequelize = require('../../../config/connection');

router.get('/', (req, res) => {

  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      Player.findAll({
        where: {season: process.env.CURRENT_SEASON},
        include: {model: Tribe, as: 'tribe'}
      })
      .then(dbData => {
        return dbData.map(player => player.get({plain: true}));
      })
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', err});
    }
  })
});

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
});

router.post('/', (req, res) => {
  const token = req.headers.authorization;
  const player = req.body;
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      if(!player.playerId) {
        Player.create(player)
        .then(data => {
          res.json({status: 'success', data})
        })
        .catch(err => {
          res.json({status: 'fail', err});
        })
      } else {
        Player.update(player, {where: {playerId: player.playerId}})
        .then(data => {
          res.json({status: 'success', data});
        })
        .catch(err => {
          res.json({status: 'fail', err});
        })
      }
    } else {
      res.json({status: 'fail', err});
    }
  })
})

module.exports = router;
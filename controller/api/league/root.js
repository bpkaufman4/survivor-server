const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { League, Team, User } = require('../../../models');
const sequelize = require('../../../config/connection');

router.get('/:leagueId', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      League.findOne({
        where: {
          leagueId: req.params.leagueId
        }
      })
      .then(dbLeague => {
        return dbLeague.get({plain: true})
      })
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', message: 'invalid token'});
    }
  })
})

router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      League.findAll({
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Team,
            as: 'teams'
          },
          {
            model: User,
            as: 'owner'
          }
        ],
        attributes: {
          include: [
            [sequelize.literal(`COUNT(teams.leagueId)`), 'teamsCount']
          ]
        },
        group: ['leagueId']
      })
      .then(dbLeague => dbLeague.map(l => l.get({plain: true})))
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        console.log(err);
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', err});
    }
  })
})

module.exports = router;
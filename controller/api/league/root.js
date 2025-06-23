const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { League, Team, User, Draft } = require('../../../models');
const sequelize = require('../../../config/connection');

router.get('/:leagueId', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      League.findOne({
        where: {
          leagueId: req.params.leagueId
        },
        include: [
          {
            model: Draft,
            as: 'drafts',
            on: {
              season: process.env.CURRENT_SEASON,
              leagueId: req.params.leagueId,
              complete: false
            }
          }
        ]
      })
      .then(dbLeague => {
        if(dbLeague) return dbLeague.get({plain: true});
        return {};
      })
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        console.log(err);
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
});

router.patch('/:leagueId', (req, res) => {
  const token = req.headers.authorization;
  const body = req.body;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    try {
      if (decoded) {
        console.log(req.params.leagueId, body);
        let where = {leagueId: req.params.leagueId};
        if(decoded.userType !== 'ADMIN') where.ownerId = decoded.id;
        League.update(body, {where})
          .then(data => {
            if (data) {
              res.json({ status: 'success', data });
            } else {
              throw new Error(JSON.stringify(data));
            }
          })
          .catch(err => {
            throw new Error(err);
          })
      } else if (err) {
        throw new Error(err);
      } else {
        throw new Error("JWT error");
      }
    } catch (err) {
      res.json({status: 'fail', err})
    }
  })
})

module.exports = router;
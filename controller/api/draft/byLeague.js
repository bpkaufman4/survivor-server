const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Draft, DraftOrder, DraftPick, Team } = require('../../../models');

router.get('/:leagueId', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (decoded) {
      Draft.findOne({
        where: {
          leagueId: req.params.leagueId
        },
        include: [
          {
            model: DraftOrder,
            as: 'draftOrder',
            include: {
              model: Team,
              as: 'team',
              include: ['owner']
            }
          },
          {
            model: DraftPick,
            as: 'draftPicks',
            include: {
              model: Team,
              as: 'team',
              include: ['owner']
            }
          }
        ],
        order: [
          ['draftOrder', 'pickNumber', 'ASC'],
          ['draftPicks', 'pickNumber', 'ASC']
        ]
      })
        .then(dbData => {
          if (dbData) {
            const data = dbData.get({plain: true});
            res.json({ status: 'success', data });
          } else {
            res.json({ status: 'success', data: null });
          }
        })
        .catch(err => {
          console.log(err);
          res.json({ status: 'fail', err });
        })
    } else if (err) {
      console.log(err);
      res.json({ status: 'fail', err });
    } else {
      res.json({ status: 'fail', err: 'JWT Error' });
    }
  })
})

module.exports = router;
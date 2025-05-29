const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Tribe } = require('../../../models');

router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      Tribe.findAll({
        where: {
          season: process.env.CURRENT_SEASON
        }
      })
      .then(dbData => {
        return dbData.map(tribe => tribe.get({plain: true}));
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

module.exports = router;
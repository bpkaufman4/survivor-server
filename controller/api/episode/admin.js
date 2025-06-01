const { Episode } = require('../../../models');
const jwt = require('jsonwebtoken');
const router = require('express').Router();

router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      Episode.findAll({
        where: {
          season: process.env.CURRENT_SEASON
        },
        order: [[`airDate`, 'DESC']]
      })
      .then(dbData => {
        return dbData.map(row => row.get({plain: true}));
      })
      .then(data => {
        res.json({status: 'success', data})
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', err});
    }
  });

})

module.exports = router;
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Player, Tribe } = require('../../../models');

router.get('/', (req, res) => {

  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
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
})

module.exports = router;
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { League } = require('../../../models');

router.get('/:leagueId', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      if(decoded.userType === 'ADMIN') {
        res.json({status: 'success', access: true});
      } else {
        League.findOne({
          where: {
            leagueId: req.params.leagueId,
            ownerId: decoded.id
          }
        })
        .then(data => {
          if(data) {
            res.json({status: 'success', access: true});
          } else {
            res.json({status: 'success', access: false});
          }
        })
        .catch(err => {
          console.log(err);
          res.json({status: 'fail', err, access: false});
        })
      }
    } else {
      res.json({status: 'fail', err, access: false});
    }
  })
})

module.exports = router;
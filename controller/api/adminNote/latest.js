const { AdminNote } = require('../../../models');
const jwt = require('jsonwebtoken');
const router = require('express').Router();

router.get('/', (req, res) => {

  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if(decoded) {
      AdminNote.findOne({order: [[`createdAt`, 'DESC']]})
      .then(dbData => {
        return dbData.get({plain: true});
      })
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', message: 'invalid token', error});
    }
  })
})


module.exports = router;
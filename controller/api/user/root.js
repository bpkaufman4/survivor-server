const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { User } = require('../../../models');

router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    User.findAll()
    .then(data => {
      res.json({status: 'success', data});
    })
    .catch(err => {
      console.log(err);
      res.json({status: 'fail', err});
    })
  })
})

module.exports = router;
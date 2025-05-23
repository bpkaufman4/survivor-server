const { User } = require('../../../models');

const router = require('express').Router();

router.post('/', (req, res) => {
  console.log(req.body);
  res.json(req.body);
})

module.exports = router;
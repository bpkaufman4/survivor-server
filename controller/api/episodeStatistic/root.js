const router = require('express').Router();
const jwt = require('jsonwebtoken')
const { EpisodeStatistic } = require('../../../models');

router.post('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      const episodeStatistic = req.body;
      EpisodeStatistic.upsert(episodeStatistic)
      .then(dbData => {
        res.json({status: 'success', data: dbData[0]});
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
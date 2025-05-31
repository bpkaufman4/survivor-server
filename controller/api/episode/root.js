const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Episode } = require('../../../models');

router.post('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      const episode = req.body;
      Episode.upsert(episode)
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

router.delete('/:episodeId', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      Episode.destroy({
        where: {
          episodeId: req.params.episodeId
        }
      })
      .then(dbData => {
        if(dbData) {
          res.json({status: 'success', dbData});
        } else {
          res.json({status: 'fail', dbData})
        }
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
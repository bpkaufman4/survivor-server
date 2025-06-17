const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Draft } = require('../../../models');

router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (decoded) {
      Draft.findAll({})
        .then(dbData => dbData.map(draft => draft.get({ plain: true })))
        .then(data => {
          if (data) {
            res.json({ status: 'success', data });
          } else {
            res.json({ status: 'fail', data });
          }
        })
        .catch(err => {
          res.json({ status: 'fail', err });
        })
    } else if (err) {
      res.json({ status: 'fail', err });
    } else {
      res.json({ status: 'fail', err: 'JWT Error' });
    }
  })
});

router.post('/', (req, res) => {
  const token = req.headers.authorization;
  const body = req.body;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (decoded) {
      Draft.create(body)
        .then(data => {
          if (data) {
            res.json({ status: 'success', data });
          } else {
            res.json({ status: 'fail', data });
          }
        })
        .catch(err => {
          res.json({ status: 'fail', err });
        })
    } else if (err) {
      res.json({ status: 'fail', err });
    } else {
      res.json({ status: 'fail', err: 'JWT Error' });
    }
  })
})

module.exports = router;
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

router.get('/:id', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      Tribe.findOne({
        where: {
          tribeId: req.params.id,
          season: process.env.CURRENT_SEASON
        }
      })
      .then(dbData => {
        if(!dbData) {
          return res.json({status: 'fail', message: 'Tribe not found'});
        }
        res.json({status: 'success', data: dbData.get({plain: true})});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', err});
    }
  })
});

router.patch('/:id', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      Tribe.update(req.body, {
        where: {
          tribeId: req.params.id,
          season: process.env.CURRENT_SEASON
        }
      })
      .then(() => {
        res.json({status: 'success', message: 'Tribe updated successfully'});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', err});
    }
  })
});

router.delete('/:id', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      Tribe.destroy({
        where: {
          tribeId: req.params.id,
          season: process.env.CURRENT_SEASON
        }
      })
      .then(() => {
        res.json({status: 'success', message: 'Tribe deleted successfully'});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', err});
    }
  })
});

router.post('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      Tribe.create({
        ...req.body,
        season: process.env.CURRENT_SEASON
      })
      .then(dbData => {
        res.json({status: 'success', data: dbData.get({plain: true})});
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
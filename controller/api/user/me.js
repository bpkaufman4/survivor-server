const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { User } = require('../../../models');

router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      User.findOne({
        where: {
          userId: decoded.id
        },
        attributes: ['firstName', 'lastName', 'userId', 'email', 'emailVerified', 'emailOptIn', 'emailPreferences']
      })
      .then(dbData => {
        const data = dbData.get({plain: true});
        
        // Parse emailPreferences if it's a string
        if (data.emailPreferences && typeof data.emailPreferences === 'string') {
          try {
            data.emailPreferences = JSON.parse(data.emailPreferences);
          } catch (error) {
            console.error('Error parsing emailPreferences:', error);
            data.emailPreferences = null;
          }
        }
        
        res.json({status: 'success', data});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else if (err) {
      res.json({status: 'fail', err});
    } else {
      res.json({status: 'fail', err: 'jwt decoding error'});
    }
  })
});

router.patch('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      User.update(req.body, {
        where: {
          userId: decoded.id
        }
      })
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        console.log(err);
        res.json({status: 'fail', err});
      })
    } else if (err) {
      res.json({status: 'fail', err});
    } else {
      res.json({status: 'fail', err: 'jwt decoding error'});
    }
  })
})

module.exports = router;
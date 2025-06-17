const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { AdminNote } = require('../../../models');

router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      AdminNote.findAll({order: [[`createdAt`, 'DESC']]})  
      .then(dbData => {
        return dbData.map(note => note.get({plain: true}));
      })
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', message: 'Verification failed'});
    }
  })
});

router.post('/', (req, res) => {
  
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      AdminNote.upsert(req.body) 
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', message: 'Verification failed'});
    }
  })

})

router.delete('/:adminNoteId', (req, res) => {
  
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      AdminNote.destroy({
        where: {
          adminNoteId: req.params.adminNoteId
        }
      }) 
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', message: 'Verification failed'});
    }
  })

})

module.exports = router;
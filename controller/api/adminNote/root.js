const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { AdminNote } = require('../../../models');
const sendAdminNote = require('../../../mail/adminNote');

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

router.post('/', async (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      try {
        // Create the admin note
        const data = await AdminNote.upsert(req.body);
        
        // Send email to users with latest updates enabled
        console.log('Admin note created, sending emails...');
        const emailResult = await sendAdminNote(
          req.body.note, 
          new Date().toLocaleDateString()
        );
        
        console.log('Email sending result:', emailResult);
        
        res.json({
          status: 'success', 
          data,
          emailSummary: emailResult.summary || null
        });
      } catch (error) {
        console.error('Error creating admin note or sending emails:', error);
        res.json({status: 'fail', err: error});
      }
    } else {
      res.json({status: 'fail', message: 'Verification failed'});
    }
  });
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
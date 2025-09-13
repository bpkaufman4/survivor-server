const router = require('express').Router({ mergeParams: true });
const jwt = require('jsonwebtoken');
const { Team } = require('../../../models');

router.put('/', async (req, res) => {
  const token = req.headers.authorization;
  const body = req?.body;
  const teamId = req.params.teamId; // Extract the teamId from the URL parameter
  
  if(token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if(decoded) {
        console.log('Request body:', body);
        console.log('Team ID from params:', teamId);
        console.log('All params:', req.params);

        if(!body.name || body.name.trim() === '') {
          return res.json({status: 'fail', message: 'Team name is required'});
        }

        Team.update(
          { name: body.name.trim() },
          { where: { teamId, ownerId: decoded.id } }
        ).then(() => {
          res.json({status: 'success', message: 'Team name updated successfully'});
        }).catch((error) => {
          console.error('Error updating team name:', error);
          res.json({status: 'fail', message: 'Server error'});
        });
      } else {
        res.json({status: 'fail', message: 'Invalid token'});
      }
    })
  } else {
    res.json({status: 'fail', message: 'No token provided'})
  }
})

module.exports = router;
const { User } = require('../../../models');
const jwt = require('jsonwebtoken');

const router = require('express').Router();

router.post('/', async (req, res) => {
  const user = req.body;
  if(!user.username || !user.pwd || !user.lastName || !user.firstName) {
      res.json({status: 'fail', message: 'Incomplete request'});
      return;
  } 

  // Check if user already exists
  const existingUser = await User.findOne({ where: { username: user.username } });
  if(existingUser) {
      res.json({status: 'fail', message: 'Username already exists'});
      return;
  }

  User.create(user)
  .then(reply => {
      const user = reply.get({plain: true});
      
      const token = jwt.sign({ id: user.userId, userType: user.userType }, process.env.JWT_SECRET, {
          expiresIn: '2 days'
      });
      
      res.json({
          status: 'success', 
          data: user,
          token: token,
          target: '/'
      });
  })
  .catch(err => {
      res.json({status: 'fail', message: err});
  })
})

module.exports = router;
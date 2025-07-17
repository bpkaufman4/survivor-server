const { User } = require('../../../models');
const { Op } = require('sequelize');

const jwt = require('jsonwebtoken');
const router = require('express').Router();

router.post('/', (req, res) => {
  const request = req.body;
  let returnValue = {};

  // Allow login with either username or email
  User.findOne({
      where: {
        [Op.or]: [
          { username: request.username },
          { email: request.username } // Use username field for both username and email input
        ]
      }
  })
  .then(reply => {
      if(!reply || !reply.checkPassword(request.pwd)) {
          returnValue.status = 'fail';
          returnValue.message = 'Invalid username/email or password';
          res.json(returnValue);
      } else {
          const user = reply.get({plain: true});

          returnValue.status = 'success';
          returnValue.message = 'Success';

          const token = jwt.sign({ id: user.userId, userType: user.userType }, process.env.JWT_SECRET, {
            expiresIn: '2 days'
          })

          returnValue.token = token;
          returnValue.target = user.userType === 'ADMIN' ? '/admin/episodes' : '/';
          returnValue.userType = user.userType;

          res.json(returnValue);
      }
  })
  .catch(err => {
    console.log(err);
    res.json({status: 'fail', message: 'error occurred', err})
  })
})

const checkRoute = require('./check');
router.use('/check', checkRoute);

const checkAdminRoute = require('./checkAdmin');
router.use('/checkAdmin', checkAdminRoute);

module.exports = router;
const { User } = require('../../../models');

const jwt = require('jsonwebtoken');
const router = require('express').Router();

router.post('/', (req, res) => {
  const request = req.body;
  let returnValue = {};

  console.log('login attempt', request);

  User.findOne({
      where: {username: request.username}
  })
  .then(reply => {
      console.log(reply);
      if(!reply || !reply.checkPassword(request.pwd)) {
          returnValue.status = 'fail';
          returnValue.message = 'Invalid Login';
          res.json(returnValue);
      } else {
          const user = reply.get({plain: true});

          returnValue.status = 'success';
          returnValue.message = 'Success';

          const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, {
            expiresIn: '2 days'
          })

          returnValue.token = token;

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

module.exports = router;
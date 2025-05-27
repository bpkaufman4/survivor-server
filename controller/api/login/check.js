const router = require('express').Router();
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => {
  jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err, decoded) => {
    
    if(decoded) {
      res.json({status: 'success', data: decoded, verified: true});
    } else {
      res.json({status: 'fail', err, verified: false});
    }
    
  })
})

module.exports = router;
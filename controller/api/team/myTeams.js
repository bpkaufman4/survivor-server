const jwt = require('jsonwebtoken');
const { Team } = require('../../../models');
const router = require('express').Router();

router.get('/', (req, res) => {
  
  const token = req.headers.authorization;
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      Team.findAll({where: {ownerId: decoded.id}, include: ['league']})
      .then(dbData => {
          const teams = dbData.map(team => team.get({plain: true}));
          res.json({status: 'success', data: teams});
      })
      .catch(err => {
          console.log(err);
          res.json({status: 'fail', err});
      });
    }
    
    if(err) {
      res.json({status: 'fail', err});
    }
  });

})

module.exports = router;
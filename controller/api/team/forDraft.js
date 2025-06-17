const jwt = require('jsonwebtoken');
const { Team } = require('../../../models');
const router = require('express').Router();

router.get('/:leagueId', (req, res) => {
  
  const token = req.headers.authorization;
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      Team.findAll({
        where: {
          leagueId: req.params.leagueId
        }, 
        include: ['draftOrder', 'owner'],
        order: [['draftOrder', 'pickNumber', 'ASC'], ['teamId', 'ASC']]
      })
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
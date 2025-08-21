const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { League, User } = require('../../../models');
const sequelize = require('../../../config/connection');

router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      // Find all leagues where the user does NOT have a team
      League.findAll({
        where: sequelize.where(
          sequelize.col('league.leagueId'),
          'NOT IN',
          sequelize.literal(`(
            SELECT DISTINCT leagueId 
            FROM team 
            WHERE ownerId = '${decoded.id}'
          )`)
        ),
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['userName']
          }
        ],
        attributes: {
          exclude: ['password']
        }
      })
      .then(dbLeagues => {
        const leagues = dbLeagues.map(league => league.get({plain: true}));
        res.json({status: 'success', data: leagues});
      })
      .catch(err => {
        console.log(err);
        res.json({status: 'fail', err});
      });
    } else {
      res.json({status: 'fail', message: 'invalid token'});
    }
    
    if(err) {
      res.json({status: 'fail', err});
    }
  });
});

module.exports = router;
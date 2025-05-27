const { QueryTypes } = require('sequelize');
const sequelize = require('../../../config/connection');
const jwt = require('jsonwebtoken');

const router = require('express').Router();

router.get('/', (req, res) => {
  
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      sequelize.query(
        `SELECT
            p.playerId,
            p.firstName,
            p.lastName,
            (SELECT IFNULL(SUM(es.points), 0) FROM episodeStatistic es WHERE es.playerId = p.playerId) totalPoints,
            pt.teamId,
            t.ownerId
        FROM player p
        INNER JOIN playerTeam pt on p.playerId = pt.playerId and pt.teamId = '${req.query.teamId}'
        LEFT JOIN team t on t.teamId = pt.teamId
        WHERE p.season = ${process.env.CURRENT_SEASON}
        ORDER BY totalPoints DESC`,
        {type: QueryTypes.SELECT}
      )
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', err});
    }
  })
});

module.exports = router;
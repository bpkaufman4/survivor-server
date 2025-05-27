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
          p.photoUrl,
          (
            (
              select
                ifnull(sum(es.points), 0)
              from episodeStatistic es 
              where es.playerId = p.playerId
            ) * 1
          ) totalPoints,
          ROW_NUMBER() OVER (
            ORDER BY (
              (
                select 
                  ifnull(sum(es.points), 0)
                from episodeStatistic es 
                where es.playerId = p.playerId
              ) * 1
            ) DESC
          ) as place,
          (
            SELECT 
              t.name 
            from team t 
            where t.teamId in (
              SELECT 
                pt.teamId 
              from playerTeam pt 
              where pt.playerId = p.playerId
            ) and t.leagueId = '${req.query.leagueId}'
          ) teamName
        FROM player p
        WHERE p.season = ${process.env.CURRENT_SEASON}
        order by place ASC`,
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
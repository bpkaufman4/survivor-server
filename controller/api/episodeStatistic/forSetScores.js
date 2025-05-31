const router = require('express').Router();
const jwt = require('jsonwebtoken');
const sequelize = require('../../../config/connection');
const { QueryTypes } = require('sequelize');

router.get('/:episodeId', (req, res) => {

  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded && decoded.userType === 'ADMIN') {
      sequelize.query(
        `SELECT 
            p.playerId,
            p.firstName,
            p.lastName,
            e.episodeId,
            e.title,
            e.airDate,
            s.statisticId,
            s.description,
            s.name,
            s.defaultPoints,
            IFNULL(es.points, 0) points,
            if(p.eliminatedId = e.episodeId, true, false) eliminated,
            es.episodeStatisticId
        FROM player p 
        CROSS JOIN episode e 
        CROSS JOIN statistic s 
        LEFT JOIN episodeStatistic es ON es.playerId = p.playerId 
            AND es.episodeId = e.episodeId 
            AND es.statisticId = s.statisticId 
        LEFT JOIN episode e2 on e2.episodeId = p.eliminatedId
        WHERE p.season = ${process.env.CURRENT_SEASON} 
            AND e.episodeId = '${req.params.episodeId}' 
            AND (
                e2.airDate is null
                OR
                e2.airDate > e.airDate
                OR
                e2.episodeId = e.episodeId
            )
        ORDER BY p.lastName, s.place ASC`, 
        {type: QueryTypes.SELECT}
      )
      .then(dbData => {
        let playersRender = {};
        let labels = [];

        dbData.forEach(es => {
          if(!labels.includes(es.name)) labels.push(es.name);

          if(!playersRender[es.playerId]) {
              playersRender[es.playerId] = {
                  firstName: es.firstName,
                  lastName: es.lastName,
                  eliminated: es.eliminated,
                  playerId: es.playerId,
                  episodeId: es.episodeId,
                  stats: [es]
              }
          } else {
              playersRender[es.playerId].stats.push(es);
          }
        })

        res.json({status: 'success', data: {players: playersRender, labels}});
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
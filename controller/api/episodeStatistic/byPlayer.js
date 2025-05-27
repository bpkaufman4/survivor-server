const router = require('express').Router();
const jwt = require('jsonwebtoken');
const sequelize = require('../../../config/connection');
const { QueryTypes } = require('sequelize');
const { DateTime } = require('luxon');

router.get('/:playerId', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      const statistics = sequelize.query(
        `SELECT 
            p.playerId,
            e.episodeId,
            e.airDate,
            s.statisticId,
            s.description,
            s.name,
            s.defaultPoints,
            IFNULL(es.points, 0) points,
            es.episodeStatisticId 
        FROM player p 
        CROSS JOIN episode e 
        CROSS JOIN statistic s 
        LEFT JOIN episodeStatistic es ON es.playerId = p.playerId 
            AND es.episodeId = e.episodeId 
            AND es.statisticId = s.statisticId 
        WHERE p.season = e.season 
            AND p.playerId = '${req.params.playerId}' 
        ORDER BY e.airDate DESC, s.place`, 
        {type: QueryTypes.SELECT}
      )
      .catch(err => {
        res.json({status: 'fail', err});
      });

      const viewStatistics = sequelize.query(`
        SELECT
            es.episodeId,
            es.points,
            s.name
        FROM episodeStatistic es
        LEFT JOIN statistic s on es.statisticId = s.statisticId
        WHERE es.playerId = '${req.query.playerId}'
        AND (es.points * 1) <> 0
        `,
        {type: QueryTypes.SELECT})
      .catch(err => {
        res.json({status: 'fail', err});
      });

      Promise.all([statistics, viewStatistics])
      .then(([statistics, viewStatistics]) => {
        let episodes = {};

        statistics.forEach(e => {
            if(!episodes[e.episodeId]) episodes[e.episodeId] = {airDate: DateTime.fromJSDate(e.airDate).toLocaleString(), episodeId: e.episodeId, totalPoints:0, statistics: []};
            episodes[e.episodeId].statistics.push({defaultPoints: e.defaultPoints, points: e.points, name: e.name, statisticId: e.statisticId, episodeStatisticId: e.episodeStatisticId, description: e.description});
            episodes[e.episodeId].totalPoints += e.points;
        });
      
        viewStatistics.forEach(s => {
            if(!episodes[s.episodeId].viewStatistics) episodes[s.episodeId].viewStatistics = [];
            episodes[s.episodeId].viewStatistics.push(s);
        });

        res.json({status: 'success', data: episodes});
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
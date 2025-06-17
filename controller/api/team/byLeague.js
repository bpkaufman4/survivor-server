const jwt = require('jsonwebtoken');
const sequelize = require('../../../config/connection');
const { QueryTypes } = require('sequelize');
const router = require('express').Router();

router.get('/', (req, res) => {
  
  const token = req.headers.authorization;
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {

      sequelize.query(
        `SELECT 
            *,
            (cte2.basePoints + cte2.bonus) AS totalPoints
        FROM (
            SELECT
                t.name,
                t.ownerId,
                t.teamId,
                u.firstName,
                u.lastName,
                COALESCE(GROUP_CONCAT(CONCAT(p.firstName, ' ', p.lastName, ' - ', COALESCE(cte.points, 0)) SEPARATOR '<br>'), '') AS playersHTML,
                COALESCE(SUM(cte.points), 0) AS basePoints,
                (
                    SELECT COALESCE(SUM(q.points), 0)
                    FROM answeroption ao
                    LEFT JOIN question q ON q.questionId = ao.questionId
                    INNER JOIN teamanswer ta ON ta.answerOptionId = ao.questionOptionId
                    LEFT JOIN teamsurvey ts ON ts.teamSurveyId = ta.teamSurveyId
                    LEFT JOIN survey s ON ts.surveyId = s.surveyId
                    LEFT JOIN episode e ON e.episodeId = s.episodeId
                    WHERE ao.correct = TRUE
                      AND ts.teamId = t.teamId
                      AND e.season = ${process.env.CURRENT_SEASON}
                ) AS bonus
            FROM team t
            LEFT JOIN user u ON u.userId = t.ownerId
            LEFT JOIN playerTeam pt ON pt.teamId = t.teamId
            LEFT JOIN player p ON p.playerId = pt.playerId AND p.season = ${process.env.CURRENT_SEASON}
            LEFT JOIN (
                SELECT
                    es.playerId,
                    SUM(es.points) AS points
                FROM episodeStatistic es
                GROUP BY es.playerId
            ) cte ON pt.playerId = cte.playerId
            WHERE t.leagueId = '${req.query.leagueId}'
            GROUP BY t.teamId
        ) cte2
        ORDER BY totalPoints DESC;`,
        {type: QueryTypes.SELECT}
      )
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        res.json({status: 'fail', err});
      })

    }
    if(err) {
      res.json({status: 'fail', err});
    }
  })
})

module.exports = router;
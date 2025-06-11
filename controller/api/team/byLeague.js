const jwt = require('jsonwebtoken');
const { Team } = require('../../../models');
const sequelize = require('../../../config/connection');
const { QueryTypes } = require('sequelize');
const router = require('express').Router();

router.get('/', (req, res) => {
  
  const token = req.headers.authorization;
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
        const playersHTML = `(
                    select 
                         
                    from playerTeam pt1 
                    left join player p1 on pt1.playerId = p1.playerId and p1.season = ${process.env.CURRENT_SEASON} 
                    where pt1.teamId = t.teamId
                ) as playersHTML`

        const columns = `,;`

      sequelize.query(
        `SELECT *, (cte2.basePoints + cte2.bonus) totalPoints 
        FROM (
            SELECT 
                t.name,
                t.ownerId,
                t.teamId,
                u.firstName,
                u.lastName,
                group_concat(concat(p.firstName, ' ', p.lastName, ' - ', cte.points)  SEPARATOR '<br>') as playersHTML,
                SUM(cte.points) as basePoints,
                (
                    SELECT 
                        SUM(q.points)
                    FROM answeroption ao
                    LEFT JOIN question q on q.questionId = ao.questionId
                    INNER JOIN teamanswer ta on ta.answerOptionId = ao.questionOptionId
                    LEFT JOIN teamsurvey ts on ts.teamSurveyId = ta.teamSurveyId
                    LEFT JOIN survey s on ts.surveyId = s.surveyId
                    LEFT JOIN episode e on e.episodeId = s.episodeId
                    WHERE ao.correct = true
                        AND ts.teamId = t.teamId
                        AND e.season = ${process.env.CURRENT_SEASON}
                ) bonus
            FROM (
                SELECT
                    es.playerId,
                    SUM(es.points) AS points,
                    pt.teamId
                FROM episodeStatistic es
                LEFT JOIN playerTeam pt on es.playerId = pt.playerId
                LEFT JOIN team t ON t.teamId = pt.teamId
                WHERE t.leagueId = '${req.query.leagueId}'
                GROUP BY es.playerId, pt.teamId
            ) cte
            LEFT JOIN player p ON p.playerId = cte.playerId
            LEFT JOIN team t on cte.teamId = t.teamId
            LEFT JOIN user u on u.userId = t.ownerId
            WHERE p.season = ${process.env.CURRENT_SEASON}
            GROUP BY cte.teamId
        ) cte2
        ORDER BY totalPoints DESC`,
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
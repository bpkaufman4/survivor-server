const jwt = require('jsonwebtoken');
const { Team } = require('../../../models');
const sequelize = require('../../../config/connection');
const { QueryTypes } = require('sequelize');
const router = require('express').Router();

router.get('/', (req, res) => {
  
  const token = req.headers.authorization;
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      sequelize.query(
        `SELECT * FROM (
            SELECT
                t.teamId,
                t.name,
                u.firstName,
                u.lastName,
                (
                    (
                        (
                            SELECT
                                count(*)
                            FROM eliminationChoice ec
                            INNER JOIN player p
                            ON p.playerId = ec.playerId
                            AND p.eliminatedId = ec.episodeId
                            AND p.season = ${process.env.CURRENT_SEASON}
                            WHERE t.teamId = ec.teamId
                        ) * 5
                    ) + (
                        (
                            SELECT 
                                count(*)
                            FROM immunityChoice ic
                            LEFT JOIN immunity i ON i.tribeId = ic.tribeId
                            LEFT JOIN immunity i2 on i2.playerId = ic.playerId
                            LEFT JOIN player p on p.playerId = ic.playerId
                            LEFT JOIN tribe trb on trb.tribeId = ic.tribeId
                            WHERE (
                                ic.tribeId = i.tribeId
                                OR
                                ic.playerId = i2.playerId
                            )
                            AND 
                            (
                                ic.episodeId = i.episodeId
                                OR
                                ic.episodeId = i2.episodeId
                            )
                            AND ic.teamId = t.teamId
                            AND (
                                p.season = ${process.env.CURRENT_SEASON}
                                OR
                                trb.season = ${process.env.CURRENT_SEASON}
                            )
                        ) * 2
                    )
                ) + t.bonus as \`bonus\`,
                if(t.ownerId = '${decoded.id}', 1, 0) as isMine,
                (
                    select 
                        group_concat(concat(p1.firstName, ' - ', (select ifnull(sum(es1.points), 0) from episodeStatistic es1 where es1.playerId = pt1.playerId)) SEPARATOR '<br>') 
                    from playerTeam pt1 
                    left join player p1 on pt1.playerId = p1.playerId and p1.season = ${process.env.CURRENT_SEASON} 
                    where pt1.teamId = t.teamId
                ) as playersHTML,
                (
                    (
                        (select 
                            ifnull(sum(es.points), 0) 
                            from episodeStatistic es 
                            where es.playerId in (select pt.playerId from playerTeam pt inner join player p2 on p2.playerId = pt.playerId and p2.season = ${process.env.CURRENT_SEASON} where pt.teamId = t.teamId)
                        ) * 1
                    ) + (
                        (
                            SELECT
                                count(*)
                            FROM eliminationChoice ec
                            INNER JOIN player p
                            ON p.playerId = ec.playerId
                            AND p.eliminatedId = ec.episodeId
                            AND p.season = ${process.env.CURRENT_SEASON}
                            WHERE t.teamId = ec.teamId
                        ) * 5
                    ) + (
                        (
                            SELECT 
                                count(*)
                            FROM immunityChoice ic
                            LEFT JOIN immunity i ON i.tribeId = ic.tribeId
                            LEFT JOIN immunity i2 on i2.playerId = ic.playerId
                            LEFT JOIN player p on p.playerId = ic.playerId
                            LEFT JOIN tribe trb on trb.tribeId = ic.tribeId
                            WHERE (
                                ic.tribeId = i.tribeId
                                OR
                                ic.playerId = i2.playerId
                            )
                            AND 
                            (
                                ic.episodeId = i.episodeId
                                OR
                                ic.episodeId = i2.episodeId
                            )
                            AND ic.teamId = t.teamId
                            AND (
                                p.season = ${process.env.CURRENT_SEASON}
                                OR
                                trb.season = ${process.env.CURRENT_SEASON}
                            )
                        ) * 2
                    )
                ) + t.bonus totalPoints
            FROM team t
            LEFT JOIN user u ON u.userId = t.ownerId
            WHERE t.leagueId = '${req.query.leagueId}'
        )
        cte
        ORDER BY totalPoints DESC
        `,
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
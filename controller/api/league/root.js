const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { League, Team, User, Draft, Player, Tribe, PlayerTeam } = require('../../../models');
const sequelize = require('../../../config/connection');

router.get('/:leagueId', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {
      League.findOne({
        where: {
          leagueId: req.params.leagueId
        },
        include: [
          {
            model: Draft,
            as: 'drafts',
            on: {
              season: process.env.CURRENT_SEASON,
              leagueId: req.params.leagueId,
              complete: false
            }
          },
          {
            model: Team,
            as: 'teams',
            include: [
              {
                model: User,
                as: 'owner'
              },
              {
                model: Player,
                as: 'players',
                include: [
                  {
                    model: Tribe,
                    as: 'tribe'
                  }
                ]
              }
            ]
          }
        ]
      })
      .then(dbLeague => {
        if(dbLeague) return dbLeague.get({plain: true});
        return {};
      })
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        console.log(err);
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', message: 'invalid token'});
    }
  })
})

router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if(decoded) {      
      League.findAll({
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: Team,
            as: 'teams',
            include: [
              {
                model: User,
                as: 'owner'
              }
            ]
          },
          {
            model: User,
            as: 'owner'
          }
        ],
        attributes: {
          include: [
            [sequelize.literal(`(SELECT COUNT(*) FROM team WHERE team.leagueId = league.leagueId)`), 'teamsCount']
          ]
        }
      })
      .then(dbLeague => dbLeague.map(l => l.get({plain: true})))
      .then(data => {
        res.json({status: 'success', data});
      })
      .catch(err => {
        console.log(err);
        res.json({status: 'fail', err});
      })
    } else {
      res.json({status: 'fail', err});
    }
  })
});

router.patch('/:leagueId', (req, res) => {
  const token = req.headers.authorization;
  const body = req.body;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    try {
      if (decoded) {
        console.log(req.params.leagueId, body);
        let where = {leagueId: req.params.leagueId};
        if(decoded.userType !== 'ADMIN') where.ownerId = decoded.id;
        League.update(body, {where})
          .then(data => {
            if (data) {
              res.json({ status: 'success', data });
            } else {
              throw new Error(JSON.stringify(data));
            }
          })
          .catch(err => {
            throw new Error(err);
          })
      } else if (err) {
        throw new Error(err);
      } else {
        throw new Error("JWT error");
      }
    } catch (err) {
      res.json({status: 'fail', err})
    }
  })
})

router.post('/:leagueId/players', async (req, res) => {
  const token = req.headers.authorization;
  const { assignments } = req.body; // Array of { teamId, playerId }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err || !decoded) {
      return res.json({ status: 'fail', message: 'invalid token' });
    }

    try {
      // Check if user is admin or league owner
      const league = await League.findOne({
        where: { leagueId: req.params.leagueId },
        include: [{ model: User, as: 'owner' }]
      });

      if (!league) {
        return res.json({ status: 'fail', message: 'League not found' });
      }

      // Only allow admins or league owners to modify player assignments
      if (decoded.userType !== 'ADMIN' && league.ownerId !== decoded.id) {
        return res.json({ status: 'fail', message: 'Unauthorized' });
      }

      // Start transaction
      const transaction = await sequelize.transaction();

      try {
        // First, get all teams in this league
        const teams = await Team.findAll({
          where: { leagueId: req.params.leagueId }
        });

        const teamIds = teams.map(team => team.teamId);

        // Remove all existing player assignments for teams in this league
        await PlayerTeam.destroy({
          where: {
            teamId: teamIds
          },
          transaction
        });

        // Create new player assignments
        if (assignments && assignments.length > 0) {
          const playerTeamRecords = assignments.map(assignment => ({
            teamId: assignment.teamId,
            playerId: assignment.playerId
          }));

          await PlayerTeam.bulkCreate(playerTeamRecords, { transaction });
        }

        // Commit transaction
        await transaction.commit();

        res.json({ 
          status: 'success', 
          message: 'Player assignments saved successfully',
          assignmentsCount: assignments ? assignments.length : 0
        });

      } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        throw error;
      }

    } catch (error) {
      console.error('Error saving player assignments:', error);
      res.json({ 
        status: 'fail', 
        message: 'Failed to save player assignments',
        error: error.message 
      });
    }
  });
});

module.exports = router;
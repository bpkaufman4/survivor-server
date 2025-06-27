const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { League, Team } = require('../../../models');
const sequelize = require('../../../config/connection');

router.post('/', (req, res) => {
  const token = req.headers.authorization;
  const { name, teamName, privateInd, password } = req.body;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.json({ status: 'fail', message: 'Invalid token' });
    }

    if (!decoded) {
      return res.json({ status: 'fail', message: 'Authentication required' });
    }

    // Start a transaction to ensure both league and team are created together
    const transaction = await sequelize.transaction();

    try {
      // Validate required fields
      if (!name) {
        await transaction.rollback();
        return res.json({ status: 'fail', message: 'League name is required' });
      }

      if (name.length < 3) {
        await transaction.rollback();
        return res.json({ status: 'fail', message: 'League name must be at least 3 characters long' });
      }

      if (!teamName) {
        await transaction.rollback();
        return res.json({ status: 'fail', message: 'Team name is required' });
      }

      if (teamName.length < 3) {
        await transaction.rollback();
        return res.json({ status: 'fail', message: 'Team name must be at least 3 characters long' });
      }

      // Validate private league requirements
      if (privateInd && !password) {
        await transaction.rollback();
        return res.json({ status: 'fail', message: 'Password is required for private leagues' });
      }

      // Create the league
      const newLeague = await League.create({
        name,
        ownerId: decoded.id,
        privateInd: privateInd || false,
        password: privateInd ? password : null
      }, { transaction });

      // Create the team for the league creator
      const newTeam = await Team.create({
        name: teamName,
        ownerId: decoded.id,
        leagueId: newLeague.leagueId
      }, { transaction });

      // Commit the transaction
      await transaction.commit();

      res.json({
        status: 'success',
        message: 'League and team created successfully!',
        data: {
          league: newLeague.get({ plain: true }),
          team: newTeam.get({ plain: true })
        }
      });

    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      console.log(error);
      res.json({ status: 'fail', message: 'Something went wrong', error: error.message });
    }
  });
});

module.exports = router;

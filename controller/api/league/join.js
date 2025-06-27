const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { League, Team } = require('../../../models');

router.post('/', (req, res) => {
  const token = req.headers.authorization;
  const { teamName, leagueId, leaguePassword } = req.body;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.json({ status: 'fail', message: 'Invalid token' });
    }

    if (!decoded) {
      return res.json({ status: 'fail', message: 'Authentication required' });
    }

    try {
      // Validate required fields
      if (!teamName || !leagueId) {
        return res.json({ status: 'fail', message: 'Team name and league ID are required' });
      }

      if (teamName.length < 3) {
        return res.json({ status: 'fail', message: 'Team name must be at least 3 characters long' });
      }

      // Check if league exists
      const league = await League.findOne({
        where: { leagueId }
      });

      if (!league) {
        return res.json({ status: 'fail', message: 'League not found' });
      }

      // Check if league is private and validate password
      if (league.privateInd) {
        if (!leaguePassword) {
          return res.json({ status: 'fail', message: 'League password is required for private leagues' });
        }
        
        if (league.password !== leaguePassword) {
          return res.json({ status: 'fail', message: 'Incorrect league password' });
        }
      }

      // Check if user already has a team in this league
      const existingTeam = await Team.findOne({
        where: {
          ownerId: decoded.id,
          leagueId
        }
      });

      if (existingTeam) {
        return res.json({ status: 'fail', message: 'You already have a team in this league' });
      }

      // Create the team
      const newTeam = await Team.create({
        name: teamName,
        ownerId: decoded.id,
        leagueId
      });

      res.json({
        status: 'success',
        message: 'Successfully joined league!',
        data: newTeam.get({ plain: true })
      });

    } catch (error) {
      console.log(error);
      res.json({ status: 'fail', message: 'Something went wrong', error: error.message });
    }
  });
});

module.exports = router;

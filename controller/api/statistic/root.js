const router = require('express').Router();
const jwt = require('jsonwebtoken');
const { Statistic } = require('../../../models');

// GET all statistics
router.get('/', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      return res.json({ status: 'fail', message: 'invalid token' });
    }

    // Only allow admins to view statistics
    if (decoded.userType !== 'ADMIN') {
      return res.json({ status: 'fail', message: 'Unauthorized' });
    }    Statistic.findAll({
      order: [['place', 'ASC'], ['name', 'ASC']]
    })
    .then(statistics => {
      const data = statistics.map(stat => stat.get({ plain: true }));
      res.json({ status: 'success', data });
    })
    .catch(err => {
      console.error('Error fetching statistics:', err);
      res.json({ status: 'fail', err: err.message });
    });
  });
});

// POST create/update statistic
router.post('/', (req, res) => {
  const token = req.headers.authorization;
  const { statisticId, name, defaultPoints, description } = req.body;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err || !decoded) {
      return res.json({ status: 'fail', message: 'invalid token' });
    }

    // Only allow admins to modify statistics
    if (decoded.userType !== 'ADMIN') {
      return res.json({ status: 'fail', message: 'Unauthorized' });
    }    
    
    try {      
      const statisticData = {
        name,
        defaultPoints,
        description
      };

      let statistic;
      if (statisticId) {
        // Update existing statistic (don't change place)
        await Statistic.update(statisticData, {
          where: { statisticId }
        });
        statistic = await Statistic.findByPk(statisticId);
      } else {
        // Create new statistic - auto-assign next place value
        const maxPlace = await Statistic.max('place') || 0;
        statisticData.place = maxPlace + 1;
        statistic = await Statistic.create(statisticData);
      }

      res.json({ 
        status: 'success', 
        data: statistic.get({ plain: true }),
        message: statisticId ? 'Statistic updated successfully' : 'Statistic created successfully'
      });

    } catch (error) {
      console.error('Error saving statistic:', error);
      res.json({ 
        status: 'fail', 
        message: 'Failed to save statistic',
        error: error.message 
      });
    }
  });
});

// DELETE statistic
router.delete('/:statisticId', (req, res) => {
  const token = req.headers.authorization;
  const { statisticId } = req.params;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err || !decoded) {
      return res.json({ status: 'fail', message: 'invalid token' });
    }

    // Only allow admins to delete statistics
    if (decoded.userType !== 'ADMIN') {
      return res.json({ status: 'fail', message: 'Unauthorized' });
    }

    try {
      const result = await Statistic.destroy({
        where: { statisticId }
      });

      if (result > 0) {
        res.json({ 
          status: 'success', 
          message: 'Statistic deleted successfully'
        });
      } else {
        res.json({ 
          status: 'fail', 
          message: 'Statistic not found'
        });
      }

    } catch (error) {
      console.error('Error deleting statistic:', error);
      res.json({ 
        status: 'fail', 
        message: 'Failed to delete statistic',
        error: error.message 
      });
    }
  });
});

module.exports = router;

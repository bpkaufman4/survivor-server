const router = require('express').Router();
const jwt = require('jsonwebtoken');
const jobs = require('../../../jobs');

// Get status of all background jobs
router.get('/status', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (decoded && decoded.userType === 'ADMIN') {
      try {
        const status = jobs.getJobsStatus();
        res.json({
          status: 'success',
          data: status
        });
      } catch (error) {
        console.error('Error getting jobs status:', error);
        res.json({
          status: 'fail',
          message: 'Error getting jobs status',
          error: error.message
        });
      }
    } else {
      res.json({status: 'fail', message: 'Admin access required'});
    }
  });
});

// Manually trigger a specific job
router.post('/trigger/:jobName', async (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (decoded && decoded.userType === 'ADMIN') {
      try {
        const { jobName } = req.params;
        console.log(`Admin triggering job: ${jobName}`);
        
        const result = await jobs.triggerJob(jobName);
        
        res.json({
          status: 'success',
          data: result,
          message: `Job ${jobName} executed successfully`
        });
      } catch (error) {
        console.error('Error triggering job:', error);
        res.json({
          status: 'fail',
          message: `Error triggering job: ${error.message}`,
          error: error.message
        });
      }
    } else {
      res.json({status: 'fail', message: 'Admin access required'});
    }
  });
});

// Stop all jobs
router.post('/stop', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (decoded && decoded.userType === 'ADMIN') {
      try {
        jobs.stopAllJobs();
        res.json({
          status: 'success',
          message: 'All jobs stopped'
        });
      } catch (error) {
        console.error('Error stopping jobs:', error);
        res.json({
          status: 'fail',
          message: 'Error stopping jobs',
          error: error.message
        });
      }
    } else {
      res.json({status: 'fail', message: 'Admin access required'});
    }
  });
});

// Start all jobs
router.post('/start', (req, res) => {
  const token = req.headers.authorization;

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (decoded && decoded.userType === 'ADMIN') {
      try {
        jobs.startAllJobs();
        res.json({
          status: 'success',
          message: 'All jobs started'
        });
      } catch (error) {
        console.error('Error starting jobs:', error);
        res.json({
          status: 'fail',
          message: 'Error starting jobs',
          error: error.message
        });
      }
    } else {
      res.json({status: 'fail', message: 'Admin access required'});
    }
  });
});

module.exports = router;

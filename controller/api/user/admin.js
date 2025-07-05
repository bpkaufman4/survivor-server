const router = require('express').Router();
const { User } = require('../../../models');
const jwt = require('jsonwebtoken');

router.get('/', async (req, res) => {
  try {
    // Get user ID from JWT token and verify admin status
    const token = req.headers.authorization;
    if (!token) {
      return res.json({ status: 'fail', message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminUser = await User.findByPk(decoded.id);
    
    if (!adminUser || decoded.userType !== 'ADMIN') {
      return res.json({ status: 'fail', message: 'Admin access required' });
    }
    
    // Get all users with basic info, excluding sensitive data
    const users = await User.findAll({
      attributes: ['userId', 'firstName', 'lastName', 'email', 'emailVerified'],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });
    
    res.json({ 
      status: 'success', 
      users: users.map(user => ({
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified,
      }))
    });
    
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.json({ status: 'fail', message: 'Invalid token' });
    }
    res.json({ status: 'fail', message: 'Failed to fetch users' });
  }
});

module.exports = router;

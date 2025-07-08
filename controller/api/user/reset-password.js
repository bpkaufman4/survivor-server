const { User } = require('../../../models');
const bcrypt = require('bcrypt');

const router = require('express').Router();

router.post('/', async (req, res) => {
    const { token, password } = req.body;
    
    if (!token || !password) {
        res.json({ status: 'fail', message: 'Token and password are required' });
        return;
    }

    if (password.length < 4) {
        res.json({ status: 'fail', message: 'Password must be at least 4 characters' });
        return;
    }

    try {
        // Find user with valid reset token
        const user = await User.findOne({
            where: {
                passwordResetToken: token,
                passwordResetExpires: {
                    [require('sequelize').Op.gt]: new Date()
                }
            }
        });

        if (!user) {
            res.json({ 
                status: 'fail', 
                message: 'Invalid or expired reset token' 
            });
            return;
        }

        // Update user with new password and clear reset token
        await user.update({
            pwd: password,
            passwordResetToken: null,
            passwordResetExpires: null
        });

        res.json({
            status: 'success',
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.json({ status: 'fail', message: 'An error occurred while resetting your password' });
    }
});

module.exports = router;

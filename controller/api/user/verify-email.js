const { User } = require('../../../models');
const jwt = require('jsonwebtoken');

const router = require('express').Router();

router.post('/', async (req, res) => {
    const { verificationCode, userId } = req.body;
    
    if (!verificationCode || !userId) {
        res.json({ status: 'fail', message: 'Verification code and user ID are required' });
        return;
    }

    try {
        // Find the user
        const user = await User.findByPk(userId);
        
        if (!user) {
            res.json({ status: 'fail', message: 'User not found' });
            return;
        }

        // Check if email is already verified
        if (user.emailVerified) {
            res.json({ status: 'fail', message: 'Email is already verified' });
            return;
        }

        // Verify the code
        if (user.checkVerificationCode(parseInt(verificationCode))) {
            // Update user to mark email as verified
            await user.update({ emailVerified: true, verificationCode: null });
            
            // Create a new JWT token for the verified user
            const token = jwt.sign({ id: user.userId, userType: user.userType }, process.env.JWT_SECRET, {
                expiresIn: '2 days'
            });

            res.json({
                status: 'success',
                message: 'Email verified successfully',
                token: token,
                target: '/'
            });
        } else {
            res.json({ status: 'fail', message: 'Invalid verification code' });
        }
    } catch (err) {
        console.error('Email verification error:', err);
        res.json({ status: 'fail', message: 'An error occurred during verification' });
    }
});

module.exports = router;

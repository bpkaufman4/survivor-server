const { User } = require('../../../models');
const { sendVerificationEmail } = require('../../../mail');
const jwt = require('jsonwebtoken');

const router = require('express').Router();

router.post('/', async (req, res) => {
    const { email } = req.body;
    const token = req.headers.authorization;
    
    if (!email) {
        res.json({ status: 'fail', message: 'Email is required' });
        return;
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (!decoded) {
            res.json({ status: 'fail', message: 'Invalid token' });
            return;
        }

        try {
            // Check if email already exists for another user
            const existingEmail = await User.findOne({ 
                where: { 
                    email: email,
                    userId: { [require('sequelize').Op.ne]: decoded.id }
                } 
            });
            
            if (existingEmail) {
                res.json({ status: 'fail', message: 'Email already exists' });
                return;
            }

            // Find the current user
            const user = await User.findByPk(decoded.id);
            if (!user) {
                res.json({ status: 'fail', message: 'User not found' });
                return;
            }

            // Generate new verification code
            const verificationCode = Math.floor(100000 + Math.random() * 900000);

            // Update user with new email and verification code, mark as unverified
            await user.update({ 
                email: email,
                emailVerified: false,
                verificationCode: verificationCode
            });

            // Send verification email
            const emailResult = await sendVerificationEmail(
                email, 
                user.firstName, 
                verificationCode
            );

            if (!emailResult.success) {
                console.error('Failed to send verification email:', emailResult.error);
                res.json({ status: 'fail', message: 'Failed to send verification email' });
                return;
            }

            res.json({
                status: 'success',
                message: 'Email updated. Please check your email for verification code.',
                data: { userId: user.userId, email: email }
            });

        } catch (error) {
            console.error('Update email error:', error);
            res.json({ status: 'fail', message: 'An error occurred while updating email' });
        }
    });
});

module.exports = router;

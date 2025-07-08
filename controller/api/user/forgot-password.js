const { User } = require('../../../models');
const { sendPasswordResetEmail } = require('../../../mail');
const crypto = require('crypto');

const router = require('express').Router();

router.post('/', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        res.json({ status: 'fail', message: 'Email is required' });
        return;
    }

    try {
        // Find user with verified email
        const user = await User.findOne({ 
            where: { 
                email: email,
                emailVerified: true
            }
        });

        if (!user) {
            // Don't reveal whether email exists or not for security
            res.json({ 
                status: 'not_found', 
                message: 'If a verified account with this email exists, a password reset link will be sent.' 
            });
            return;
        }

        // Generate secure reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

        // Save reset token to user
        await user.update({
            passwordResetToken: resetToken,
            passwordResetExpires: resetTokenExpiry
        });

        // Send reset email
        const emailResult = await sendPasswordResetEmail(
            user.email,
            user.firstName,
            resetToken
        );

        if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error);
            res.json({ status: 'fail', message: 'Failed to send reset email' });
            return;
        }

        res.json({
            status: 'success',
            message: 'Password reset email sent'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.json({ status: 'fail', message: 'An error occurred while processing your request' });
    }
});

module.exports = router;

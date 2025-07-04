const { User } = require('../../../models');
const { sendVerificationEmail } = require('../../../mail');

const router = require('express').Router();

router.post('/', async (req, res) => {
    const { userId } = req.body;
    
    if (!userId) {
        res.json({ status: 'fail', message: 'User ID is required' });
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

        // Generate a new verification code
        const newVerificationCode = Math.floor(100000 + Math.random() * 900000);
        await user.update({ verificationCode: newVerificationCode });

        // Send verification email
        const emailResult = await sendVerificationEmail(
            user.email, 
            user.firstName, 
            newVerificationCode
        );

        if (!emailResult.success) {
            console.error('Failed to send verification email:', emailResult.error);
            res.json({ status: 'fail', message: 'Failed to send verification email' });
            return;
        }
        
        res.json({
            status: 'success',
            message: 'New verification code sent to your email'
        });
    } catch (err) {
        console.error('Resend verification error:', err);
        res.json({ status: 'fail', message: 'An error occurred while resending verification code' });
    }
});

module.exports = router;

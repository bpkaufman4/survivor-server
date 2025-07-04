const { User } = require('../../../models');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../../../mail');

const router = require('express').Router();

router.post('/', async (req, res) => {
    const user = req.body;
    if (!user.username || !user.email || !user.pwd || !user.lastName || !user.firstName) {
        res.json({ status: 'fail', message: 'Incomplete request' });
        return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { username: user.username } });
    if (existingUser) {
        res.json({ status: 'fail', message: 'Username already exists' });
        return;
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ where: { email: user.email } });
    if (existingEmail) {
        res.json({ status: 'fail', message: 'Email already exists' });
        return;
    }

    User.create(user)
        .then(async reply => {
            const newUser = reply.get({ plain: true });

            // Send verification email
            const emailResult = await sendVerificationEmail(
                newUser.email, 
                newUser.firstName, 
                newUser.verificationCode
            );

            if (!emailResult.success) {
                console.error('Failed to send verification email:', emailResult.error);
                // Still continue with registration even if email fails
            }

            // Don't create JWT token yet - user needs to verify email first
            res.json({
                status: 'success',
                data: { userId: newUser.userId, email: newUser.email },
                target: '/verify-email'
            });
        })
        .catch(err => {
            res.json({ status: 'fail', message: err });
        })
})

module.exports = router;
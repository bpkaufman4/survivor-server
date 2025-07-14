const router = require('express').Router();
const { User } = require('../../../models');
const jwt = require('jsonwebtoken');
const FormData = require("form-data");
const Mailgun = require("mailgun.js");

router.post('/', async (req, res) => {
  try {
    // Verify admin access
    const token = req.headers.authorization;
    if (!token) {
      return res.json({ status: 'fail', message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminUser = await User.findByPk(decoded.id);
    
    if (!adminUser || decoded.userType !== 'ADMIN') {
      return res.json({ status: 'fail', message: 'Admin access required' });
    }

    const { targetUsers, subject, body, isHtml = false, priority = 'normal' } = req.body;

    if (!subject || !body) {
      return res.json({ status: 'fail', message: 'Subject and body are required' });
    }

    let users = [];

    if (targetUsers === 'all') {
      // Send to all users with email addresses
      users = await User.findAll({
        attributes: ['userId', 'email', 'firstName', 'lastName'],
        where: {
          email: {
            [require('sequelize').Op.not]: null
          }
        }
      });
    } else if (Array.isArray(targetUsers)) {
      // Send to specific users
      users = await User.findAll({
        attributes: ['userId', 'email', 'firstName', 'lastName'],
        where: {
          userId: targetUsers,
          email: {
            [require('sequelize').Op.not]: null
          }
        }
      });
    } else {
      return res.json({ status: 'fail', message: 'Invalid target users' });
    }

    if (users.length === 0) {
      return res.json({ status: 'fail', message: 'No users with email addresses found' });
    }

    // Initialize Mailgun
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_KEY
    });

    let successCount = 0;
    let failureCount = 0;
    const results = [];

    // Process emails in batches to avoid overwhelming the API
    const BATCH_SIZE = 10;
    const batches = [];
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      batches.push(users.slice(i, i + BATCH_SIZE));
    }

    console.log(`Sending emails to ${users.length} users in ${batches.length} batches...`);

    // Send emails in batches
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} emails)...`);
      
      const batchPromises = batch.map(async (user) => {
        try {
          const emailData = {
            from: "Fantasy Survivor Admin <admin@fantasy-survivor.net>",
            to: [user.email],
            subject: subject,
          };

          // Set priority headers
          if (priority === 'high') {
            emailData['h:X-Priority'] = '1';
            emailData['h:Importance'] = 'high';
          } else if (priority === 'low') {
            emailData['h:X-Priority'] = '5';
            emailData['h:Importance'] = 'low';
          }

          // Add body content based on format
          if (isHtml) {
            emailData.html = body;
          } else {
            emailData.text = body;
          }

          const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);
          
          return {
            userId: user.userId,
            email: user.email,
            status: 'success',
            messageId: result.id
          };

        } catch (error) {
          console.error(`Error sending email to ${user.email}:`, error);
          return {
            userId: user.userId,
            email: user.email,
            status: 'failed',
            error: error.message
          };
        }
      });

      // Wait for all emails in this batch to complete
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          const emailResult = result.value;
          results.push(emailResult);
          if (emailResult.status === 'success') {
            successCount++;
          } else {
            failureCount++;
          }
        } else {
          failureCount++;
          results.push({
            status: 'failed',
            error: result.reason?.message || 'Unknown error'
          });
        }
      });

      // Small delay between batches to be respectful to the API
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    res.json({
      status: 'success',
      message: 'Email sending completed',
      emailsSent: users.length,
      successCount,
      failureCount,
      results
    });

  } catch (error) {
    console.error('Error sending admin emails:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.json({ status: 'fail', message: 'Invalid token' });
    }
    res.json({ status: 'fail', message: 'Failed to send emails' });
  }
});

module.exports = router;

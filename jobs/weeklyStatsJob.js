const { User, League, Team } = require('../models');
const sendEmail = require('../helpers/emailUtils');

/**
 * Weekly League Stats Job
 * Sends weekly summary emails to league owners with league statistics
 */
class WeeklyLeagueStatsJob {
  
  /**
   * Main execution function
   */
  async execute() {
    try {
      console.log('Starting weekly league stats job execution...');
      
      // Find all leagues with their owners
      const leagues = await League.findAll({
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['email', 'firstName', 'lastName', 'emailPreferences', 'emailVerified']
          },
          {
            model: Team,
            as: 'teams',
            include: [{
              model: User,
              as: 'owner',
              attributes: ['firstName', 'lastName']
            }]
          }
        ]
      });
      
      let emailsSent = 0;
      
      for (const league of leagues) {
        const owner = league.owner;
        
        // Check if user wants latest updates and has verified email
        if (!owner.emailVerified) {
          console.log(`Skipping stats for ${owner.email} - email not verified`);
          continue;
        }
        
        const emailPrefs = owner.emailPreferences || {};
        if (emailPrefs.latestUpdates === false) {
          console.log(`Skipping stats for ${owner.email} - latest updates disabled`);
          continue;
        }
        
        // Send the stats email
        const emailSent = await this.sendStatsEmail(owner, league);
        if (emailSent) {
          emailsSent++;
        }
      }
      
      console.log(`Weekly league stats job completed. Sent ${emailsSent} emails.`);
      return { 
        success: true, 
        message: `Sent ${emailsSent} league stats emails`, 
        emails: emailsSent 
      };
      
    } catch (error) {
      console.error('Error in weekly league stats job:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Send stats email to league owner
   */
  async sendStatsEmail(user, league) {
    try {
      const subject = `Weekly League Update: ${league.name}`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #007bff;">📊 Weekly League Update</h2>
          
          <p>Hi ${user.firstName},</p>
          
          <p>Here's your weekly update for <strong>${league.name}</strong>:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #495057;">League Stats</h3>
            <ul style="color: #6c757d;">
              <li><strong>Total Teams:</strong> ${league.teams?.length || 0}</li>
              <li><strong>Active Players:</strong> ${league.teams?.reduce((acc, team) => acc + (team.players?.length || 0), 0) || 0}</li>
              <li><strong>League Type:</strong> ${league.privateInd ? 'Private' : 'Public'}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://your-app.com'}/league/${league.leagueId}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 5px; font-weight: bold;">
              View League
            </a>
          </div>
          
          <p style="color: #6c757d; font-size: 14px;">
            This update was sent because you have latest updates enabled in your email preferences.
          </p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Fantasy Survivor | Weekly Stats System
          </p>
        </div>
      `;
      
      const result = await sendEmail(user.email, subject, htmlContent);
      
      if (result.success) {
        console.log(`Weekly stats sent to ${user.email} for league ${league.name}`);
        return true;
      } else {
        console.error(`Failed to send weekly stats to ${user.email}:`, result.error);
        return false;
      }
      
    } catch (error) {
      console.error(`Error sending stats email to ${user.email}:`, error);
      return false;
    }
  }
}

module.exports = new WeeklyLeagueStatsJob();

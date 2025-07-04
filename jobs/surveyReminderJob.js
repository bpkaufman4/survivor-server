const { Op } = require('sequelize');
const { Episode, Survey, TeamSurvey, Team, User } = require('../models');
const { checkEmailPreference } = require('../helpers/emailUtils');
const FormData = require("form-data");
const Mailgun = require("mailgun.js");

/**
 * Survey Reminder Job
 * Sends reminder emails to teams who haven't completed surveys for episodes airing tomorrow
 */
class SurveyReminderJob {
  
  /**
   * Main execution function
   */
  async execute() {
    try {
      console.log('Starting survey reminder job execution...');
      console.log('Current system time:', new Date().toISOString());
      
      // For simplicity, let's find episodes airing in the next 24-48 hours
      // This accounts for timezone differences and ensures we catch episodes
      const now = new Date();
      const startRange = new Date(now.getTime() + (20 * 60 * 60 * 1000)); // 20 hours from now
      const endRange = new Date(now.getTime() + (32 * 60 * 60 * 1000));   // 32 hours from now
      
      console.log(`Looking for episodes airing in the next 20-32 hours`);
      console.log(`UTC range: ${startRange.toISOString()} to ${endRange.toISOString()}`);
      
      // Find episodes airing in the next 20-32 hours (tomorrow range)
      const episodesAiringTomorrow = await Episode.findAll({
        where: {
          airDate: {
            [Op.gte]: startRange,
            [Op.lte]: endRange
          }
        },
        include: [{
          model: Survey,
          as: 'survey'
        }]
      });
      
      console.log(`Found ${episodesAiringTomorrow.length} episodes airing tomorrow`);
      
      if (episodesAiringTomorrow.length === 0) {
        console.log('No episodes airing tomorrow - no reminders needed');
        return { success: true, message: 'No episodes airing tomorrow', reminders: 0 };
      }
      
      let totalReminders = 0;
      
      for (const episode of episodesAiringTomorrow) {
        if (episode.survey) {
          const remindersSent = await this.sendRemindersForSurvey(episode.survey, episode);
          totalReminders += remindersSent;
        }
      }
      
      console.log(`Survey reminder job completed. Sent ${totalReminders} reminders.`);
      return { 
        success: true, 
        message: `Sent ${totalReminders} survey reminders`, 
        reminders: totalReminders 
      };
      
    } catch (error) {
      console.error('Error in survey reminder job:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Send reminders for a specific survey
   */
  async sendRemindersForSurvey(survey, episode) {
    try {
      console.log(`Processing survey ${survey.surveyId} for episode "${episode.title || `Episode ${episode.season}`}"`);
      
      // First, get all teams in the system
      const allTeams = await Team.findAll({
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['userId', 'email', 'firstName', 'lastName', 'emailPreferences', 'emailVerified']
          }
        ]
      });
      
      console.log(`Found ${allTeams.length} total teams`);
      
      // Then find which teams have completed this survey
      const completedTeamSurveys = await TeamSurvey.findAll({
        where: {
          surveyId: survey.surveyId,
          completed: true
        },
        attributes: ['teamId']
      });
      
      const completedTeamIds = new Set(completedTeamSurveys.map(ts => ts.teamId));
      console.log(`Found ${completedTeamIds.size} teams that have completed this survey`);
      
      // Filter teams that haven't completed the survey
      const incompleteTeams = allTeams.filter(team => !completedTeamIds.has(team.teamId));
      console.log(`Found ${incompleteTeams.length} teams that need reminders`);
      
      // Group incomplete teams by user
      const teamsByUser = new Map();
      for (const team of incompleteTeams) {
        const owner = team.owner;
        
        // Basic validation - user must have verified email
        if (!owner.emailVerified || !owner.email) {
          console.log(`Skipping team ${team.name} - owner email not verified or missing`);
          continue;
        }
        
        if (!teamsByUser.has(owner.userId)) {
          teamsByUser.set(owner.userId, {
            user: owner,
            teams: []
          });
        }
        
        teamsByUser.get(owner.userId).teams.push(team);
      }
      
      console.log(`Found ${teamsByUser.size} users with incomplete teams`);
      
      let remindersSent = 0;
      
      // Send one email per user with all their incomplete teams
      for (const [userId, { user, teams }] of teamsByUser) {
        const emailSent = await this.sendReminderEmail(user, teams, episode);
        if (emailSent) {
          remindersSent++;
        }
      }
      
      console.log(`Sent ${remindersSent} reminder emails for survey ${survey.surveyId}`);
      return remindersSent;
      
    } catch (error) {
      console.error(`Error sending reminders for survey ${survey.surveyId}:`, error);
      return 0;
    }
  }
  
  /**
   * Send individual reminder email using Mailgun template
   */
  async sendReminderEmail(user, teams, episode) {
    try {
      // Check if user has enabled poll reminders
      const emailCheck = await checkEmailPreference(user.userId, 'pollReminders');
      if (!emailCheck.canSend) {
        console.log(`Skipping reminder for user ${user.userId}: ${emailCheck.reason}`);
        return false;
      }

      const mailgun = new Mailgun(FormData);
      const mg = mailgun.client({
        username: "api",
        key: process.env.MAILGUN_KEY
      });

      const episodeTitle = episode.title || `Episode ${episode.season}`;
      const teamNames = teams.map(team => team.name).join(', ');

      const data = await mg.messages.create("mg.fantasy-survivor.net", {
        from: "Fantasy Survivor <noreply@fantasy-survivor.net>",
        to: [user.email],
        subject: `Survey Reminder: ${episodeTitle} airs tomorrow!`,
        template: "surveyreminder"
      });

      console.log(`Survey reminder sent to user ${user.userId} for teams: ${teamNames}`);
      console.log(`Mailgun response:`, JSON.stringify(data, null, 2));
      return true;
      
    } catch (error) {
      console.error(`Error sending reminder email to user ${user.userId}:`, error);
      return false;
    }
  }
}

module.exports = new SurveyReminderJob();

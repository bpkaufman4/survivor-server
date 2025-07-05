const { Op } = require('sequelize');
const { Episode, Survey, TeamSurvey, Team, User } = require('../models');
const { checkEmailPreference } = require('../helpers/emailUtils');
const { sendSurveyReminderNotificationToUser } = require('../helpers/pushNotifications');
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
      
      const now = new Date();
      const startRange = new Date(now.getTime() + (20 * 60 * 60 * 1000)); // 20 hours from now
      const endRange = new Date(now.getTime() + (32 * 60 * 60 * 1000));   // 32 hours from now
      
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
      
      if (episodesAiringTomorrow.length === 0) {
        return { success: true, message: 'No episodes airing tomorrow', reminders: 0 };
      }
      
      let totalReminders = 0;
      
      for (const episode of episodesAiringTomorrow) {
        if (episode.survey) {
          const remindersSent = await this.sendRemindersForSurvey(episode.survey, episode);
          totalReminders += remindersSent;
        }
      }
      
      return { 
        success: true, 
        message: `Sent ${totalReminders} survey reminders`, 
        reminders: totalReminders 
      };
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Send reminders for a specific survey
   */
  async sendRemindersForSurvey(survey, episode) {
    try {
      
      // First, get all teams in the system
      const allTeams = await Team.findAll({
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['userId', 'email', 'firstName', 'lastName', 'emailPreferences', 'emailVerified']
          }
        ],
        attributes: ['teamId', 'name', 'ownerId', 'leagueId'] // Include leagueId
      });
      
      // Then find which teams have completed this survey
      const completedTeamSurveys = await TeamSurvey.findAll({
        where: {
          surveyId: survey.surveyId,
          completed: true
        },
        attributes: ['teamId']
      });
      
      const completedTeamIds = new Set(completedTeamSurveys.map(ts => ts.teamId));
      
      // Filter teams that haven't completed the survey
      const incompleteTeams = allTeams.filter(team => !completedTeamIds.has(team.teamId));
      
      // Group incomplete teams by user
      const teamsByUser = new Map();
      for (const team of incompleteTeams) {
        const owner = team.owner;
        
        // Basic validation - user must have verified email
        if (!owner.emailVerified || !owner.email) {
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
      
      let remindersSent = 0;
      
      // Send one email per user with all their incomplete teams
      for (const [userId, { user, teams }] of teamsByUser) {
        const emailSent = await this.sendReminderEmail(user, teams, episode);
        const pushSent = await this.sendReminderPush(user, teams, episode);
        if (emailSent || pushSent) {
          remindersSent++;
        }
      }
      
      return remindersSent;
      
    } catch (error) {
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

      return true;
      
    } catch (error) {
      return false;
    }
  }

  /**
   * Send push notification reminder
   */
  async sendReminderPush(user, teams, episode) {
    try {
      // Check if user has enabled poll reminders
      const emailCheck = await checkEmailPreference(user.userId, 'pollReminders');
      if (!emailCheck.canSend) {
        return false;
      }

      const episodeTitle = episode.title || `Episode ${episode.season}`;
      const teamCount = teams.length;
      const teamText = teamCount === 1 ? 'team' : 'teams';
      
      // Pick the first league from the user's teams to link to
      const firstTeamWithLeague = teams.find(team => team.leagueId);
      const leagueId = firstTeamWithLeague ? firstTeamWithLeague.leagueId : null;

      const result = await sendSurveyReminderNotificationToUser(user.userId, {
        episodeName: episodeTitle,
        episodeId: episode.episodeId,
        teamCount: teamCount,
        teamText: teamText,
        leagueId: leagueId
      });

      return result.success;
      
    } catch (error) {
      console.error('Error sending push reminder:', error);
      return false;
    }
  }
}

module.exports = new SurveyReminderJob();

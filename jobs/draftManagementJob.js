const { Draft } = require('../models');
const { liveDraftData } = require('../websocket-handlers/helpers');
const { sendDraftNotification, sendDraftStartingSoonNotification } = require('../helpers/pushNotifications');
const { broadcastToLeague } = require('../websocket');

// Store active draft timers
const draftTimers = new Map();
// Track drafts that have already been notified about starting soon
const draftNotificationsSent = new Set();
// Track leagues that are currently processing an auto-pick
const autoPickInProgress = new Set();

/**
 * Draft Management Job
 * Handles automated draft timing, auto-picks, and notifications
 */
class DraftManagementJob {
  
  /**
   * Check for scheduled drafts that should be started
   */
  static async checkScheduledDrafts() {
    try {
      const now = new Date();
      
      // Check for drafts starting in 5 minutes (with 1 minute tolerance window)
      await this.checkDraftsStartingSoon(now);
      
      // Find drafts that should have started but haven't been completed
      const scheduledDrafts = await Draft.findAll({
        where: {
          startDate: {
            [require('sequelize').Op.lte]: now // Start date is in the past or now
          },
          complete: false
        }
      });

      for (const draft of scheduledDrafts) {
        // Check if timer is already running for this league
        if (draftTimers.has(draft.leagueId)) {
          continue; // Skip if timer already active
        }

        try {
          const draftData = await liveDraftData(draft.leagueId);
          const currentPickObj = draftData.draftOrder.find(pick => pick.dataValues.currentPick);
          
          // Start timer if there's a current pick waiting
          if (currentPickObj && !currentPickObj.playerId && !draftData.draft.complete) {
            console.log(`Auto-starting draft timer for league ${draft.leagueId} (scheduled start: ${draft.startDate})`);
            const timerMs = (draftData.draft.pickTimeSeconds || 120) * 1000; // Convert to milliseconds
            await this.startDraftTimer(draft.leagueId, timerMs);
          }
        } catch (err) {
          console.error(`Error checking scheduled draft for league ${draft.leagueId}:`, err);
        }
      }
    } catch (err) {
      console.error('Error in checkScheduledDrafts:', err);
    }
  }

  /**
   * Start a draft timer for a specific league
   */
  static async startDraftTimer(leagueId, timeoutMs) {
    // Clear any existing timer for this league
    this.clearDraftTimer(leagueId);

    // If no timeout provided, fetch from draft settings
    const getTimeoutMs = async () => {
      if (timeoutMs) return timeoutMs;
      
      try {
        const draft = await Draft.findOne({ 
          where: { leagueId, season: process.env.CURRENT_SEASON } 
        });
        return draft ? (draft.pickTimeSeconds * 1000) : 120000; // Fallback to 2 minutes
      } catch (err) {
        console.error('Error fetching draft timeout:', err);
        return 120000; // Fallback to 2 minutes
      }
    };

    const finalTimeoutMs = await getTimeoutMs();
    const startTime = Date.now();
    
    const timeout = setTimeout(async () => {
      console.log(`Draft timer expired for league ${leagueId}, making auto pick`);
      
      try {
        await this.makeAutoPick(leagueId);
      } catch (error) {
        console.error('Error making auto pick:', error);
        // Only delete timer on error, otherwise makeAutoPick manages the timer
        draftTimers.delete(leagueId);
      }
    }, finalTimeoutMs);
    
    draftTimers.set(leagueId, { timeout, startTime, timeoutMs: finalTimeoutMs });

    // Broadcast timer started to all clients
    broadcastToLeague(leagueId, {
      type: 'draft-timer-started',
      payload: {
        timeoutMs: finalTimeoutMs,
        startTime
      }
    });

    // Only send push notification if this is the initial timer start
    // (not when starting a new timer after a pick - that's handled in the pick handler)
    if (!timeoutMs) {
      // Send push notification to the current picker that it's their turn
      try {
        const draftData = await liveDraftData(leagueId);
        const currentPickObj = draftData.draftOrder.find(pick => pick.dataValues.currentPick);
        
        if (currentPickObj && !currentPickObj.playerId && currentPickObj.team?.owner?.userId) {
          await sendDraftNotification(currentPickObj.team.owner.userId, {
            leagueName: draftData.league?.name || 'your league',
            leagueId: leagueId
          });
          console.log(`Sent "your turn" notification to user ${currentPickObj.team.owner.userId} for league ${leagueId}`);
        }
      } catch (error) {
        console.error('Error sending your turn notification:', error);
      }
    }

    console.log(`Started draft timer for league ${leagueId} (${finalTimeoutMs}ms)`);
  }

  /**
   * Clear a draft timer for a specific league
   */
  static clearDraftTimer(leagueId) {
    const timerData = draftTimers.get(leagueId);
    if (timerData && timerData.timeout) {
      clearTimeout(timerData.timeout);
      draftTimers.delete(leagueId);
      console.log(`Cleared draft timer for league ${leagueId}`);
    }
  }

  /**
   * Check if a timer is running for a league
   */
  static isTimerRunning(leagueId) {
    return draftTimers.has(leagueId);
  }

  /**
   * Get timer information for a league
   */
  static getTimerInfo(leagueId) {
    const timer = draftTimers.get(leagueId);
    if (!timer) return null;
    return { startTime: timer.startTime, timeoutMs: timer.timeoutMs };
  }

  /**
   * Make an automatic pick for the current drafter
   */
  static async makeAutoPick(leagueId) {
    // Prevent multiple simultaneous auto-picks for the same league
    if (autoPickInProgress.has(leagueId)) {
      console.log(`Auto-pick already in progress for league ${leagueId}, skipping`);
      return;
    }
    
    autoPickInProgress.add(leagueId);
    
    try {
      // Import the handler here to avoid circular dependency
      const handlePick = require('../websocket-handlers/pick');
      
      // Get current draft state
      const draftData = await liveDraftData(leagueId);
      const currentPickObj = draftData.draftOrder.find(pick => pick.dataValues.currentPick);
      
      if (!currentPickObj || currentPickObj.playerId) {
        console.log('No current pick found or pick already made');
        return;
      }
      
      // Select a random available player
      const availablePlayers = draftData.availablePlayers;
      if (availablePlayers.length === 0) {
        console.log('No available players for auto pick');        
        return;
      }
      
      const randomPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
      console.log(`Auto-picking player: ${randomPlayer.firstName} ${randomPlayer.lastName}`);
      
      // Create a mock websocket object for the auto pick
      const mockWs = {
        send: () => {}, // Mock send function
        leagueId: leagueId,
        myTeam: {
          teamId: currentPickObj.teamId,
          ownerId: currentPickObj.team?.ownerId || currentPickObj.team?.owner?.userId
        }
      };
      
      // Make the auto pick
      await handlePick({
        ws: mockWs,
        payload: {
          pick: currentPickObj,
          player: randomPlayer,
          auto: true
        },
        broadcastToLeague,
        clearDraftTimer: this.clearDraftTimer.bind(this),
        startDraftTimer: this.startDraftTimer.bind(this),        
        clientsByLeague: new Map() // Empty map since this is auto pick
      });
      
      // Broadcast that an auto pick was made
      broadcastToLeague(leagueId, {
        type: 'auto-pick-made',
        payload: {
          player: randomPlayer,
          team: currentPickObj.team,
          pickNumber: currentPickObj.pickNumber
        }
      });

      // Don't send push notification here - the pick handler will handle
      // notifying the next user if there is one
      
    } catch (error) {
      console.error('Error in makeAutoPick:', error);
      throw error;
    } finally {
      // Always remove the league from the in-progress set
      autoPickInProgress.delete(leagueId);
    }
  }

  /**
   * Check for drafts starting in 5 minutes and send notifications
   */
  static async checkDraftsStartingSoon(now) {
    try {
      // Look for drafts starting in 4-6 minutes (1 minute tolerance window)
      const fiveMinutesFromNow = new Date(now.getTime() + (5 * 60 * 1000));
      const fourMinutesFromNow = new Date(now.getTime() + (4 * 60 * 1000));
      const sixMinutesFromNow = new Date(now.getTime() + (6 * 60 * 1000));
      
      const upcomingDrafts = await Draft.findAll({
        where: {
          startDate: {
            [require('sequelize').Op.between]: [fourMinutesFromNow, sixMinutesFromNow]
          },
          complete: false
        },
        include: [
          {
            model: require('../models').League,
            as: 'league',
            include: [
              {
                model: require('../models').Team,
                as: 'teams',
                include: [
                  {
                    model: require('../models').User,
                    as: 'owner',
                    attributes: ['userId', 'email', 'firstName', 'lastName']
                  }
                ]
              }
            ]
          }
        ]
      });

      for (const draft of upcomingDrafts) {
        const notificationKey = `${draft.leagueId}_${draft.startDate.getTime()}`;
        
        // Skip if we've already sent notifications for this draft
        if (draftNotificationsSent.has(notificationKey)) {
          console.log(`Skipping draft ${draft.leagueId} - notifications already sent with key: ${notificationKey}`);
          continue;
        }

        console.log(`Sending 5-minute draft notifications for league ${draft.leagueId} (starting at ${draft.startDate})`);
        console.log(`Draft object:`, JSON.stringify(draft, null, 2));
        
        // Send notifications to all users in the league
        const notificationPromises = [];
        
        if (draft.league?.teams) {
          for (const team of draft.league.teams) {
            if (team.owner?.userId) {
              console.log(`Processing notifications for user ${team.owner.userId} (${team.owner.email}) in league ${draft.leagueId}`);
              
              // Send push notification
              const pushPromise = sendDraftStartingSoonNotification(team.owner.userId, draft.leagueId)
                .catch(err => console.error(`Failed to send push notification to user ${team.owner.userId}:`, err));
              
              // Send email notification
              const emailPromise = this.sendDraftStartingSoonEmail(team.owner, draft)
                .catch(err => console.error(`Failed to send email to user ${team.owner.userId}:`, err));
              
              notificationPromises.push(pushPromise, emailPromise);
            } else {
              console.log(`Skipping team ${team.teamId} - no owner or userId found`);
            }
          }
        } else {
          console.log(`No teams found for league ${draft.leagueId}`);
        }
        
        // Wait for all notifications to be sent
        await Promise.allSettled(notificationPromises);
        
        // Mark this draft as having notifications sent
        draftNotificationsSent.add(notificationKey);
        
        console.log(`Sent 5-minute notifications to ${draft.league?.teams?.length || 0} users for league ${draft.leagueId}`);
      }
    } catch (err) {
      console.error('Error checking drafts starting soon:', err);
    }
  }

  /**
   * Send email notification for draft starting soon
   */
  static async sendDraftStartingSoonEmail(user, draft) {
    console.log(`Attempting to send draft starting soon email to user ${user.userId} (${user.email})`);
    
    try {
      const { checkEmailPreference } = require('../helpers/emailUtils');
      
      // Check if user has enabled draft notifications
      console.log(`Checking email preferences for user ${user.userId}`);
      const emailCheck = await checkEmailPreference(user.userId, 'draftNotifications');
      console.log(`Email preference check result for user ${user.userId}:`, emailCheck);
      
      if (!emailCheck.canSend) {
        console.log(`Email not sent to user ${user.userId} - email preferences disabled`);
        return false;
      }

      const FormData = require("form-data");
      const Mailgun = require("mailgun.js");
      
      // Check if required environment variables are set
      if (!process.env.MAILGUN_KEY) {
        console.error(`MAILGUN_KEY environment variable not set for user ${user.userId}`);
        return false;
      }
      
      if (!process.env.MAILGUN_DOMAIN) {
        console.error(`MAILGUN_DOMAIN environment variable not set for user ${user.userId}`);
        return false;
      }
      
      console.log(`Using Mailgun domain: ${process.env.MAILGUN_DOMAIN}`);
      
      const mailgun = new Mailgun(FormData);
      const mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_KEY
      });

      const startTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }).format(new Date(draft.startDate));

      const templateData = {
        firstName: user.firstName || 'Team Owner',
        leagueName: draft.league?.name || 'Your League',
        startTime: startTime + ' (Central)',
        draftUrl: `${process.env.CLIENT_URL}/draft/${draft.leagueId}`
      };

      const emailData = {
        from: `Survivor Fantasy <noreply@${process.env.MAILGUN_DOMAIN}>`,
        to: user.email,
        subject: 'Draft Starting in 5 Minutes!',
        template: 'draft-starting-soon',
        'h:X-Mailgun-Variables': JSON.stringify(templateData)
      };

      console.log(`Sending draft starting soon email to ${user.email} with template data:`, templateData);
      
      const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);
      console.log(`Draft starting soon email sent to ${user.email}: ${response.id}`);
      return true;
    } catch (error) {
      console.error(`Error sending draft starting soon email to user ${user.userId} (${user.email}):`, error);
      return false;
    }
  }

  /**
   * Execute periodic check for scheduled drafts
   * This is called by the cron job
   */
  static async execute() {
    console.log('Running draft management job...');
    await this.checkScheduledDrafts();
  }

  /**
   * Clean up all timers (useful for shutdown)
   */
  static cleanup() {
    console.log('Cleaning up draft timers...');
    for (const [leagueId] of draftTimers) {
      this.clearDraftTimer(leagueId);
    }
    // Clear notification tracking
    draftNotificationsSent.clear();
    // Clear auto-pick tracking
    autoPickInProgress.clear();
  }
}

module.exports = DraftManagementJob;

// OBSOLETE: This file is no longer used for survey reminders.
// Survey reminders now use Mailgun's 'surveyreminder' template via surveyReminderJob.js
// This file can be removed in a future cleanup.

const generateSurveyReminderEmail = (user, team, episode) => {
  const episodeTitle = episode.title || `Episode ${episode.season}`;
  const airDate = new Date(episode.airDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Survey Reminder</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">🏝️ Fantasy Survivor</h1>
          <p style="color: #e3f2fd; margin: 10px 0 0 0; font-size: 16px;">Survey Reminder</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 40px 30px;">
          <h2 style="color: #343a40; margin-top: 0; font-size: 24px;">Don't Miss Out, ${user.firstName}!</h2>
          
          <p style="color: #495057; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            <strong>${episodeTitle}</strong> airs tomorrow (${airDate}), and you haven't completed 
            your survey yet for team <strong style="color: #007bff;">${team.name}</strong>.
          </p>
          
          <!-- Highlight Box -->
          <div style="background-color: #e3f2fd; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #1565c0; font-size: 18px;">📊 Why Complete Your Survey?</h3>
            <ul style="color: #424242; margin-bottom: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Make predictions about what will happen in the episode</li>
              <li style="margin-bottom: 8px;">Earn points for your team based on correct predictions</li>
              <li style="margin-bottom: 8px;">Stay competitive in your league standings</li>
              <li>Show off your Survivor knowledge and strategy!</li>
            </ul>
          </div>
          
          <!-- Call to Action -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://your-app.com'}" 
               style="background-color: #007bff; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 25px; font-weight: bold; 
                      font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);">
              🎯 Complete Survey Now
            </a>
          </div>
          
          <!-- Urgency Note -->
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; color: #856404; font-weight: 500; text-align: center;">
              ⏰ Remember: Surveys lock when the episode begins airing!
            </p>
          </div>
          
          <p style="color: #6c757d; font-size: 14px; margin-top: 30px;">
            Good luck with your predictions, and may the odds be ever in your favor! 🔥
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #dee2e6;">
          <p style="color: #6c757d; font-size: 12px; margin: 0; text-align: center;">
            This reminder was sent because you have poll reminders enabled in your email preferences. 
            You can change this setting in your account settings.
          </p>
          <hr style="margin: 15px 0; border: none; border-top: 1px solid #dee2e6;">
          <p style="color: #adb5bd; font-size: 11px; text-align: center; margin: 0;">
            Fantasy Survivor | Survey Reminder System | Outwit. Outplay. Outlast.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = generateSurveyReminderEmail;

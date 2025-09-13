const cron = require('node-cron');
const SurveyReminderJob = require('./surveyReminderJob');
const DraftManagementJob = require('./draftManagementJob');

// Store active jobs for management
const activeJobs = new Map();

/**
 * Initialize all background jobs
 */
function initializeJobs() {
  console.log('Initializing background jobs...');

  // Survey reminder job - runs daily at 6 PM UTC
  const surveyReminderTask = cron.schedule('0 18 * * *', () => {
    console.log('Running survey reminder job...');
    SurveyReminderJob.execute();
  }, {
    scheduled: false // Don't start automatically
  });
  
  activeJobs.set('surveyReminder', {
    task: surveyReminderTask,
    schedule: '0 18 * * *',
    description: 'Send survey reminders to teams who haven\'t completed surveys'
  });

  // Draft management job - runs every 30 seconds to check for scheduled drafts
  // const draftManagementTask = cron.schedule('*/30 * * * * *', () => {
  //   DraftManagementJob.execute();
  // }, {
  //   scheduled: false // Don't start automatically
  // });
  
  // activeJobs.set('draftManagement', {
  //   task: draftManagementTask,
  //   schedule: '*/30 * * * * *',
  //   description: 'Check for scheduled drafts and manage draft timers'
  // });
  
  // Start all jobs
  startAllJobs();
  
  console.log(`Initialized ${activeJobs.size} background jobs`);
}

/**
 * Start all scheduled jobs
 */
function startAllJobs() {
  activeJobs.forEach((job, name) => {
    job.task.start();
    console.log(`Started job: ${name} (${job.schedule})`);
  });
}

/**
 * Stop all scheduled jobs
 */
function stopAllJobs() {
  activeJobs.forEach((job, name) => {
    job.task.stop();
    console.log(`Stopped job: ${name}`);
  });
}

/**
 * Get status of all jobs
 */
function getJobsStatus() {
  const status = {};
  activeJobs.forEach((job, name) => {
    const taskStatus = job.task.getStatus();
    status[name] = {
      running: taskStatus !== 'stopped',
      schedule: job.schedule,
      description: job.description,
      status: taskStatus
    };
  });
  return status;
}

/**
 * Manually trigger a specific job
 */
async function triggerJob(jobName) {
  switch(jobName) {
    case 'surveyReminder':
      return await SurveyReminderJob.execute();
    case 'draftManagement':
      return await DraftManagementJob.execute();
    default:
      throw new Error(`Unknown job: ${jobName}`);
  }
}

module.exports = {
  initializeJobs,
  startAllJobs,
  stopAllJobs,
  getJobsStatus,
  triggerJob
};

const cron = require('node-cron');
const Note = require('../models/Note');

exports.setupCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running cron job: Archiving old notes');
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await Note.updateMany(
        {
          lastUpdated: { $lt: thirtyDaysAgo },
          isArchived: false
        },
        {
          isArchived: true
        }
      );
      
      console.log(`Archived ${result.modifiedCount} notes`);
    } catch (error) {
      console.error('Error archiving old notes:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });
  
  console.log('Cron jobs scheduled');
};
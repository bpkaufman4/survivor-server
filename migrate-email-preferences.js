const { User } = require('./models');
const sequelize = require('./config/connection');

async function migrateEmailPreferences() {
  try {
    console.log('Starting email preferences migration...');
    
    // Sync the database to add the new column
    await sequelize.sync({ alter: true });
    console.log('Database synced - emailPreferences column added');
    
    // Update existing users to have default preferences if they don't have any
    const usersToUpdate = await User.findAll({
      where: {
        emailPreferences: null
      }
    });
    
    console.log(`Found ${usersToUpdate.length} users without email preferences`);
    
    for (const user of usersToUpdate) {
      await user.update({
        emailPreferences: {
          draftNotifications: true,
          latestUpdates: true,
          pollReminders: true
        }
      });
      console.log(`Updated user ${user.userId} with default email preferences`);
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateEmailPreferences();

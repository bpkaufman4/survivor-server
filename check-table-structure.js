#!/usr/bin/env node

/**
 * Check database table structure for userFcmToken
 */

require('dotenv').config();
const { sequelize } = require('./models');

async function checkTableStructure() {
  try {
    console.log('Checking userFcmToken table structure...');
    
    // Check if table exists
    const [results] = await sequelize.query("SHOW TABLES LIKE 'userFcmToken'");
    
    if (results.length === 0) {
      console.log('❌ Table "userFcmToken" does not exist!');
      console.log('Need to create the table first.');
      return;
    }
    
    console.log('✅ Table "userFcmToken" exists');
    
    // Get table structure
    const [columns] = await sequelize.query("DESCRIBE userFcmToken");
    
    console.log('\n📊 Table structure:');
    columns.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.Field} (${col.Type}) - ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}${col.Key ? ` [${col.Key}]` : ''}${col.Default !== null ? ` DEFAULT: ${col.Default}` : ''}`);
    });
    
    // Check for timestamp columns specifically
    const hasCreatedAt = columns.some(col => col.Field === 'createdAt');
    const hasUpdatedAt = columns.some(col => col.Field === 'updatedAt');
    const hasCreated = columns.some(col => col.Field === 'created');
    const hasUpdated = columns.some(col => col.Field === 'updated');
    
    console.log('\n🕐 Timestamp columns:');
    console.log(`  - createdAt: ${hasCreatedAt ? '✅' : '❌'}`);
    console.log(`  - updatedAt: ${hasUpdatedAt ? '✅' : '❌'}`);
    console.log(`  - created: ${hasCreated ? '✅' : '❌'}`);
    console.log(`  - updated: ${hasUpdated ? '✅' : '❌'}`);
    
    if (!hasCreatedAt && !hasCreated) {
      console.log('\n💡 SOLUTION: Need to add timestamp columns to the table');
    }
    
    // Check for any existing data
    const [countResult] = await sequelize.query("SELECT COUNT(*) as count FROM userFcmToken");
    console.log(`\n📊 Table has ${countResult[0].count} rows`);
    
  } catch (error) {
    console.error('Error checking table structure:', error.message);
  }
}

// Connect and check
sequelize.authenticate()
  .then(() => {
    console.log('📡 Database connected');
    return checkTableStructure();
  })
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Error:', error.message);
    process.exit(1);
  });

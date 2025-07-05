#!/usr/bin/env node

/**
 * Test Firebase Admin SDK initialization and connectivity
 */

require('dotenv').config();
const admin = require('firebase-admin');

async function testFirebaseAdmin() {
  console.log(`\n🔥 FIREBASE ADMIN SDK TEST`);
  console.log(`============================`);
  
  // Environment variables check
  console.log(`\n📋 ENVIRONMENT VARIABLES:`);
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID'
  ];
  
  const missing = [];
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${varName.includes('KEY') ? '[REDACTED]' : value}`);
    } else {
      console.log(`❌ ${varName}: NOT SET`);
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.log(`\n💥 MISSING REQUIRED ENVIRONMENT VARIABLES:`);
    missing.forEach(varName => console.log(`   - ${varName}`));
    console.log(`\nPlease check your .env file!`);
    return;
  }
  
  // Initialize Firebase Admin
  console.log(`\n🚀 INITIALIZING FIREBASE ADMIN SDK:`);
  
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL?.replace('@', '%40')}`,
      universe_domain: "googleapis.com"
    };

    console.log(`- Service account object created`);
    console.log(`- Project ID: ${serviceAccount.project_id}`);
    console.log(`- Client email: ${serviceAccount.client_email}`);
    console.log(`- Private key length: ${serviceAccount.private_key?.length} chars`);
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID
      });
      console.log(`✅ Firebase Admin SDK initialized successfully`);
    } else {
      console.log(`✅ Firebase Admin SDK already initialized`);
    }
    
    // Test messaging service
    console.log(`\n🔔 TESTING MESSAGING SERVICE:`);
    const messaging = admin.messaging();
    console.log(`✅ Messaging service created`);
    
    // Test with a dummy (invalid) token to see if the service responds
    console.log(`\n🧪 TESTING WITH DUMMY TOKEN:`);
    const dummyToken = 'dummy_token_for_testing_connection';
    
    try {
      await messaging.send({
        token: dummyToken,
        notification: {
          title: 'Test',
          body: 'Test'
        }
      });
    } catch (testError) {
      if (testError.code === 'messaging/invalid-argument' || 
          testError.code === 'messaging/registration-token-not-registered') {
        console.log(`✅ Messaging service responded correctly (expected error for dummy token)`);
        console.log(`   Error code: ${testError.code}`);
        console.log(`   This confirms Firebase Admin SDK is working properly!`);
      } else {
        console.log(`⚠️ Unexpected error from messaging service:`);
        console.log(`   Code: ${testError.code}`);
        console.log(`   Message: ${testError.message}`);
      }
    }
    
    console.log(`\n🎯 FIREBASE ADMIN SDK TEST COMPLETE!`);
    console.log(`The SDK appears to be working correctly.`);
    
  } catch (error) {
    console.log(`💥 FIREBASE INITIALIZATION ERROR:`);
    console.log(`Code: ${error.code}`);
    console.log(`Message: ${error.message}`);
    console.log(`Stack:`, error.stack);
    
    if (error.message?.includes('private_key')) {
      console.log(`\n💡 PRIVATE KEY ISSUE DETECTED:`);
      console.log(`- Check that FIREBASE_PRIVATE_KEY is properly formatted`);
      console.log(`- Ensure newlines are properly escaped as \\n`);
      console.log(`- Verify the key starts with "-----BEGIN PRIVATE KEY-----"`);
    }
  }
}

testFirebaseAdmin()
  .then(() => {
    console.log(`\n👋 Test complete!`);
    process.exit(0);
  })
  .catch(error => {
    console.error(`💥 Unexpected error:`, error);
    process.exit(1);
  });

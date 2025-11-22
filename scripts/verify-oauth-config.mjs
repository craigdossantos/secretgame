#!/usr/bin/env node
/**
 * OAuth Configuration Verifier
 * Helps verify and guide OAuth setup for production deployment
 */

import 'dotenv/config';

const PRODUCTION_URL = 'https://secretgame.vercel.app';
const CALLBACK_PATH = '/api/auth/callback/google';

console.log('🔐 OAuth Configuration Verifier\n');

// Check environment variables
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;

console.log('📋 Current Configuration:');
console.log('─'.repeat(60));
console.log(`GOOGLE_CLIENT_ID: ${clientId ? '✅ Set' : '❌ Missing'}`);
console.log(`GOOGLE_CLIENT_SECRET: ${clientSecret ? '✅ Set' : '❌ Missing'}`);
console.log(`NEXTAUTH_URL: ${nextAuthUrl || '❌ Not set'}`);
console.log('─'.repeat(60));
console.log('');

// Production callback URL
const productionCallback = `${PRODUCTION_URL}${CALLBACK_PATH}`;
const localCallback = `http://localhost:3000${CALLBACK_PATH}`;

console.log('🌐 Required Callback URLs:');
console.log('─'.repeat(60));
console.log(`Production:  ${productionCallback}`);
console.log(`Local Dev:   ${localCallback}`);
console.log('─'.repeat(60));
console.log('');

// Instructions
console.log('📝 Manual Setup Required (Google Security Limitation):');
console.log('─'.repeat(60));
console.log('');
console.log('Google does not allow programmatic updates to OAuth clients.');
console.log('You must manually add the callback URL in Google Cloud Console.');
console.log('');
console.log('Steps:');
console.log('1. Open: https://console.cloud.google.com/apis/credentials');
console.log('');
if (clientId) {
  console.log(`2. Find OAuth Client: ${clientId.substring(0, 20)}...`);
} else {
  console.log('2. Find your OAuth 2.0 Client ID');
}
console.log('');
console.log('3. Click "Edit" (pencil icon)');
console.log('');
console.log('4. Scroll to "Authorized redirect URIs"');
console.log('');
console.log('5. Click "+ ADD URI" and paste:');
console.log(`   ${productionCallback}`);
console.log('');
console.log('6. Click "SAVE" at the bottom');
console.log('');
console.log('─'.repeat(60));
console.log('');

// Quick copy commands
console.log('📋 Quick Copy (for pasting into Google Console):');
console.log('─'.repeat(60));
console.log(productionCallback);
console.log('─'.repeat(60));
console.log('');

// Verification steps
console.log('✅ After Adding the URI, Test These:');
console.log('─'.repeat(60));
console.log(`1. Visit: ${PRODUCTION_URL}`);
console.log('2. Click "Sign in with Google"');
console.log('3. Verify OAuth popup appears (no redirect_uri_mismatch error)');
console.log('4. Complete sign-in flow');
console.log('5. Check that you\'re redirected back to the app');
console.log('─'.repeat(60));
console.log('');

// Common issues
console.log('⚠️  Common Issues:');
console.log('─'.repeat(60));
console.log('• "redirect_uri_mismatch" → URI not added or typo in URL');
console.log('• "access_denied" → User cancelled OAuth flow');
console.log('• "invalid_client" → CLIENT_ID or SECRET incorrect');
console.log('• Stuck on loading → Check NEXTAUTH_SECRET is set');
console.log('─'.repeat(60));
console.log('');

console.log('🎉 Once configured, your app will support:');
console.log('   ✅ Google OAuth sign-in');
console.log('   ✅ Persistent user sessions');
console.log('   ✅ Production-ready authentication');
console.log('');

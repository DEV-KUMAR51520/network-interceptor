#!/usr/bin/env node

/**
 * 🚀 Network Monitor Dashboard - Vercel Deployment Script
 *
 * This script helps you deploy your Network Monitor Dashboard to Vercel
 * with a single command. It checks your setup and guides you through deployment.
 *
 * Usage:
 *   node deploy.js
 *   or
 *   npm run deploy
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Network Monitor Dashboard - Vercel Deployment Script');
console.log('====================================================\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
const serverJsPath = path.join(process.cwd(), 'server.js');
const vercelJsonPath = path.join(process.cwd(), 'vercel.json');

if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Are you in the project root?');
  process.exit(1);
}

if (!fs.existsSync(serverJsPath)) {
  console.error('❌ Error: server.js not found. Make sure your Express server exists.');
  process.exit(1);
}

if (!fs.existsSync(vercelJsonPath)) {
  console.error('❌ Error: vercel.json not found. Please create it first.');
  console.log('   Run: node create-vercel-config.js');
  process.exit(1);
}

console.log('✅ Project structure verified');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI is installed');
} catch (error) {
  console.log('⚠️  Vercel CLI not found. Installing...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully');
  } catch (installError) {
    console.error('❌ Failed to install Vercel CLI. Please install manually:');
    console.error('   npm install -g vercel');
    process.exit(1);
  }
}

// Check if user is logged in to Vercel
try {
  execSync('vercel whoami', { stdio: 'pipe' });
  console.log('✅ Logged in to Vercel');
} catch (error) {
  console.log('⚠️  Not logged in to Vercel. Starting login process...');
  try {
    const loginProcess = spawn('vercel', ['login'], {
      stdio: 'inherit',
      shell: true
    });

    loginProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Successfully logged in to Vercel');
        proceedWithDeployment();
      } else {
        console.error('❌ Login failed. Please try again.');
        process.exit(1);
      }
    });

    return; // Wait for login to complete
  } catch (loginError) {
    console.error('❌ Login failed. Please login manually:');
    console.error('   vercel login');
    process.exit(1);
  }
}

function proceedWithDeployment() {
  console.log('\n🚀 Starting deployment...\n');

  try {
    // Run vercel deployment
    const deployProcess = spawn('vercel', ['--prod'], {
      stdio: 'inherit',
      shell: true
    });

    deployProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 Deployment successful!');
        console.log('🌐 Your Network Monitor Dashboard is now live on Vercel!');
        console.log('\n📊 Next steps:');
        console.log('   1. Test your live dashboard');
        console.log('   2. Check Vercel analytics');
        console.log('   3. Set up custom domain (optional)');
        console.log('   4. Add to your portfolio!');
        console.log('\n📖 See VERCEL_DEPLOYMENT.md for detailed documentation');
      } else {
        console.error('\n❌ Deployment failed. Check the errors above.');
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check your internet connection');
        console.log('   2. Verify package.json dependencies');
        console.log('   3. Check server.js for syntax errors');
        console.log('   4. Review vercel.json configuration');
        console.log('   5. See VERCEL_DEPLOYMENT.md for help');
      }
    });

  } catch (deployError) {
    console.error('❌ Deployment failed:', deployError.message);
    console.log('\n🔧 Try manual deployment:');
    console.log('   vercel --prod');
  }
}

// If we reach here, user is already logged in
proceedWithDeployment();
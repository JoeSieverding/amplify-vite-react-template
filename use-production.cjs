// use-production.cjs
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths to configuration files
const sandboxConfigPath = path.join(__dirname, 'amplify_outputs.sandbox.json');
const productionConfigPath = path.join(__dirname, 'amplify_outputs.json');
const tempPath = path.join(__dirname, 'amplify_outputs.temp.json');

console.log('Starting development server with PRODUCTION backend...');

try {
  // Check if both files exist
  if (fs.existsSync(sandboxConfigPath) && fs.existsSync(productionConfigPath)) {
    // Backup the sandbox config
    console.log('Backing up sandbox configuration...');
    fs.copyFileSync(sandboxConfigPath, tempPath);
    
    // Copy the production config to sandbox config location
    console.log('Replacing sandbox with production configuration...');
    fs.copyFileSync(productionConfigPath, sandboxConfigPath);
    
    // Start Vite
    console.log('Running Vite with production configuration...');
    execSync('vite', { stdio: 'inherit' });
  } else {
    console.log('Configuration files not found. Using default configuration.');
    execSync('vite', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Error:', error.message);
} finally {
  // Restore the original sandbox configuration
  if (fs.existsSync(tempPath)) {
    console.log('Restoring sandbox configuration...');
    fs.copyFileSync(tempPath, sandboxConfigPath);
    fs.unlinkSync(tempPath);
  }
}
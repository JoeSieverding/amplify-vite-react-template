// use-production.js
import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths to configuration files
const sandboxConfigPath = path.join(__dirname, 'amplify_outputs.sandbox.json');
const productionConfigPath = path.join(__dirname, 'amplify_outputs.json');
const tempSandboxPath = path.join(__dirname, 'amplify_outputs.sandbox.temp.json');

console.log('Starting development server with PRODUCTION backend...');

try {
  // Check if sandbox config exists
  if (fs.existsSync(sandboxConfigPath)) {
    // Rename sandbox config to a temp file
    console.log('Temporarily moving sandbox configuration...');
    fs.renameSync(sandboxConfigPath, tempSandboxPath);
    
    // Start Vite
    console.log('Running Vite with production configuration...');
    execSync('vite', { stdio: 'inherit' });
  } else {
    console.log('Sandbox configuration not found. Using default configuration.');
    execSync('vite', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('Error:', error.message);
} finally {
  // Restore the sandbox configuration
  if (fs.existsSync(tempSandboxPath)) {
    console.log('Restoring sandbox configuration...');
    fs.renameSync(tempSandboxPath, sandboxConfigPath);
  }
}
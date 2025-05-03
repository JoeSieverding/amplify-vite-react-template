const fs = require('fs');
const path = require('path');

// Get the environment from command line arguments
const env = process.argv[2];

if (!env || (env !== 'prod' && env !== 'sandbox')) {
  console.error('Please specify an environment: "prod" or "sandbox"');
  process.exit(1);
}

const rootDir = __dirname;
const outputsPath = path.join(rootDir, 'amplify_outputs.json');
const sandboxOutputsPath = path.join(rootDir, 'amplify_outputs.sandbox.json');
const prodOutputsPath = path.join(rootDir, 'amplify_outputs.prod.json');

// First time setup - create backup files if they don't exist
if (!fs.existsSync(prodOutputsPath) && fs.existsSync(outputsPath)) {
  console.log('Creating initial production backup...');
  fs.copyFileSync(outputsPath, prodOutputsPath);
}

// Check if the source file exists
const sourcePath = env === 'prod' ? prodOutputsPath : sandboxOutputsPath;
if (!fs.existsSync(sourcePath)) {
  console.error(`Source file ${sourcePath} does not exist.`);
  
  if (env === 'sandbox') {
    console.log('Creating sandbox configuration from current outputs...');
    fs.copyFileSync(outputsPath, sandboxOutputsPath);
  } else if (env === 'prod') {
    console.error('Please create amplify_outputs.prod.json with your production configuration first.');
    process.exit(1);
  }
}

// Backup current configuration before switching
if (env === 'prod' && fs.existsSync(outputsPath)) {
  console.log('Backing up current sandbox configuration...');
  fs.copyFileSync(outputsPath, sandboxOutputsPath);
} else if (env === 'sandbox' && fs.existsSync(outputsPath)) {
  console.log('Backing up current production configuration...');
  fs.copyFileSync(outputsPath, prodOutputsPath);
}

// Copy the selected environment configuration to amplify_outputs.json
try {
  fs.copyFileSync(sourcePath, outputsPath);
  
  // Create or update .env.local file with environment setting
  const envFilePath = path.join(rootDir, '.env.local');
  fs.writeFileSync(envFilePath, `VITE_ENV=${env === 'prod' ? 'production' : 'sandbox'}\n`);
  
  console.log(`Successfully switched to ${env} environment.`);
} catch (error) {
  console.error(`Error switching environments: ${error.message}`);
  process.exit(1);
}
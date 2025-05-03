import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

// Configure Amplify to use production
export function configureAmplifyProduction() {
  console.log('Configuring Amplify with production backend');
  Amplify.configure(outputs);
}

// For future use - configure Amplify to use sandbox
export function configureAmplifySandbox(sandboxConfig: any) {
  console.log('Configuring Amplify with sandbox backend');
  Amplify.configure(sandboxConfig);
}

// Helper to determine if we're using production
export function isProduction() {
  return true; // Force production mode
}
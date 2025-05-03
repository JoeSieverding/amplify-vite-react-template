import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";
import { apiConfig, useProductionBackend } from "../config";

// Configure Amplify based on the selected environment
export function configureAmplify() {
  const isProduction = useProductionBackend();
  
  if (isProduction) {
    configureAmplifyProduction();
  } else {
    configureAmplifySandbox(outputs);
  }
}

// Configure Amplify to use production
export function configureAmplifyProduction() {
  console.log('Configuring Amplify with production backend');
  
  // Use the hardcoded production configuration from config.ts
  // instead of relying on amplify_outputs.json which might be updated by sandbox
  const productionConfig = {
    ...outputs,
    data: {
      ...outputs.data,
      url: apiConfig.apiUrl,
      api_key: apiConfig.apiKey
    }
  };
  
  Amplify.configure(productionConfig);
}

// Configure Amplify to use sandbox
export function configureAmplifySandbox(sandboxConfig: any) {
  console.log('Configuring Amplify with sandbox backend');
  Amplify.configure(sandboxConfig);
}

// Helper to determine if we're using production
export function isProduction() {
  return useProductionBackend();
}
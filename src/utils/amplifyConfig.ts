import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

// Default configuration (sandbox)
const sandboxConfig = outputs;

// Production configuration - replace these values with your production endpoints
const productionConfig = {
  ...outputs,
  data: {
    ...outputs.data,
    url: "https://your-production-appsync-endpoint.appsync-api.us-east-1.amazonaws.com/graphql",
    api_key: "your-production-api-key" // Replace with your production API key
  }
};

// Environment flag - set to 'production' to use production backend
const currentEnv = process.env.REACT_APP_ENV || 'sandbox';

// Configure Amplify based on environment
export const configureAmplify = () => {
  const config = currentEnv === 'production' ? productionConfig : sandboxConfig;
  Amplify.configure(config);
  console.log(`Amplify configured for ${currentEnv} environment`);
};

// Helper function to check current environment
export const isProduction = () => currentEnv === 'production';
import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

// Configure Amplify based on the outputs file
export const configureAmplify = () => {
  Amplify.configure(outputs);
  console.log(`Amplify configured with endpoint: ${outputs.data.url}`);
};

// Helper function to check if we're using production
export const isProduction = () => {
  return true; // Always return true to force production mode
};
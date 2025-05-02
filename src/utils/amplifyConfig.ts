import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";

// Configure Amplify based on the outputs file
export const configureAmplify = () => {
  Amplify.configure(outputs);
  console.log(`Amplify configured with endpoint: ${outputs.data.url}`);
};

// Helper function to check if we're using production
export const isProduction = () => {
  return outputs.data.url.includes('h2qagbm7vjb4tlk5ebnq2dmq4m');
};
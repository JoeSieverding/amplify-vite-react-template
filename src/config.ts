// Production backend configuration
export const apiConfig = {
  apiUrl: "https://h2qagbm7vjb4tlk5ebnq2dmq4m.appsync-api.us-east-1.amazonaws.com/graphql",
  apiKey: "da2-5b43ikxfhfch7nzszdnig4gkxa"
};

// Determine if we should use production backend based on environment variable
export const useProductionBackend = (): boolean => {
  // Check for environment variable set by npm script
  const envSetting = import.meta.env.VITE_ENV;
  console.log(`Current environment: ${envSetting || 'not set (defaulting to production)'}`);
  return envSetting !== 'sandbox';
};
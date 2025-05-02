// Production backend configuration
export const productionConfig = {
  apiUrl: "https://h2qagbm7vjb4tlk5ebnq2dmq4m.appsync-api.us-east-1.amazonaws.com/graphql",
  apiKey: "da2-5b43ikxfhfch7nzszdnig4gkxa"
};

// Sandbox backend configuration (from amplify_outputs.json)
export const sandboxConfig = {
  apiUrl: "https://esheqvoqgjfnbgmxy2dw7mks2u.appsync-api.us-east-1.amazonaws.com/graphql",
  apiKey: "da2-zdw4py2yn5bbfddzhzqhyrk7me"
};

// Always use production backend
export const useProductionBackend = true;
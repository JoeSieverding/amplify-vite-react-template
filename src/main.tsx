import { createRoot } from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import App from "./App";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import TopNav from "./components/Common/TopNav";
import "@cloudscape-design/global-styles/index.css"
import { ThemeProvider } from '@aws-amplify/ui-react';
import { BrowserRouter } from "react-router-dom";
import './utils/pdfWorker';
import { useProductionBackend, productionConfig } from './config';

// Configure Amplify based on environment
if (useProductionBackend) {
  // Use production backend configuration
  const config = {
    ...outputs,
    data: {
      ...outputs.data,
      url: productionConfig.apiUrl,
      api_key: productionConfig.apiKey
    }
  };
  console.log('Using PRODUCTION backend');
  Amplify.configure(config);
} else {
  // Use sandbox backend configuration (default from amplify_outputs.json)
  console.log('Using SANDBOX backend');
  Amplify.configure(outputs);
}

const container = document.getElementById("root");
if (!container) throw new Error('Failed to find the root element');
const root = createRoot(container);
document.title = "SCA Suite";
root.render(
  <Authenticator
    signUpAttributes={['email']}
    formFields={{
      signUp: {
        email: {
          placeholder: "Enter your email",
          label: "Email",
          isRequired: true
        }
      }
    }}
    services={{
      validateCustomSignUp: async (formData) => {
        const email = formData.email;
        if (!email.endsWith('@amazon.com')) {
          return {
            email: 'Only @amazon.com email addresses are allowed'
          };
        }
        return undefined; // or return {} if you want to indicate validation passed
      }
    }}
  >
    <BrowserRouter>
      <ThemeProvider>
        <TopNav />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </Authenticator>
);
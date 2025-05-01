import { createRoot } from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import App from "./App";
import { Amplify } from "aws-amplify";
import productionOutputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import TopNav from "./components/Common/TopNav";
import "@cloudscape-design/global-styles/index.css"
import { ThemeProvider } from '@aws-amplify/ui-react';
import { BrowserRouter } from "react-router-dom";
import './utils/pdfWorker';

// In development mode, check if we should use sandbox
if (import.meta.env.DEV) {
  try {
    // Dynamic import only works in development
    const useSandbox = import.meta.env.VITE_USE_SANDBOX !== 'false';
    
    if (useSandbox) {
      // This import is only attempted in development mode
      import('../amplify_outputs.sandbox.json').then(module => {
        const sandboxOutputs = module.default;
        Amplify.configure(sandboxOutputs);
        console.log('Using SANDBOX backend in development');
      }).catch(err => {
        console.warn('Failed to load sandbox config, using production:', err);
        Amplify.configure(productionOutputs);
      });
    } else {
      console.log('Using PRODUCTION backend in development');
      Amplify.configure(productionOutputs);
    }
  } catch (err) {
    console.warn('Error loading configuration, using production:', err);
    Amplify.configure(productionOutputs);
  }
} else {
  // In production, always use production config
  console.log('Using PRODUCTION backend in production build');
  Amplify.configure(productionOutputs);
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
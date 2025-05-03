import { createRoot } from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import App from "./App";
import '@aws-amplify/ui-react/styles.css';
import TopNav from "./components/Common/TopNav";
import "@cloudscape-design/global-styles/index.css"
import { ThemeProvider } from '@aws-amplify/ui-react';
import { BrowserRouter } from "react-router-dom";
import './utils/pdfWorker';
import { signOut } from 'aws-amplify/auth';
import { configureAmplify } from "./config/amplify-config";

// Clear any existing auth state before configuring Amplify
async function clearAuthState() {
  try {
    await signOut({ global: true });
    console.log('Successfully cleared previous auth state');
  } catch (error) {
    console.log('No previous auth state to clear');
  }
}

// Configure Amplify and render the app
async function initializeApp() {
  await clearAuthState();
  
  // Configure Amplify based on the environment setting
  configureAmplify();
  
  // Render the app
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
}

// Start the app
initializeApp().catch(error => {
  console.error('Error during app initialization:', error);
  // Render a fallback UI or error message
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Something went wrong</h1>
        <p>We encountered an error while initializing the application. Please try refreshing the page.</p>
        <button onClick={() => window.location.reload()}>Refresh</button>
      </div>
    );
  }
});
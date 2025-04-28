import React from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from '@aws-amplify/ui-react';
import App from "./App.tsx";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import '@aws-amplify/ui-react/styles.css';
import TopNav from "./components/Common/TopNav";
import "@cloudscape-design/global-styles/index.css"
import { ThemeProvider } from '@aws-amplify/ui-react';
import { BrowserRouter } from "react-router-dom";

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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
  </React.StrictMode>
);

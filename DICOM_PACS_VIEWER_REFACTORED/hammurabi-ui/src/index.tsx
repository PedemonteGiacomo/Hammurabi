// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Hammurabi_style.css';
import App from './App';
import { initializeCornerstoneJS } from './cornerstoneSetup';

// Read Cognito settings from environment variables.
const cognitoAuthConfig = {
  authority: process.env.REACT_APP_COGNITO_AUTHORITY || '',
  client_id: process.env.REACT_APP_COGNITO_CLIENT_ID || '',
  redirect_uri: process.env.REACT_APP_COGNITO_REDIRECT_URI || '',
  response_type: "code",
  scope: process.env.REACT_APP_COGNITO_SCOPE || "",
};

initializeCornerstoneJS()
  .then(() => {
    const rootElement = document.getElementById('root') as HTMLElement;
    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <React.StrictMode>
        <AuthProvider {...cognitoAuthConfig}>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error('Failed to initialize CornerstoneJS', error);
  });

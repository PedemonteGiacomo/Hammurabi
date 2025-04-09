// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Hammurabi_style.css';
import App from './App';
import { initializeCornerstoneJS } from './cornerstoneSetup';

const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_LLk8IEqxB",
  client_id: "6k05u15k2i32hnbajmso8fqoro",
  redirect_uri: "http://localhost:3000",
  response_type: "code",
  scope: "phone openid email",
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

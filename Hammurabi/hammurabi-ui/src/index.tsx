// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from 'react-oidc-context';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Hammurabi_style.css';
import App from './App';

// Read Cognito settings from environment variables.
const cognitoAuthConfig = {
  authority:   window._env_.REACT_APP_COGNITO_AUTHORITY   || '',
  client_id:   window._env_.REACT_APP_COGNITO_CLIENT_ID   || '',
  redirect_uri:window._env_.REACT_APP_COGNITO_REDIRECT_URI|| '',
  response_type:'code',
  scope:       window._env_.REACT_APP_COGNITO_SCOPE       || '',
};

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

// display in console the cognitoAuthConfig
console.log('Cognito Auth Config:', cognitoAuthConfig);

root.render(
  <React.StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
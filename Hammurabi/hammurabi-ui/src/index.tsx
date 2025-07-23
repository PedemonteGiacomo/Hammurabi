// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from 'react-oidc-context';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Hammurabi_style.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 👇 import your custom theme
const cognitoAuthConfig = {
  authority: window._env_.REACT_APP_COGNITO_AUTHORITY || '',
  client_id: window._env_.REACT_APP_COGNITO_CLIENT_ID || '',
  redirect_uri: window._env_.REACT_APP_COGNITO_REDIRECT_URI || '',
  response_type: 'code',
  scope: window._env_.REACT_APP_COGNITO_SCOPE || '',
};


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const buildVersion = window._env_.BUILD_VERSION;

if (buildVersion === 'mock') {
  // AuthProvider mock: utente sempre autenticato
  const mockAuth = {
    isAuthenticated: true,
    isLoading: false,
    user: {
      profile: {
        email: 'demo@local',
        given_name: 'Demo',
        family_name: 'User',
      },
    },
    signinRedirect: () => Promise.resolve(),
    signoutRedirect: () => Promise.resolve(),
  };
  root.render(
    <ChakraProvider resetCSS={false}>
      <AuthProvider {...mockAuth}>
        <App />
      </AuthProvider>
    </ChakraProvider>
  );
} else {
  root.render(
    <AuthProvider {...cognitoAuthConfig}>
      <ChakraProvider resetCSS={false}>
        <App />
      </ChakraProvider>
    </AuthProvider>
  );
}

reportWebVitals(console.log);

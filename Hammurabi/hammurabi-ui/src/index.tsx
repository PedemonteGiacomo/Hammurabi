// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from 'react-oidc-context';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Hammurabi_style.css';
import App from './App';

// 👇 import your custom theme
import { theme } from './theme';

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

root.render(
  <AuthProvider {...cognitoAuthConfig}>
    <ChakraProvider >
      <App />
    </ChakraProvider>
  </AuthProvider>
);

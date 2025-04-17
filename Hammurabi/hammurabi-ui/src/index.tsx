// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { AuthProvider } from 'react-oidc-context';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Hammurabi_style.css';
import App from './App';
import store from './zustand/store/store';
import { initializeCornerstoneJS } from './cornerstoneSetup';

// Read Cognito settings from environment variables.
const cognitoAuthConfig = {
  authority: window._env_.REACT_APP_COGNITO_AUTHORITY || '',
  client_id: window._env_.REACT_APP_COGNITO_CLIENT_ID || '',
  redirect_uri: window._env_.REACT_APP_COGNITO_REDIRECT_URI || '',
  response_type: 'code',
  scope: window._env_.REACT_APP_COGNITO_SCOPE || '',
};

initializeCornerstoneJS()
  .then(() => {
    const rootElement = document.getElementById('root') as HTMLElement;
    const root = ReactDOM.createRoot(rootElement);
    // console.log('Rendering the app...');
    // display in console the cognitoAuthConfig
    console.log('Cognito Auth Config:', cognitoAuthConfig);

    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <AuthProvider {...cognitoAuthConfig}>
            <App />
          </AuthProvider>
        </Provider>
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error('Failed to initialize CornerstoneJS', error);
  });

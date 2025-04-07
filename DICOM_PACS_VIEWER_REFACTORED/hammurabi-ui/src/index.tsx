// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import the initialization function
import { initializeCornerstoneJS } from './cornerstoneSetup';

// Import Bootstrap and custom styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/Hammurabi_style.css';

import App from './App';

// Wait for CornerstoneJS initialization, then render the app.
initializeCornerstoneJS().then(() => {
  const rootElement = document.getElementById('root') as HTMLElement;
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch((error) => {
  console.error('Failed to initialize CornerstoneJS', error);
});

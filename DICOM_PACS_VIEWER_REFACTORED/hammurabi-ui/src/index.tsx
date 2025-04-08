// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
// Our custom styles:
import './styles/Hammurabi_style.css';
import './index.css';
import App from './App';

// Import the initialization function for Cornerstone, if needed
import { initializeCornerstoneJS } from './cornerstoneSetup';

initializeCornerstoneJS()
  .then(() => {
    const rootElement = document.getElementById('root') as HTMLElement;
    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error('Failed to initialize CornerstoneJS', error);
  });

// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

// Import Bootstrap (if you want the same styling from your original HTML).
import 'bootstrap/dist/css/bootstrap.min.css';

// Import your custom CSS
import './styles/Hammurabi_style.css';

import App from './App';

const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

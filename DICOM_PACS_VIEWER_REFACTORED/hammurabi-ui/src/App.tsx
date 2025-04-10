// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import SelectionPage from './pages/SelectionPage';
import ViewerPage from './pages/ViewerPage';
import AwsSignOut from './pages/AWSsignout';

function App() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.signinRedirect();
    }
  }, [auth]);

  if (auth.isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '100vh' }}
      >
        <div
          className="spinner-border"
          role="status"
          style={{ width: '5rem', height: '5rem' }}
        >
          <span className="visually-hidden">Loading authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectionPage />} />
        <Route path="/viewer" element={<ViewerPage />} />
        <Route path="/aws-signout" element={<AwsSignOut />} />
      </Routes>
    </Router>
  );
}

export default App;

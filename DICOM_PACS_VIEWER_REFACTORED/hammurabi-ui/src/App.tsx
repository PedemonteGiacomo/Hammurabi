// src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import SelectionPage from './pages/SelectionPage';
import ViewerPage from './pages/ViewerPage';

function App() {
  const auth = useAuth();

  useEffect(() => {
    // If not loading and not authenticated, automatically redirect to sign in.
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.signinRedirect();
    }
  }, [auth]);

  if (auth.isLoading) {
    return <div>Loading authentication...</div>;
  }

  // Once authenticated, render the router.
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectionPage />} />
        <Route path="/viewer" element={<ViewerPage />} />
      </Routes>
    </Router>
  );
}

export default App;

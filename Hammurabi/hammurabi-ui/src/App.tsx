// src/App.tsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
// Remove: import { useDispatch } from 'react-redux';
// Remove: import { setUserProfile } from './zustand/store/userSlice';
import SchemaRenderer from "./components/SchemaRenderer";
import AwsSignOut from './pages/AWSsignout';

function App() {
  const auth = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null); // local state if we need user data

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      auth.signinRedirect();
    }
  }, [auth]);

  // When the user information is available, store it in local state
  useEffect(() => {
    if (auth.user) {
      setUserProfile(auth.user.profile);
    }
  }, [auth.user]);

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
        <Route path="/*" element={<SchemaRenderer />} />
        <Route path="/aws-signout" element={<AwsSignOut />} />
      </Routes>
    </Router>
  );
}

export default App;
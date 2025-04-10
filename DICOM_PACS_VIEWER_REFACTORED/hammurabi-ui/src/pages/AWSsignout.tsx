// src/pages/AwsSignOut.tsx
import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

const AwsSignOut: React.FC = () => {
  const auth = useAuth();

  useEffect(() => {
    // Force a new sign-in with prompt=login so the Hosted UI always shows the sign-in form.
    auth.signinRedirect({ extraQueryParams: { prompt: 'login' } });
  }, [auth]);

  return <div style={{ textAlign: 'center', paddingTop: '2rem' }}>Signing out... Redirecting to login page.</div>;
};

export default AwsSignOut;

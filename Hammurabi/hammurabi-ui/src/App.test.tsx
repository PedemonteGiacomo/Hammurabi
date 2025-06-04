// src/App.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from 'react-oidc-context';
import App from './App';

const authConfig = {
  authority: '',
  client_id: '',
  redirect_uri: '',
  response_type: 'code',
  scope: '',
};

// Simple test to ensure the component renders without routing/authentication
test('renders basic UI', () => {
  render(
    <AuthProvider {...authConfig}>
      <App />
    </AuthProvider>
  );

  // Look for any static text in your App component
  // For example, we're looking for "Selection Page" or anything static
  const linkElement = screen.getByText(/Selection Page/i);  // Modify this to match a real text in your App component
  expect(linkElement).toBeInTheDocument();
});

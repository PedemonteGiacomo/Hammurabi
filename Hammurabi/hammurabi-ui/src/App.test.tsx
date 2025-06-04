// src/App.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from 'react-oidc-context';
import { test, expect } from 'vitest';
import App from './App';

const authConfig = {
  authority: '',
  client_id: '',
  redirect_uri: '',
  response_type: 'code',
  scope: '',
};

// Simple test to ensure the component renders without routing/authentication
test('renders without crashing', () => {
  render(
    <AuthProvider {...authConfig}>
      <App />
    </AuthProvider>
  );

  // Basic sanity check
  expect(true).toBe(true);
});

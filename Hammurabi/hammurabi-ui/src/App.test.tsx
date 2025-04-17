// src/App.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock react-oidc-context
jest.mock('react-oidc-context', () => ({
  useAuth: jest.fn(),
}));

test('renders the selection page', () => {
  const mockedAuth = require('react-oidc-context').useAuth;

  // Mocking a scenario where the user is authenticated
  mockedAuth.mockReturnValue({
    isLoading: false,
    isAuthenticated: true,
    user: { profile: { name: 'Test User' } },
    signinRedirect: jest.fn(),
  });

  render(<App />);
  
  // You can adjust this to test for any component that is rendered
  const linkElement = screen.getByText(/selection page/i); // adjust this based on your app content
  expect(linkElement).toBeInTheDocument();
});

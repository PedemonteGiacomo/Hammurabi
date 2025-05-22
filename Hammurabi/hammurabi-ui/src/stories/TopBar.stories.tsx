// src/components/TopBar.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, type AuthContextProps } from 'react-oidc-context';
import type { IdTokenClaims, User } from 'oidc-client-ts';
import TopBar from '../components/TopBar';

const now = Math.floor(Date.now() / 1000);

const mockProfile: IdTokenClaims = {
  sub: 'mock-sub',
  iss: 'https://example.com',
  aud: 'mock-aud',
  exp: now + 3600,
  iat: now,
  email: 'demo@local',
  given_name: 'Demo',
  family_name: 'User',
};

const mockUser: User = {
  profile: mockProfile,
  session_state: 'mock-session',
  access_token: 'mock-access-token',
  id_token: 'mock-id-token',
  token_type: 'Bearer',
  expires_in: 3600,
  scope: 'openid profile email',
  state: '',
  expired: false,
  scopes: ['openid', 'profile', 'email'],
  toStorageString: () =>
    JSON.stringify({
      profile: mockProfile,
      session_state: 'mock-session',
      access_token: 'mock-access-token',
      id_token: 'mock-id-token',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'openid profile email',
      state: '',
    }),
};

const mockAuth: Partial<AuthContextProps> = {
  isAuthenticated: true,
  isLoading: false,
  user: mockUser,
  signinRedirect: () => Promise.resolve(),
  signoutRedirect: () => Promise.resolve(),
};

export default {
  title: 'Components/TopBar',
  component: TopBar,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <AuthProvider {...(mockAuth as AuthContextProps)}>
          <Story />
        </AuthProvider>
      </MemoryRouter>
    ),
  ],
} as Meta<typeof TopBar>;

type Story = StoryObj<typeof TopBar>;
export const Default: Story = {};

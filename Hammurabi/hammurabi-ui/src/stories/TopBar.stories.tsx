/* ------------------------------------------------------------------ */
/*  TopBar.stories.tsx                                                */
/* ------------------------------------------------------------------ */
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextProps } from 'react-oidc-context';
import type { Meta, StoryObj } from '@storybook/react';
import type { IdTokenClaims, User } from 'oidc-client-ts';
import TopBar, { TopBarProps } from '../components/TopBar';

/* ------------- helper per creare un mock User dinamico ------------ */
const makeMockUser = (email: string, given: string, family: string): User => {
  const now = Math.floor(Date.now() / 1000);
  const profile: IdTokenClaims = {
    sub: 'mock-sub',
    iss: 'https://example.com',
    aud: 'mock-aud',
    exp: now + 3600,
    iat: now,
    email,
    given_name: given,
    family_name: family,
  };
  return {
    profile,
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
        profile,
        session_state: 'mock-session',
        access_token: 'mock-access-token',
        id_token: 'mock-id-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'openid profile email',
        state: '',
      }),
  };
};

/* ----------------------- default export --------------------------- */
const meta: Meta<TopBarProps & { email: string; given: string; family: string }> =
  {
    title: 'Components/TopBar',
    component: TopBar,
    decorators: [
      (Story, ctx) => {
        /* ogni volta che cambiano gli arg si rigenera il provider */
        const { email, given, family } = ctx.args;
        const mockAuth: Partial<AuthContextProps> = {
          isAuthenticated: true,
          isLoading: false,
          user: makeMockUser(email, given, family),
          signinRedirect: () => Promise.resolve(),
          signoutRedirect: () => Promise.resolve(),
        };
        return (
          <MemoryRouter>
            <AuthContext.Provider value={mockAuth as AuthContextProps}>
              <Story />
            </AuthContext.Provider>
          </MemoryRouter>
        );
      },
    ],
    argTypes: {
      /* --- Mock utente --- */
      email: { control: 'text', description: 'Email utente mock' },
      given: { control: 'text', description: 'Nome utente mock' },
      family: { control: 'text', description: 'Cognome utente mock' },

      /* --- Prop TopBar --- */
      showLogo: { control: 'boolean' },
      showVersion: { control: 'boolean' },
      userMenuStyle: {
        control: { type: 'radio' },
        options: ['full', 'dropdown', 'icon-only'],
      },
      buildVersionOverride: { control: 'text' },
      logoSrc: { control: 'text' },
      userIconSrc: { control: 'text' },
      logoLinkUrl: { control: 'text' },
      /* onLogout e rightSlot disabilitati nei controls */
      onLogout: { table: { disable: true } },
      rightSlot: { table: { disable: true } },
    },
    parameters: { layout: 'fullscreen' },
  };

export default meta;

/* --------------------------- STORIES ------------------------------ */
type Story = StoryObj<typeof meta>;

export const Interattiva: Story = {
  args: {
    /* --- mock utente --- */
    email: 'demo@local',
    given: 'Demo',
    family: 'User',

    /* --- TopBar args --- */
    showLogo: true,
    showVersion: true,
    userMenuStyle: 'full',
    buildVersionOverride: '1.2.3',
    logoSrc: '/assets/esaote_vector.svg',
    userIconSrc: '/assets/user-circle-svgrepo-com.svg',
    logoLinkUrl: '/',
  },
};

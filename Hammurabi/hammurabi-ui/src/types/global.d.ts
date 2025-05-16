// src/types/global.d.ts (for example)
export { };

declare global {
  interface Window {
    _env_: {
      REACT_APP_COGNITO_AUTHORITY: string;
      REACT_APP_COGNITO_CLIENT_ID: string;
      REACT_APP_COGNITO_REDIRECT_URI: string;
      REACT_APP_COGNITO_SCOPE: string;
      REACT_APP_LOGOUT_URI: string;
      REACT_APP_COGNITO_DOMAIN: string;
    };
  }
}


/// <reference types="react-scripts" />

export {};

interface HammurabiEnv {
  REACT_APP_COGNITO_AUTHORITY: string;
  REACT_APP_COGNITO_CLIENT_ID: string;
  REACT_APP_COGNITO_REDIRECT_URI: string;
  REACT_APP_COGNITO_SCOPE: string;
  REACT_APP_LOGOUT_URI: string;
  REACT_APP_COGNITO_DOMAIN: string;
  BUILD_VERSION?: string;
}

declare global {
  interface Window {
    _env_: HammurabiEnv;
  }
}

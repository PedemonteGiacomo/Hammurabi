// env-config.js.template
// This file is NOT used directly. An entrypoint script will run 'envsubst' on it,
// creating a real /usr/share/nginx/html/env-config.js at container startup.

window._env_ = {
  // Each line references an environment variable that you want to inject at runtime.
  REACT_APP_COGNITO_AUTHORITY: "https://mock-cognito-authority.auth.us-east-1.amazoncognito.com",
  REACT_APP_COGNITO_CLIENT_ID: "mock-client-id",
  REACT_APP_COGNITO_REDIRECT_URI: "http://localhost",
  REACT_APP_COGNITO_SCOPE: "profile openid email",
  REACT_APP_LOGOUT_URI: "http://localhost/aws-signout",
  REACT_APP_COGNITO_DOMAIN: "https://mock-cognito-domain.auth.us-east-1.amazoncognito.com",
  BUILD_VERSION: "mock",
};

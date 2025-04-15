# AWS CDK Deployment Guide

This guide covers three deployment options for the React application.

## Option 1: ReactEcsCdkStack Deployment

### Initial Setup
```bash
cd react-eks-cdk
.venv\Scripts\activate
cdk deploy ReactEcsCdkStack
```

### Prerequisites
- Amazon Cognito with Google Identity Provider
- Google Sign-In configuration

### Post-Deployment Steps

1. **Update Cognito**
    - Add CloudFront domain as callback URI (e.g., `d3sl9bru61enw9.cloudfront.net`)
    - Add sign-out URI (e.g., `d3sl9bru61enw9.cloudfront.net/aws-signout`)

2. **Update Google Console**
    - Add CloudFront domain to authorized redirects

3. **Configure Environment**
    Update `.env`:
    ```env
    REACT_APP_COGNITO_AUTHORITY=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_[POOL_ID]
    REACT_APP_COGNITO_CLIENT_ID=[CLIENT_ID]
    REACT_APP_COGNITO_REDIRECT_URI=https://[CLOUDFRONT_DOMAIN]
    REACT_APP_COGNITO_SCOPE="phone openid email"
    REACT_APP_LOGOUT_URI=https://[CLOUDFRONT_DOMAIN]/aws-signout
    REACT_APP_COGNITO_DOMAIN=https://[DOMAIN].auth.us-east-1.amazoncognito.com
    ```

### Deployment Steps

1. **Build Image**
    ```bash
    cd DICOM_PACS_VIEWER_REFACTORED/hammurabi-ui
    docker build -t hammurabi-ui-prod:latest .
    docker tag hammurabi-ui-prod:latest 544547773663.dkr.ecr.us-east-1.amazonaws.com/hammurabi-ui-prod:latest
    ```

2. **ECR Authentication**
    ```bash
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 544547773663.dkr.ecr.us-east-1.amazonaws.com
    ```

3. **Push and Deploy**
    ```bash
    docker push 544547773663.dkr.ecr.us-east-1.amazonaws.com/hammurabi-ui-prod:latest
    cd react-eks-cdk
    cdk deploy ReactEcsCdkStack
    ```

## Option 2: ReactCdkCompleteStack Deployment

### Prerequisites
Create `google_secrets.json`:
```json
{
  "web": {
     "client_id": "YOUR_CLIENT_ID",
     "project_id": "hammurabi-platform",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_secret": "YOUR_CLIENT_SECRET",
     "redirect_uris": [
        "http://localhost:3000",
        "https://[COGNITO_DOMAIN].auth.us-east-1.amazoncognito.com/oauth2/idpresponse"
     ]
  }
}
```

### Deploy
```bash
cdk deploy ReactCdkCompleteStack --output complete.cdk.out
```

### Post-Deployment
- Add Cognito domain to Google Console redirect URIs
- Test via CloudFront URL
- Update Docker image as needed

## Option 3: Simple Deployment

1. **Deploy**
    ```bash
    cdk deploy
    ```

2. **Configure Google Provider**
    Add redirect URIs from CDK output:
    - CloudFront URL (e.g., `https://dmhdfjolffdah.cloudfront.net`)
    - Cognito Hosted UI (e.g., `https://auth-app-544547773663.auth.us-east-1.amazoncognito.com`)

3. **Configure MFA AWS SNS SMS Sandbox**
    - Navigate to [AWS SNS console](https://us-east-1.console.aws.amazon.com/sns/v3/home?region=us-east-1)
    - Select TEXT MESSAGING from the hamburger menu
    - Add your test phone number to sandbox destinations
    - Follow the [SMS sandbox documentation](https://docs.aws.amazon.com/sns/latest/dg/sns-sms-sandbox.html) for setup
    - Note: Sandbox allows up to 10 test numbers before production approval
# AWS CDK Deployment Guide for React Application - Action to do cdk deploy ReactEcsCdkStack

## Initial Deployment
From the root folder, execute:
```bash
cd .\react-eks-cdk
.venv\Scripts\activate
cdk deploy ReactEcsCdkStack  # Optional: --output ecs.cdk.out
```

## Prerequisites
- Amazon Cognito configured with Google as Identity Provider
- Google Sign-In enabled in the login page

## Post-Deployment Configuration

### 1. Update Cognito Settings
After CDK deployment (ECS + Fargate + CloudFront), configure:
- Add callback redirect URI to the right distribution domain returned by the cdk stack: e.g.: d3sl9bru61enw9.cloudfront.net
- Add sign-out URI: e.g. d3sl9bru61enw9.cloudfront.net/aws-signout

### 2. Update Google API Console
- Add the CloudFront redirect URI to authorized redirects

### 3. Configure Environment Variables
Update `.env` file with your CloudFront and Cognito details:
```env
REACT_APP_COGNITO_AUTHORITY=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_LLk8IEqxB
REACT_APP_COGNITO_CLIENT_ID=6k05u15k2i32hnbajmso8fqoro
REACT_APP_COGNITO_REDIRECT_URI=https://d3sl9bru61enw9.cloudfront.net
REACT_APP_COGNITO_SCOPE="phone openid email"
REACT_APP_LOGOUT_URI=https://d3sl9bru61enw9.cloudfront.net/aws-signout
REACT_APP_COGNITO_DOMAIN=https://us-east-1llk8ieqxb.auth.us-east-1.amazoncognito.com
```

## Rebuild and Deploy Application

### 1. Build Docker Image
```bash
cd .\DICOM_PACS_VIEWER_REFACTORED\hammurabi-ui
docker build -t hammurabi-ui-prod:latest .
docker tag hammurabi-ui-prod:latest 544547773663.dkr.ecr.us-east-1.amazonaws.com/hammurabi-ui-prod:latest
```

### 2. Authenticate with ECR (if needed)
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 544547773663.dkr.ecr.us-east-1.amazonaws.com
```

### 3. Push Image to ECR
```bash
docker push 544547773663.dkr.ecr.us-east-1.amazonaws.com/hammurabi-ui-prod:latest
```

### 4. Redeploy Stack
```bash
cd .\react-eks-cdk
.venv\Scripts\activate
cdk deploy ReactEcsCdkStack
```

This will update the ECS Task Definition and deploy a new version of hammurabi-ui with the latest image.

> Note: The deployment process typically takes a few minutes to complete. You can monitor the progress through the CloudFormation console or CLI output.

# Second Version Setup Guide - Action to do cdk deploy ReactCdkCompleteStack

## Prerequisites

### Google Cloud Platform Configuration
1. Navigate to Google Cloud Platform Console's Credentials section:
    - URL: https://console.cloud.google.com/auth/clients/

2. Download OAuth 2.0 credentials as `google_secrets.json` and place it in the stack deployment directory. Example format:
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
                "http://localhost",
                "https://YOUR_COGNITO_DOMAIN.auth.us-east-1.amazoncognito.com/oauth2/idpresponse"
          ]
     }
}
```

## Deployment

1. Deploy the stack:
```bash
cdk deploy ReactCdkCompleteStack --output complete.cdk.out
```

## Post-Deployment Configuration

### Google Console Setup
- Add Cognito domain (`your-app.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`) to Authorized redirect URIs
- Optionally add CloudFront URL for direct flow

### Testing
1. Access your application via CloudFront URL (e.g., `https://d1234abcd.cloudfront.net`)
2. Use Cognito Hosted UI (optional):
    ```
    https://your-app.auth.us-east-1.amazoncognito.com/login?client_id=YOUR_CLIENT_ID&response_type=code&scope=openid+email+profile&redirect_uri=https://your-cloudfront-domain.net
    ```

### Update Application Image
After environment variable changes, rebuild and push the Docker image with the updated outputs.

```bash
docker build -t hammurabi-ui-prod:latest .
docker tag hammurabi-ui-prod:latest 544547773663.dkr.ecr.us-east-1.amazonaws.com/hammurabi-ui-prod:latest
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 544547773663.dkr.ecr.us-east-1.amazonaws.com
docker push 544547773663.dkr.ecr.us-east-1.amazonaws.com/hammurabi-ui-prod:latest
```

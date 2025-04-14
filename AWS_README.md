# AWS CDK Deployment Guide for React Application

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

# Hammurabi Deployment on AWS EKS with Fargate (Guide for Windows)

This guide provides complete instructions to deploy the Hammurabi project (a cloud-based medical imaging platform) on AWS EKS with Fargate using a Windows environment. It covers everything from setting up the AWS CLI to containerizing your services, pushing images to ECR, and deploying Kubernetes manifests.

---

## Prerequisites

- An active AWS account.
- Administrative rights on your Windows machine.
- Internet connectivity.

---

## 1. Prepare Your Local Windows Environment

### 1.1 Install AWS CLI v2

- **Download & Install:**
  - Download the [AWS CLI MSI installer for Windows](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#windows-install) and run the installer.
  
- **Verify Installation:**
  Open **Command Prompt** or **PowerShell** and run:
  ```powershell
  aws --version
  ```

  Configure Your Credentials: In Command Prompt or PowerShell, run:

  ```powershell
  aws configure
  ```

  When prompted, enter:
  - Access Key ID
  - Secret Access Key
  - Default region (e.g., us-east-1)
  - Output format (e.g., json)

  Where to Find Your Credentials:
  - Log in to AWS Management Console: https://aws.amazon.com/
  - Navigate to IAM and select or create a user with programmatic access.
  - Generate access keys and save securely.

![example_IAM](example_IAM.png)

### 1.2 Install eksctl and kubectl

Using Chocolatey (Recommended): Open an elevated PowerShell and run:
```powershell
choco install eksctl -y
choco install kubernetes-cli -y
```

Manual Installation:
- Download the latest Windows binary for eksctl and kubectl and add them to your PATH.

Verify Installation:
```powershell
eksctl version
kubectl version --client
```

### 1.3 Install Docker Desktop for Windows

- Download Docker Desktop from Docker’s website and install it.
- Ensure Docker is running (uses WSL2).

---

## 2. Create and Configure Your EKS Cluster with Fargate

### 2.1 Create an EKS Cluster with Fargate

```powershell
eksctl create cluster `
  --name hammurabi-cluster `
  --region us-east-1 `
  --fargate
```

### 2.2 Verify Your Cluster

```powershell
kubectl get nodes
kubectl get fargateprofiles
```

![clusters](clusters.png)

---

## 3. Containerize Your Application and Prepare Images

Your project contains Dockerfiles in:
- DICOM_PACS\PACS_SERVER
- DICOM_PACS_VIEWER\backend
- DICOM_PACS_VIEWER\frontend\dicom-viewer

### 3.1 Build Your Docker Images

```powershell
docker build -t my-service:latest .
```

Replace `my-service` with actual names like `dicom-pacs`, `dicom-viewer-backend`, `dicom-viewer-frontend`.

### 3.2 Test Your Images Locally

Use Docker Desktop or Docker Compose to test.

---

## 4. Push Your Images to AWS ECR

### 4.1 Create ECR Repositories

```powershell
aws ecr create-repository --repository-name dicom-pacs
```

Repeat for `dicom-viewer-backend`, `dicom-viewer-frontend`.

### 4.2 Authenticate Docker to ECR

```powershell
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <your_account_id>.dkr.ecr.us-east-1.amazonaws.com
```

### 4.3 Tag and Push Your Images

```powershell
docker tag dicom-pacs:latest <your_account_id>.dkr.ecr.us-east-1.amazonaws.com/dicom-pacs:latest
docker push <your_account_id>.dkr.ecr.us-east-1.amazonaws.com/dicom-pacs:latest
```

### All toghether

```powershell
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 544547773663.dkr.ecr.us-east-1.amazonaws.com
```

--- 

```powershell
aws ecr create-repository --repository-name dicom-pacs
cd .\DICOM_PACS\PACS_SERVER\
docker build -t dicom-pacs:latest .
docker tag dicom-pacs:latest 544547773663.dkr.ecr.us-east-1.amazonaws.com/dicom-pacs:latest
docker push 544547773663.dkr.ecr.us-east-1.amazonaws.com/dicom-pacs:latest
```

---

```powershell
aws ecr create-repository --repository-name dicom-viewer-frontend
cd .\DICOM_PACS_VIEWER\backend\
docker build -t dicom-viewer-backend:latest .
docker tag dicom-viewer-backend:latest 544547773663.dkr.ecr.us-east-1.amazonaws.com/dicom-viewer-backend:latest
docker push 544547773663.dkr.ecr.us-east-1.amazonaws.com/dicom-viewer-backend:latest
```

---

```powershell
aws ecr create-repository --repository-name dicom-viewer-backend
cd .\DICOM_PACS_VIEWER\frontend\dicom-viewer\
docker build -t dicom-viewer-frontend .
docker tag dicom-viewer-frontend:latest 544547773663.dkr.ecr.us-east-1.amazonaws.com/dicom-viewer-frontend:latest
docker push 544547773663.dkr.ecr.us-east-1.amazonaws.com/dicom-viewer-frontend:latest
```

---

## 5. Update Your Kubernetes Manifests

### 5.1 Ensure YAML Files contains appropriate ecr images

```yaml
containers:
  - name: pacs
    image: <your_account_id>.dkr.ecr.us-east-1.amazonaws.com/dicom-pacs:latest
```

Repeat for backend and frontend.

### 5.2 Adjust Service Configurations

Ensure appropriate service types (e.g., `ClusterIP`, `LoadBalancer`).

---

## 6. Deploy Your Application to EKS with Fargate

### 6.1 Apply Your Kubernetes Manifests

```powershell
kubectl apply -f k8s\pacs.yaml
kubectl apply -f k8s\backend.yaml
kubectl apply -f k8s\frontend.yaml
```

### 6.2 Verify the Deployment

```powershell
kubectl get pods -o wide
kubectl get svc
kubectl logs <pod-name>
```

---

## 7. (Optional) Verify Fargate Usage

### 7.1 Create or Adjust Fargate Profiles

```powershell
eksctl create fargateprofile `
  --cluster hammurabi-cluster `
  --name hammurabi-fargate `
  --namespace default `
  --labels role=frontend,role=backend,pacs
```

Ensure pods include matching labels.



---

## 8. Testing and Validation

### Access Your Application

```powershell
kubectl port-forward svc/dicom-frontend-service 8080:80
```

Then open your browser at http://localhost:8080.

### Monitor Resources

```powershell
kubectl top pod
```

Consider using CloudWatch for advanced monitoring.

During the creation of the EKS cluster, you can visualize in the AWS console the state of the CloudFormation stack:

![Cloudformation stack definition](cloud_formation.png)

---

## Final Notes

- **Security & IAM**: Use least privilege for all AWS roles and policies.
- **CI/CD Integration**: Automate via GitHub Actions, AWS CodePipeline, etc.

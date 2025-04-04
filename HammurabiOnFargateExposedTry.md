# Complete Guide to Making Your EKS Fargate Services Externally Accessible

Based on what you've already done (deploying your EKS cluster, creating services with LoadBalancers, and having load balancers with DNS names assigned), here are the remaining steps to make your services fully accessible externally:

## 1. Identify Your Load Balancers and Map Them to Services

You've mentioned three load balancers:
- `a7397cb19ee4c4a389f8304a515ce410-586799244.us-east-1.elb.amazonaws.com`
- `acb6eb7b2c3764fc882f86b59660221d-2091158060.us-east-1.elb.amazonaws.com`
- `a89b8b236422d4cd3977252b3086e9f3-576205863.us-east-1.elb.amazonaws.com`

Let's identify which belongs to which service:

```bash
kubectl get svc dicom-frontend-loadbalancer dicom-backend-loadbalancer pacs-service-loadbalancer
```

Based on the timestamps, let's assume they map as follows (you'll need to confirm this):
- Frontend: `a89b8b236422d4cd3977252b3086e9f3-576205863.us-east-1.elb.amazonaws.com`
- Backend: `acb6eb7b2c3764fc882f86b59660221d-2091158060.us-east-1.elb.amazonaws.com`
- PACS: `a7397cb19ee4c4a389f8304a515ce410-586799244.us-east-1.elb.amazonaws.com`

## 2. Open Security Group Ports

Find your cluster's security group ID:

```bash
aws eks describe-cluster --name hammurabi-cluster --query "cluster.resourcesVpcConfig.clusterSecurityGroupId" --output text
```

Open the required ports (replace `sg-xxxxxxxxx` with your actual security group ID):

```bash
# For frontend (HTTP)
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# For backend API
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 5001 \
    --cidr 0.0.0.0/0

# For backend DICOM C-STORE
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 11119 \
    --cidr 0.0.0.0/0

# For PACS service
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 104 \
    --cidr 0.0.0.0/0
```

## 3. Update Frontend Configuration to Use Backend Load Balancer

Create a ConfigMap to store the backend endpoint:

```bash
cat <<EOF > configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: service-endpoints
data:
  # Use your backend load balancer DNS name
  backend-url: "http://acb6eb7b2c3764fc882f86b59660221d-2091158060.us-east-1.elb.amazonaws.com:5001"
EOF

kubectl apply -f configmap.yaml
```

## 4. Update Your Frontend Deployment

```bash
cat <<EOF > frontend-update.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dicom-frontend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dicom-frontend
  template:
    metadata:
      labels:
        app: dicom-frontend
    spec:
      containers:
      - name: dicom-frontend
        image: 544547773663.dkr.ecr.us-east-1.amazonaws.com/dicom-viewer-frontend:latest
        imagePullPolicy: Always
        env:
        - name: REACT_APP_BACKEND_URL
          valueFrom:
            configMapKeyRef:
              name: service-endpoints
              key: backend-url
        ports:
        - containerPort: 80
EOF

kubectl apply -f frontend-update.yaml
```

## 5. Update Backend Configuration if Needed

You may need to update the backend to use the PACS load balancer instead of the internal service:

```bash
cat <<EOF > backend-update.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: 544547773663.dkr.ecr.us-east-1.amazonaws.com/dicom-viewer-backend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 5001
        - containerPort: 11119
        env:
        - name: PACS_IP
          value: "a7397cb19ee4c4a389f8304a515ce410-586799244.us-east-1.elb.amazonaws.com"
        - name: PACS_PORT
          value: "104"
        - name: PACS_AE_TITLE
          value: "MYPACS"
        - name: CLIENT_AE_TITLE
          value: "TESTSCU2"
        - name: CLIENT_PORT
          value: "11119"
        - name: BACKEND_PORT
          value: "5001"
EOF

kubectl apply -f backend-update.yaml
```

## 6. Restart Your Pods to Apply Changes

```bash
kubectl rollout restart deployment dicom-frontend-deployment
kubectl rollout restart deployment backend-deployment
```

## 7. Verify Your Deployments and Pods

```bash
kubectl get deployments
kubectl get pods
kubectl get svc
```

## 8. Test External Access

1. **Frontend**: Visit `http://a89b8b236422d4cd3977252b3086e9f3-576205863.us-east-1.elb.amazonaws.com` in your browser.

2. **Backend API**: Test with curl or in your browser:
   ```bash
   curl http://acb6eb7b2c3764fc882f86b59660221d-2091158060.us-east-1.elb.amazonaws.com:5001/api/status
   ```

3. **PACS**: Use a DICOM client to test connection to `a7397cb19ee4c4a389f8304a515ce410-586799244.us-east-1.elb.amazonaws.com:104`

## 9. Troubleshooting

If external access still doesn't work:

1. **Check Security Groups**: Verify ports are open
   ```bash
   aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx
   ```

2. **Check Load Balancer Health**:
   ```bash
   aws elb describe-instance-health --load-balancer-name a89b8b236422d4cd3977252b3086e9f3
   ```

3. **Check Pod Logs**:
   ```bash
   kubectl get pods
   kubectl logs [pod-name]
   ```

4. **Check LoadBalancer Services**:
   ```bash
   kubectl describe svc dicom-frontend-loadbalancer
   ```
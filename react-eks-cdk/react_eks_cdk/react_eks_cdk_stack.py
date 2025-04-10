from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_eks as eks,
    aws_iam as iam,
)
from constructs import Construct
from aws_cdk.lambda_layer_kubectl_v32 import KubectlV32Layer


class ReactEksCdkStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)
        
        # Create a VPC with default configuration (spans 2 AZs by default)
        vpc = ec2.Vpc(self, "AppVPC", max_azs=2)
        
        # Create the EKS Cluster on Fargate
        cluster = eks.Cluster(self, "FargateCluster",
            cluster_name="my-react-eks",
            vpc=vpc,
            version=eks.KubernetesVersion.V1_25,
            default_capacity=0,  # No EC2 worker nodes; using Fargate
            kubectl_layer=KubectlV32Layer(self, "KubectlLayer")
        )
        
        # Add IAM user mapping for admin access
        user = iam.User.from_user_arn(self, "MyUser", "arn:aws:iam::544547773663:user/giacomo_pedemonte")
        cluster.aws_auth.add_user_mapping(user, groups=["system:masters"], username="giacomo_pedemonte")
        
        # Define Fargate profiles for the cluster
        # Profile for the default namespace (application pods)
        cluster.add_fargate_profile("AppFargateProfile",
            selectors=[{"namespace": "default"}]
        )
        # Profile for the kube-system namespace (system pods including CoreDNS and ALB controller)
        cluster.add_fargate_profile("SystemFargateProfile",
            selectors=[{"namespace": "kube-system"}]
        )
        
        # Create an IAM OIDC provider for the cluster if it doesn't exist
        if not cluster.open_id_connect_provider:
            cluster.add_iam_open_id_connect_provider()
        
        # Patch CoreDNS deployment to remove node affinity (so it can schedule on Fargate)
        # This manifest adjusts the existing CoreDNS deployment in the kube-system namespace.
        coredns_patch = cluster.add_manifest("CoreDNSAffinityPatch", {
            "apiVersion": "apps/v1",
            "kind": "Deployment",
            "metadata": {
                "name": "coredns",
                "namespace": "kube-system"
            },
            "spec": {
                "template": {
                    "spec": {
                        "affinity": {}  # Remove node affinity restrictions
                    }
                }
            }
        })
        
        # Attach IAM policies to the role assumed by the AWS Load Balancer Controller.
        alb_policy = iam.Policy(self, "ALBControllerPolicy",
            statements=[
                iam.PolicyStatement(
                    actions=[
                        "ec2:CreateTags",
                        "ec2:DeleteTags",
                        "ec2:DescribeAccountAttributes",
                        "ec2:DescribeAddresses",
                        "ec2:DescribeAvailabilityZones",
                        "ec2:DescribeInternetGateways",
                        "ec2:DescribeNetworkInterfaces",
                        "ec2:DescribeSecurityGroups",
                        "ec2:DescribeSubnets",
                        "ec2:DescribeTags",
                        "ec2:DescribeVpcs",
                        "ec2:GetCoipPoolUsage",
                        "elasticloadbalancing:AddListenerCertificates",
                        "elasticloadbalancing:AddTags",
                        "elasticloadbalancing:CreateListener",
                        "elasticloadbalancing:CreateLoadBalancer",
                        "elasticloadbalancing:CreateRule",
                        "elasticloadbalancing:CreateTargetGroup",
                        "elasticloadbalancing:DeleteListener",
                        "elasticloadbalancing:DeleteLoadBalancer",
                        "elasticloadbalancing:DeleteRule",
                        "elasticloadbalancing:DeleteTargetGroup",
                        "elasticloadbalancing:DeregisterTargets",
                        "elasticloadbalancing:DescribeListenerCertificates",
                        "elasticloadbalancing:DescribeListeners",
                        "elasticloadbalancing:DescribeLoadBalancers",
                        "elasticloadbalancing:DescribeLoadBalancerAttributes",
                        "elasticloadbalancing:DescribeRules",
                        "elasticloadbalancing:DescribeSSLPolicies",
                        "elasticloadbalancing:DescribeTags",
                        "elasticloadbalancing:DescribeTargetGroups",
                        "elasticloadbalancing:DescribeTargetGroupAttributes",
                        "elasticloadbalancing:DescribeTargetHealth",
                        "elasticloadbalancing:ModifyListener",
                        "elasticloadbalancing:ModifyLoadBalancerAttributes",
                        "elasticloadbalancing:ModifyRule",
                        "elasticloadbalancing:ModifyTargetGroup",
                        "elasticloadbalancing:ModifyTargetGroupAttributes",
                        "elasticloadbalancing:RegisterTargets",
                        "elasticloadbalancing:RemoveListenerCertificates",
                        "elasticloadbalancing:RemoveTags",
                        "elasticloadbalancing:SetIpAddressType",
                        "elasticloadbalancing:SetSecurityGroups",
                        "elasticloadbalancing:SetSubnets",
                        "elasticloadbalancing:SetWebAcl",
                        "iam:CreateServiceLinkedRole",
                        "cognito-idp:DescribeUserPoolClient"
                    ],
                    resources=["*"]
                )
            ]
        )
        
        # Create a service account for the AWS Load Balancer Controller in kube-system
        alb_sa = cluster.add_service_account("ALBControllerSA",
            name="aws-load-balancer-controller",
            namespace="kube-system"
        )
        alb_policy.attach_to_role(alb_sa.role)
        
        # Deploy the AWS Load Balancer Controller via a Helm chart
        alb_chart = cluster.add_helm_chart(
            "AWSLoadBalancerController",
            namespace="kube-system",
            repository="https://aws.github.io/eks-charts",
            chart="aws-load-balancer-controller",
            release="aws-lb-controller",
            values={
                "clusterName": cluster.cluster_name,
                "region": Stack.of(self).region,
                "vpcId": vpc.vpc_id,
                "enableShield": False,
                "enableWaf": False,
                "enableWafv2": False,
                "serviceAccount": {
                    "create": False,
                    "name": "aws-load-balancer-controller"
                },
                "webhooks": {
                    "enabled": True
                }
            }
        )
        # Ensure the ALB controller Helm chart is deployed after the CoreDNS patch is applied.
        alb_chart.node.add_dependency(coredns_patch)
        
        # Define a label for the React application pods
        app_label = {"app": "react-webapp"}
        
        # Create the Deployment for the React application
        deployment = cluster.add_manifest("ReactAppDeployment", {
            "apiVersion": "apps/v1",
            "kind": "Deployment",
            "metadata": {"name": "react-web-app", "namespace": "default"},
            "spec": {
                "replicas": 2,
                "selector": {"matchLabels": app_label},
                "template": {
                    "metadata": {"labels": app_label},
                    "spec": {
                        "containers": [{
                            "name": "web",
                            "image": "544547773663.dkr.ecr.us-east-1.amazonaws.com/hammurabi-ui-prod:latest",
                            "ports": [{"containerPort": 80}],
                            "env": [
                                {"name": "REACT_APP_COGNITO_USER_POOL_ID", "value": "us-east-1_LLk8IEqxB"},
                                {"name": "REACT_APP_COGNITO_CLIENT_ID", "value": "6k05u15k2i32hnbajmso8fqoro"},
                                {"name": "REACT_APP_COGNITO_REGION", "value": "us-east-1"},
                                {"name": "REACT_APP_COGNITO_REDIRECT_URI", "value": "http://localhost"},
                                {"name": "REACT_APP_COGNITO_SCOPE", "value": "phone openid email"},
                                {"name": "REACT_APP_LOGOUT_URI", "value": "http://localhost/aws-signout"},
                                {"name": "REACT_APP_COGNITO_DOMAIN", "value": "https://us-east-1llk8ieqxb.auth.us-east-1.amazoncognito.com"}
                            ]
                        }]
                    }
                }
            }
        })
        
        # Create the Service for the React application
        service = cluster.add_manifest("ReactAppService", {
            "apiVersion": "v1",
            "kind": "Service",
            "metadata": {"name": "react-web-service", "namespace": "default"},
            "spec": {
                "selector": app_label,
                "ports": [{"port": 80, "targetPort": 80}],
                "type": "ClusterIP"
            }
        })
        
        # Create the Ingress to expose the service via ALB
        ingress = cluster.add_manifest("ReactAppIngress", {
            "apiVersion": "networking.k8s.io/v1",
            "kind": "Ingress",
            "metadata": {
                "name": "react-web-ingress",
                "namespace": "default",
                "annotations": {
                    "kubernetes.io/ingress.class": "alb",
                    "alb.ingress.kubernetes.io/scheme": "internet-facing",
                    "alb.ingress.kubernetes.io/target-type": "ip",
                    "alb.ingress.kubernetes.io/group.name": "react-app-ingress",
                    "alb.ingress.kubernetes.io/listen-ports": '[{"HTTP": 80}]',
                    "alb.ingress.kubernetes.io/subnets": "subnet-05d3a49846a032c04,subnet-0c3eefb3b1709f525",
                    "alb.ingress.kubernetes.io/tags": "Environment=prod",
                    "alb.ingress.kubernetes.io/load-balancer-attributes": "idle_timeout.timeout_seconds=60"
                }
            },
            "spec": {
                "rules": [{
                    "http": {
                        "paths": [{
                            "path": "/",
                            "pathType": "Prefix",
                            "backend": {
                                "service": {
                                    "name": "react-web-service",
                                    "port": {"number": 80}
                                }
                            }
                        }]
                    }
                }]
            }
        })
        # Ensure that the Ingress is created after the ALB Controller is available.
        ingress.node.add_dependency(alb_chart)

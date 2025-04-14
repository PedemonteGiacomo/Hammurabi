from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_ecr as ecr,
    aws_iam as iam,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    Duration,
    CfnOutput,
)
from constructs import Construct
import time
#from aws_cdk.aws_cloudfront import CfnInvalidation

class ReactEcsCdkStack(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)
        
        # Create a VPC spanning 2 AZs.
        vpc = ec2.Vpc(self, "ReactEcsVpc", max_azs=2)
        
        # Create an ECS Cluster in the VPC.
        cluster = ecs.Cluster(self, "ReactEcsCluster", vpc=vpc)
        
        # Import the existing ECR repository by name.
        repository = ecr.Repository.from_repository_name(
            self, "HammurabiRepo", "hammurabi-ui-prod"
        )
        
        # Create a Fargate service using an Application Load Balanced construct.
        service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "ReactFargateService",
            cluster=cluster,
            cpu=256,                # 256 CPU units per task.
            desired_count=2,        # Deploy 2 tasks.
            memory_limit_mib=512,   # Each task gets 512 MiB memory.
            min_healthy_percent=100,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_ecr_repository(repository, tag="latest"),
                container_port=80,
                environment={
                    "REACT_APP_COGNITO_USER_POOL_ID": "us-east-1_LLk8IEqxB",
                    "REACT_APP_COGNITO_CLIENT_ID": "6k05u15k2i32hnbajmso8fqoro",
                    "REACT_APP_COGNITO_REGION": "us-east-1",
                    # Use HTTP here because the ALB is internal to CloudFront; CloudFront will serve HTTPS externally.
                    "REACT_APP_COGNITO_REDIRECT_URI": "https://depx7mmslfz65.cloudfront.net",
                    "REACT_APP_COGNITO_SCOPE": "phone openid email",
                    "REACT_APP_LOGOUT_URI": "https://depx7mmslfz65.cloudfront.net/aws-signout",
                    "REACT_APP_COGNITO_DOMAIN": "https://us-east-1llk8ieqxb.auth.us-east-1.amazoncognito.com",
                    # Dummy variable to force redeployment - you might use a timestamp or git commit hash.
                    "BUILD_TIMESTAMP": str(int(time.time()))
                }
            ),
            public_load_balancer=True  # ALB will be internet-facing.
        )
        
        # Attach the necessary ECR permissions to the task execution role.
        service.task_definition.add_to_execution_role_policy(
            iam.PolicyStatement(
                actions=[
                    "ecr:GetAuthorizationToken",
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:GetDownloadUrlForLayer"
                ],
                resources=["*"]
            )
        )
        
        # (Optional) Configure the target group's health check.
        service.target_group.configure_health_check(
            path="/",
            interval=Duration.seconds(60),
        )
        
        # Create a CloudFront distribution using the ALB as the origin.
        distribution = cloudfront.Distribution(
            self, "ReactAppDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.LoadBalancerV2Origin(service.load_balancer,
                        protocol_policy=cloudfront.OriginProtocolPolicy.HTTP_ONLY),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            )
        )

        ## Create a CloudFront invalidation to clear the cache.
        ## This is useful for forcing CloudFront to fetch the latest version of your app.
        ## You can also use this to invalidate specific paths if needed.
        ## Note: This will incur additional costs.
        ## Can be also done directly in the AWS console: e.g.: https://us-east-1.console.aws.amazon.com/cloudfront/v4/home?region=us-east-1#/distributions/E1M4T6FUCY8V94/invalidations/
        # CfnInvalidation(self, "DistributionInvalidation",
        #     distribution_id=distribution.distribution_id,
        #     invalidation_batch={
        #         "Paths": {
        #             "Quantity": 1,
        #             "Items": ["/*"]
        #         },
        #         "CallerReference": f"invalidation-{int(time.time())}"
        #     }
        # )
        
        # Output the CloudFront domain name. Use this for your HTTPS endpoints.
        CfnOutput(self, "DistributionDomain", value=distribution.domain_name)
        CfnOutput(self, "ALBServiceURL", value=f"http://{service.load_balancer.load_balancer_dns_name}")

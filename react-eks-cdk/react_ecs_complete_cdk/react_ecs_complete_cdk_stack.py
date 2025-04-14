import os
import json
import time
from aws_cdk import (
    Stack,
    aws_ec2 as ec2,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_ecr as ecr,
    aws_iam as iam,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    aws_cognito as cognito,
    aws_secretsmanager as secretsmanager,
    SecretValue,
    CfnOutput,
    Duration,
    RemovalPolicy
)
from constructs import Construct

class ReactCdkCompleteStack(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)
        
        # ------------------------------------------------------------
        #  (A) Read Google OAuth config from a local JSON file
        # ------------------------------------------------------------
        google_json_path = os.path.join(os.path.dirname(__file__), "google_secrets.json")
        with open(google_json_path, "r") as f:
            google_config = json.load(f)

        google_client_id = google_config["web"]["client_id"]
        google_client_secret_str = google_config["web"]["client_secret"]

        # ------------------------------------------------------------
        #  (B) Create/Update a Secret in AWS Secrets Manager for the Google client secret
        # ------------------------------------------------------------
        google_oauth_secret = secretsmanager.Secret(
            self, "GoogleOAuthClientSecretV2",  # changed the logical ID
            secret_name="GoogleOAuthClientSecretV2",  # changed the actual name to avoid collisions
            removal_policy=RemovalPolicy.DESTROY,     
            secret_string_value=SecretValue.unsafe_plain_text(google_client_secret_str)
        )
        
        # ------------------------------------------------------------
        #  (C) Create a VPC + ECS Fargate service
        # ------------------------------------------------------------
        vpc = ec2.Vpc(self, "ReactEcsVpc2", max_azs=2)  # changed logical ID
        cluster = ecs.Cluster(self, "ReactEcsCluster2", vpc=vpc)  # changed logical ID
        
        # Reference your existing ECR repo with the React app
        repository = ecr.Repository.from_repository_name(
            self, "HammurabiRepo2",  # changed logical ID
            "hammurabi-ui-prod"
        )
        
        service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "ReactFargateService2",  # changed logical ID
            cluster=cluster,
            cpu=256,
            desired_count=2,
            memory_limit_mib=512,
            min_healthy_percent=100,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_ecr_repository(repository, tag="latest"),
                container_port=80,
                environment={
                    # We will patch these placeholders once Cognito is created
                    "REACT_APP_COGNITO_USER_POOL_ID": "PLACEHOLDER",
                    "REACT_APP_COGNITO_CLIENT_ID": "PLACEHOLDER",
                    "REACT_APP_COGNITO_REGION": self.region,
                    "REACT_APP_COGNITO_REDIRECT_URI": "PLACEHOLDER",
                    "REACT_APP_COGNITO_SCOPE": "phone openid email",
                    "REACT_APP_LOGOUT_URI": "PLACEHOLDER",
                    "REACT_APP_COGNITO_DOMAIN": "PLACEHOLDER",
                    "BUILD_TIMESTAMP": str(int(time.time()))
                }
            ),
            public_load_balancer=True
        )
        
        # Allow pulling from ECR
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

        # ------------------------------------------------------------
        #  (D) Create a CloudFront distribution in front of the ALB
        # ------------------------------------------------------------
        distribution = cloudfront.Distribution(
            self, "ReactAppDistribution2",  # changed logical ID
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.LoadBalancerV2Origin(
                    service.load_balancer,
                    protocol_policy=cloudfront.OriginProtocolPolicy.HTTP_ONLY
                ),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            )
        )
        cf_domain_name = distribution.domain_name

        # ------------------------------------------------------------
        #  (E) Cognito User Pool + Domain
        # ------------------------------------------------------------
        user_pool = cognito.UserPool(self, "UserPool2",  # changed logical ID
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(email=True),
            removal_policy=RemovalPolicy.DESTROY
        )
        
        #  *** CHOOSE A NEW / UNIQUE domain prefix ***
        #  If "myapp-auth" was used previously, pick "myapp-auth2" or something else.
        domain_prefix = "myapp-auth2"  
        user_pool.add_domain("UserPoolDomain2",
            cognito_domain=cognito.CognitoDomainOptions(domain_prefix=domain_prefix)
        )
        cognito_domain_url = f"https://{domain_prefix}.auth.{self.region}.amazoncognito.com"

        # ------------------------------------------------------------
        #  (F) Google Identity Provider in Cognito
        # ------------------------------------------------------------
        google_idp = cognito.UserPoolIdentityProviderGoogle(
            self, "GoogleIdP2",  # changed logical ID
            user_pool=user_pool,
            client_id=google_client_id,
            client_secret_value=google_oauth_secret.secret_value,
            scopes=["openid", "email", "profile"],
            attribute_mapping=cognito.AttributeMapping(
                email=cognito.ProviderAttribute.GOOGLE_EMAIL,
                given_name=cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
                family_name=cognito.ProviderAttribute.GOOGLE_FAMILY_NAME,
            )
        )

        # ------------------------------------------------------------
        #  (G) User Pool Client referencing Google IdP
        # ------------------------------------------------------------
        redirect_uri = f"https://{cf_domain_name}"
        logout_uri   = f"https://{cf_domain_name}/aws-signout"
        
        user_pool_client = user_pool.add_client("UserPoolClient2",  # changed logical ID
            supported_identity_providers=[cognito.UserPoolClientIdentityProvider.GOOGLE],
            o_auth=cognito.OAuthSettings(
                flows=cognito.OAuthFlows(authorization_code_grant=True, implicit_code_grant=True),
                scopes=[cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL, cognito.OAuthScope.PROFILE],
                callback_urls=[redirect_uri, "http://localhost:3000", "http://localhost"],
                logout_urls=[logout_uri, "http://localhost:3000", "http://localhost"]
            ),
            prevent_user_existence_errors=True
        )
        user_pool_client.node.add_dependency(google_idp)

        # ------------------------------------------------------------
        #  (H) Patch ECS environment with final Cognito details
        # ------------------------------------------------------------
        container_def = service.task_definition.default_container
        if container_def:
            container_def.add_environment("REACT_APP_COGNITO_USER_POOL_ID", user_pool.user_pool_id)
            container_def.add_environment("REACT_APP_COGNITO_CLIENT_ID", user_pool_client.user_pool_client_id)
            container_def.add_environment("REACT_APP_COGNITO_REGION", self.region)
            container_def.add_environment("REACT_APP_COGNITO_REDIRECT_URI", redirect_uri)
            container_def.add_environment("REACT_APP_COGNITO_SCOPE", "profile openid email")
            container_def.add_environment("REACT_APP_LOGOUT_URI", logout_uri)
            container_def.add_environment("REACT_APP_COGNITO_DOMAIN", cognito_domain_url)
            container_def.add_environment("REACT_APP_COGNITO_AUTHORITY", f"https://cognito-idp.{self.region}.amazonaws.com/{user_pool.user_pool_id}")

        # ------------------------------------------------------------
        #  (I) Outputs
        # ------------------------------------------------------------
        CfnOutput(self, "CloudFrontURL2", value=f"https://{cf_domain_name}",
                  description="Main app endpoint via CloudFront (v2).")
        CfnOutput(self, "CognitoHostedUIDomain2", value=cognito_domain_url,
                  description="Cognito Hosted UI domain (append '/oauth2/idpresponse' for IDP callback).")
        CfnOutput(self, "UserPoolID2", value=user_pool.user_pool_id)
        CfnOutput(self, "UserPoolClientID2", value=user_pool_client.user_pool_client_id)
        CfnOutput(self, "GoogleClientID2", value=google_client_id)
        CfnOutput(self, "LoadBalancerDNS2", value=service.load_balancer.load_balancer_dns_name)
        CfnOutput(self, "ServiceTaskDefinitionArn2", value=service.task_definition.task_definition_arn)

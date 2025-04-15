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
    aws_wafv2 as wafv2,
    custom_resources as cr,
    SecretValue,
    CfnOutput,
    RemovalPolicy
)
from constructs import Construct

class ReactCdkCompleteStack(Stack):
    def __init__(self, scope: Construct, id: str, **kwargs):
        super().__init__(scope, id, **kwargs)

        # ------------------------------------------------------------
        # (A) Read Google OAuth config from a local JSON file.
        #     The file "google_secrets.json" must contain your Google credentials.
        # ------------------------------------------------------------
        google_json_path = os.path.join(os.path.dirname(__file__), "google_secrets.json")
        with open(google_json_path, "r") as f:
            google_config = json.load(f)

        google_client_id = google_config["web"]["client_id"]
        google_client_secret_str = google_config["web"]["client_secret"]

        # ------------------------------------------------------------
        # (B) Create/Update a Secret in AWS Secrets Manager for the Google client secret.
        # ------------------------------------------------------------
        google_oauth_secret = secretsmanager.Secret(
            self, "GoogleOAuthClientSecretV2",
            secret_name="GoogleOAuthClientSecretV2",
            removal_policy=RemovalPolicy.DESTROY,
            secret_string_value=SecretValue.unsafe_plain_text(google_client_secret_str)
        )

        # ------------------------------------------------------------
        # (C) Create a VPC and an ECS Fargate Service with an ALB.
        #     The ALB is public so CloudFront can reach it,
        #     but its security group allows ingress only from known CloudFront IP ranges.
        # ------------------------------------------------------------
        vpc = ec2.Vpc(self, "ReactEcsVpc2", max_azs=2)
        cluster = ecs.Cluster(self, "ReactEcsCluster2", vpc=vpc)

        # Reference the existing ECR repository for your React app.
        repository = ecr.Repository.from_repository_name(
            self, "HammurabiRepo2",
            "hammurabi-ui-prod"
        )

        # Create a security group for the ALB that permits ingress only from CloudFront IP ranges.
        alb_sg = ec2.SecurityGroup(
            self, "ALBSecurityGroup",
            vpc=vpc,
            description="ALB SG: Allow only CloudFront traffic",
            allow_all_outbound=True
        )
        cf_ip_ranges = [
            "13.32.0.0/15",
            "52.46.0.0/18",
            "13.54.63.128/26",
            "52.222.128.0/17",
        ]
        for cidr in cf_ip_ranges:
            alb_sg.add_ingress_rule(ec2.Peer.ipv4(cidr), ec2.Port.tcp(80),
                                    f"Allow HTTP from CloudFront {cidr}")
            alb_sg.add_ingress_rule(ec2.Peer.ipv4(cidr), ec2.Port.tcp(443),
                                    f"Allow HTTPS from CloudFront {cidr}")

        # Create the ApplicationLoadBalancedFargateService.
        # (Only the BUILD_TIMESTAMP is initially injected; the Cognito values will be patched later.)
        service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "ReactFargateService2",
            cluster=cluster,
            cpu=256,
            desired_count=2,
            memory_limit_mib=512,
            min_healthy_percent=100,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_ecr_repository(repository, tag="latest"),
                container_port=80,
                environment={
                    "BUILD_TIMESTAMP": str(int(time.time()))
                }
            ),
            public_load_balancer=True  # CloudFront will reach this ALB.
        )
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
        # Attach the custom ALB security group.
        service.load_balancer.add_security_group(alb_sg)

        # ------------------------------------------------------------
        # (D) Create a CloudFront Distribution in front of the ALB with WAF protection.
        # ------------------------------------------------------------
        waf_acl = wafv2.CfnWebACL(
            self, "ReactWAFWebACL",
            scope="CLOUDFRONT",  # When used with CloudFront, the stack must be in us-east-1.
            default_action=wafv2.CfnWebACL.DefaultActionProperty(allow={}),
            visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                cloud_watch_metrics_enabled=True,
                metric_name="CloudFrontWebACL",
                sampled_requests_enabled=True
            ),
            description="WebACL protecting CloudFront for the React app",
            rules=[
                wafv2.CfnWebACL.RuleProperty(
                    name="ManagedCommonRuleSet",
                    priority=0,
                    override_action=wafv2.CfnWebACL.OverrideActionProperty(none={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        managed_rule_group_statement=wafv2.CfnWebACL.ManagedRuleGroupStatementProperty(
                            vendor_name="AWS",
                            name="AWSManagedRulesCommonRuleSet"
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="CommonRuleSet",
                        sampled_requests_enabled=True
                    )
                ),
                wafv2.CfnWebACL.RuleProperty(
                    name="ManagedIPReputationList",
                    priority=1,
                    override_action=wafv2.CfnWebACL.OverrideActionProperty(none={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        managed_rule_group_statement=wafv2.CfnWebACL.ManagedRuleGroupStatementProperty(
                            vendor_name="AWS",
                            name="AWSManagedRulesAmazonIpReputationList"
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="IPReputationList",
                        sampled_requests_enabled=True
                    )
                )
            ]
        )
        distribution = cloudfront.Distribution(
            self, "ReactAppDistribution2",
            default_behavior=cloudfront.BehaviorOptions(
                origin=origins.LoadBalancerV2Origin(
                    service.load_balancer,
                    protocol_policy=cloudfront.OriginProtocolPolicy.HTTP_ONLY
                ),
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            ),
            web_acl_id=waf_acl.attr_arn  # Attach the WAF ACL to CloudFront.
        )
        cf_domain_name = distribution.domain_name

        # ------------------------------------------------------------
        # (E) Create a Cognito User Pool for both managed (email/phone) and federated sign‑in.
        #     Enforce MFA (SMS and TOTP) and require the attributes: email, given_name, and family_name.
        # ------------------------------------------------------------
        user_pool = cognito.UserPool(
            self, "UserPool2",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(email=True, phone=True),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True),
                given_name=cognito.StandardAttribute(required=True),
                family_name=cognito.StandardAttribute(required=True)
            ),
            auto_verify=cognito.AutoVerifiedAttrs(email=True, phone=True),
            mfa=cognito.Mfa.REQUIRED,
            mfa_second_factor=cognito.MfaSecondFactor(sms=True, otp=True),
            enable_sms_role=True,
            removal_policy=RemovalPolicy.DESTROY,
        )
        # Set a unique domain prefix for the Cognito Hosted UI.
        domain_prefix = "myapp-auth2"
        user_pool.add_domain("UserPoolDomain2",
            cognito_domain=cognito.CognitoDomainOptions(domain_prefix=domain_prefix)
        )
        cognito_domain_url = f"https://{domain_prefix}.auth.{self.region}.amazoncognito.com"

        # ------------------------------------------------------------
        # (F) Attach Google as an Identity Provider to the User Pool.
        # ------------------------------------------------------------
        google_idp = cognito.UserPoolIdentityProviderGoogle(
            self, "GoogleIdP2",
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
        # (G) Create a single Cognito User Pool Client that supports both
        #     managed username/password authentication and federated sign‑in via the Hosted UI.
        #     (Set generate_secret=False so that no client secret is generated.)
        #     Importantly, use the same redirect and logout URIs that your frontend app registers.
        # ------------------------------------------------------------
        redirect_uri = f"https://{cf_domain_name}"
        logout_uri   = f"https://{cf_domain_name}/aws-signout"
        user_pool_client = user_pool.add_client(
            "UserPoolClient",
            auth_flows=cognito.AuthFlow(
                admin_user_password=True,
                user_password=True,
                user_srp=True,
                custom=True
            ),
            o_auth=cognito.OAuthSettings(
                flows=cognito.OAuthFlows(authorization_code_grant=True),
                # Set the callback URLs (redirect URIs) that the frontend app expects.
                callback_urls=[redirect_uri, "http://localhost:3000", "http://localhost"],
                logout_urls=[logout_uri, "http://localhost:3000/aws-signout", "http://localhost/aws-signout"]
            ),
            supported_identity_providers=[cognito.UserPoolClientIdentityProvider.GOOGLE],
            prevent_user_existence_errors=True,
            generate_secret=False
        )
        # (Now both direct and federated sign‑in will be handled by the same client.)

        # ------------------------------------------------------------
        # (H) Update the ECS container environment with final Cognito details.
        #     For managed (email/phone) authentication in your app, we use the single client above.
        # ------------------------------------------------------------
        container_def = service.task_definition.default_container
        if container_def:
            container_def.add_environment("REACT_APP_COGNITO_USER_POOL_ID", user_pool.user_pool_id)
            container_def.add_environment("REACT_APP_COGNITO_CLIENT_ID", user_pool_client.user_pool_client_id)
            container_def.add_environment("REACT_APP_COGNITO_REGION", self.region)
            container_def.add_environment("REACT_APP_COGNITO_REDIRECT_URI", redirect_uri)
            container_def.add_environment("REACT_APP_COGNITO_SCOPE", "phone openid email")
            container_def.add_environment("REACT_APP_LOGOUT_URI", logout_uri)
            container_def.add_environment("REACT_APP_COGNITO_DOMAIN", cognito_domain_url)
            container_def.add_environment("REACT_APP_COGNITO_AUTHORITY", f"https://cognito-idp.{self.region}.amazonaws.com/{user_pool.user_pool_id}")

        # ------------------------------------------------------------
        # (I) Outputs for easy reference.
        # ------------------------------------------------------------
        CfnOutput(self, "CloudFrontURL2", value=f"https://{cf_domain_name}",
                 description="Main app endpoint via CloudFront (v2).")
        CfnOutput(self, "UserPoolID2", value=user_pool.user_pool_id)
        CfnOutput(self, "UserPoolClientID2", value=user_pool_client.user_pool_client_id)
        CfnOutput(self, "GoogleClientID2", value=google_client_id)
        CfnOutput(self, "LoadBalancerDNS2", value=service.load_balancer.load_balancer_dns_name)
        CfnOutput(self, "ServiceTaskDefinitionArn2", value=service.task_definition.task_definition_arn)

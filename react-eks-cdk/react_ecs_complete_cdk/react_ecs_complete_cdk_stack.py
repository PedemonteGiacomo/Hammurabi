import os
import json
import time
import uuid
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
    aws_elasticloadbalancingv2 as elbv2,
    custom_resources as cr,
    SecretValue,
    CfnOutput,
    RemovalPolicy,
    Duration,
    Fn
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
        #  (B) Create Secret in AWS Secrets Manager for the Google client secret
        # ------------------------------------------------------------
        google_oauth_secret = secretsmanager.Secret(
            self, "GoogleOAuthClientSecret",
            secret_name="GoogleOAuthClientSecret",
            removal_policy=RemovalPolicy.DESTROY,
            secret_string_value=SecretValue.unsafe_plain_text(google_client_secret_str)
        )
        
        # ------------------------------------------------------------
        #  (C) Create CloudFront-ALB Secret header in AWS Secrets Manager
        # ------------------------------------------------------------
        cf_alb_secret_value = f"CF-Secret-{uuid.uuid4()}"
        cf_header_secret = secretsmanager.Secret(
            self, "CloudFrontALBSecret",
            secret_name="CloudFrontALBSecret",
            removal_policy=RemovalPolicy.DESTROY,
            secret_string_value=SecretValue.unsafe_plain_text(cf_alb_secret_value)
        )
        get_secret_cr = cr.AwsCustomResource(
            self, "GetSecretValue",
            on_create=cr.AwsSdkCall(
                service="SecretsManager",
                action="getSecretValue",
                parameters={"SecretId": cf_header_secret.secret_name},
                physical_resource_id=cr.PhysicalResourceId.of("SecretValueFetch")
            ),
            policy=cr.AwsCustomResourcePolicy.from_statements([
                iam.PolicyStatement(
                    actions=["secretsmanager:GetSecretValue"],
                    resources=[cf_header_secret.secret_arn]
                )
            ])
        )
        secret_header_value = get_secret_cr.get_response_field("SecretString")
        
        # ------------------------------------------------------------
        #  (D) Set up VPC, ECS Fargate service with ALB
        # ------------------------------------------------------------
        vpc = ec2.Vpc(self, "ReactEcsVpc", max_azs=2)
        cluster = ecs.Cluster(self, "ReactEcsCluster", vpc=vpc)
        repository = ecr.Repository.from_repository_name(
            self, "HammurabiRepo", "hammurabi-ui-prod"
        )
        alb_sg = ec2.SecurityGroup(
            self, "ALBSecurityGroup",
            vpc=vpc,
            description="Security group for ALB, allowing traffic only from authorized sources",
            allow_all_outbound=True
        )
        alb_sg.add_ingress_rule(ec2.Peer.any_ipv4(), ec2.Port.tcp(80), "Allow HTTP from anywhere")
        alb_sg.add_ingress_rule(ec2.Peer.any_ipv4(), ec2.Port.tcp(443), "Allow HTTPS from anywhere")
        service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "ReactFargateService",
            cluster=cluster,
            cpu=256,
            desired_count=2,
            memory_limit_mib=512,
            min_healthy_percent=100,
            task_image_options=ecs_patterns.ApplicationLoadBalancedTaskImageOptions(
                image=ecs.ContainerImage.from_ecr_repository(repository, tag="latest"),
                container_port=80,
                environment={
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
        service.load_balancer.add_security_group(alb_sg)
        service.task_definition.add_to_execution_role_policy(
            iam.PolicyStatement(
                actions=[
                    "ecr:GetAuthorizationToken",
                    "ecr:BatchCheckLayerAvailability",
                    "ecr:GetDownloadUrlForLayer",
                    "ecr:BatchGetImage"
                ],
                resources=["*"]
            )
        )
        
        # ------------------------------------------------------------
        #  (E) Setup WAF for ALB
        # ------------------------------------------------------------
        alb_waf = wafv2.CfnWebACL(
            self, "ALBWebACL",
            scope="REGIONAL",
            default_action=wafv2.CfnWebACL.DefaultActionProperty(allow={}),
            visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                cloud_watch_metrics_enabled=True,
                metric_name="ALBWebACL",
                sampled_requests_enabled=True
            ),
            description="WebACL protecting ALB from unauthorized access",
            rules=[
                wafv2.CfnWebACL.RuleProperty(
                    name="RequireCloudFrontHeader",
                    priority=0,
                    action=wafv2.CfnWebACL.RuleActionProperty(block={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        not_statement=wafv2.CfnWebACL.NotStatementProperty(
                            statement=wafv2.CfnWebACL.StatementProperty(
                                byte_match_statement=wafv2.CfnWebACL.ByteMatchStatementProperty(
                                    field_to_match=wafv2.CfnWebACL.FieldToMatchProperty(single_header={"Name": "X-CloudFront-Auth"}),
                                    positional_constraint="EXACTLY",
                                    search_string=cf_alb_secret_value,
                                    text_transformations=[wafv2.CfnWebACL.TextTransformationProperty(priority=0, type="NONE")]
                                )
                            )
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="RequireCloudFrontHeader",
                        sampled_requests_enabled=True
                    )
                ),
                wafv2.CfnWebACL.RuleProperty(
                    name="AWSManagedCommonRule",
                    priority=1,
                    override_action=wafv2.CfnWebACL.OverrideActionProperty(none={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        managed_rule_group_statement=wafv2.CfnWebACL.ManagedRuleGroupStatementProperty(
                            vendor_name="AWS", name="AWSManagedRulesCommonRuleSet"
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="AWSManagedCommonRule",
                        sampled_requests_enabled=True
                    )
                ),
                wafv2.CfnWebACL.RuleProperty(
                    name="RateLimit",
                    priority=2,
                    action=wafv2.CfnWebACL.RuleActionProperty(block={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        rate_based_statement=wafv2.CfnWebACL.RateBasedStatementProperty(
                            limit=1000, aggregate_key_type="IP"
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="RateLimit",
                        sampled_requests_enabled=True
                    )
                )
            ]
        )
        wafv2.CfnWebACLAssociation(
            self, "ALBWAFAssociation",
            resource_arn=service.load_balancer.load_balancer_arn,
            web_acl_arn=alb_waf.attr_arn
        )
        
        # ------------------------------------------------------------
        #  (G) Create CloudFront distribution with WAF
        # ------------------------------------------------------------
        cf_waf = wafv2.CfnWebACL(
            self, "CloudFrontWAF",
            scope="CLOUDFRONT",
            default_action=wafv2.CfnWebACL.DefaultActionProperty(allow={}),
            visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                cloud_watch_metrics_enabled=True,
                metric_name="CloudFrontWAF",
                sampled_requests_enabled=True
            ),
            description="WAF for CloudFront distribution",
            rules=[
                wafv2.CfnWebACL.RuleProperty(
                    name="ManagedCommonRuleSet",
                    priority=0,
                    override_action=wafv2.CfnWebACL.OverrideActionProperty(none={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        managed_rule_group_statement=wafv2.CfnWebACL.ManagedRuleGroupStatementProperty(
                            vendor_name="AWS", name="AWSManagedRulesCommonRuleSet"
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
                            vendor_name="AWS", name="AWSManagedRulesAmazonIpReputationList"
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="IPReputationList",
                        sampled_requests_enabled=True
                    )
                ),
                wafv2.CfnWebACL.RuleProperty(
                    name="CloudFrontRateLimit",
                    priority=2,
                    action=wafv2.CfnWebACL.RuleActionProperty(block={}),
                    statement=wafv2.CfnWebACL.StatementProperty(
                        rate_based_statement=wafv2.CfnWebACL.RateBasedStatementProperty(
                            limit=2000, aggregate_key_type="IP"
                        )
                    ),
                    visibility_config=wafv2.CfnWebACL.VisibilityConfigProperty(
                        cloud_watch_metrics_enabled=True,
                        metric_name="CloudFrontRateLimit",
                        sampled_requests_enabled=True
                    )
                )
            ]
        )
        
        alb_origin = origins.LoadBalancerV2Origin(
            service.load_balancer,
            protocol_policy=cloudfront.OriginProtocolPolicy.HTTP_ONLY,
            custom_headers={"X-CloudFront-Auth": cf_alb_secret_value}
        )
        distribution = cloudfront.Distribution(
            self, "ReactAppDistribution",
            default_behavior=cloudfront.BehaviorOptions(
                origin=alb_origin,
                viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                allowed_methods=cloudfront.AllowedMethods.ALLOW_ALL,
                cache_policy=cloudfront.CachePolicy.CACHING_DISABLED
            ),
            web_acl_id=cf_waf.attr_arn
        )
        
        # ------------------------------------------------------------
        #  (H) Create Cognito User Pool with Optional SMS-Based MFA
        # ------------------------------------------------------------
        # Define the external ID; here we use the AWS account number.
        external_id = self.account

        # Create the IAM role for Cognito to send SMS via SNS.
        sms_role = iam.Role(
            self, "CognitoSMSRole",
            assumed_by=iam.ServicePrincipal("cognito-idp.amazonaws.com", 
                conditions={"StringEquals": {"sts:ExternalId": external_id}}
            ),
            inline_policies={
                "AllowSnsPublish": iam.PolicyDocument(statements=[
                    iam.PolicyStatement(
                        actions=["sns:Publish"],
                        resources=["*"]
                    )
                ])
            }
        )
        
        # Create the Cognito User Pool using the high-level construct.
        user_pool = cognito.UserPool(
            self, "UserPool",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(email=True),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True, mutable=True),
                given_name=cognito.StandardAttribute(required=True, mutable=True),
                family_name=cognito.StandardAttribute(required=True, mutable=True)
            ),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_lowercase=True,
                require_uppercase=True,
                require_digits=True,
                require_symbols=True
            ),
            account_recovery=cognito.AccountRecovery.EMAIL_ONLY,
            mfa=cognito.Mfa.REQUIRED,
            mfa_second_factor=cognito.MfaSecondFactor(
                sms=True,
                otp=True
            ),
            sms_role=sms_role,
            sms_role_external_id=external_id,
            removal_policy=RemovalPolicy.DESTROY
        )
        
        # Override the low-level CloudFormation properties to enforce MFA configuration.
        cfn_user_pool = user_pool.node.default_child
        cfn_user_pool.add_property_override("MfaConfiguration", "ON")
        cfn_user_pool.add_property_override("EnabledMfas", ["SMS_MFA", "SOFTWARE_TOKEN_MFA"])
        cfn_user_pool.add_property_override("SmsConfiguration", {
            "ExternalId": external_id,
            "SnsCallerArn": sms_role.role_arn
        })
        
        # Choose a domain prefix for the Cognito Hosted UI.
        domain_prefix = f"auth-app-{self.account}"
        user_pool.add_domain("UserPoolDomain",
            cognito_domain=cognito.CognitoDomainOptions(domain_prefix=domain_prefix)
        )
        cognito_domain_url = f"https://{domain_prefix}.auth.{self.region}.amazoncognito.com"
        
        # ------------------------------------------------------------
        #  (I) Google Identity Provider in Cognito
        # ------------------------------------------------------------
        google_idp = cognito.UserPoolIdentityProviderGoogle(
            self, "GoogleIdP",
            user_pool=user_pool,
            client_id=google_client_id,
            client_secret_value=google_oauth_secret.secret_value,
            scopes=["openid", "email", "profile"],
            attribute_mapping=cognito.AttributeMapping(
                email=cognito.ProviderAttribute.GOOGLE_EMAIL,
                given_name=cognito.ProviderAttribute.GOOGLE_GIVEN_NAME,
                family_name=cognito.ProviderAttribute.GOOGLE_FAMILY_NAME
            )
        )
        
        # ------------------------------------------------------------
        #  (J) Single unified User Pool Client for both login methods
        # ------------------------------------------------------------
        redirect_uri = f"https://{distribution.domain_name}"
        logout_uri = f"https://{distribution.domain_name}/aws-signout"
        
        user_pool_client = user_pool.add_client(
            "UnifiedUserPoolClient",
            supported_identity_providers=[
                cognito.UserPoolClientIdentityProvider.GOOGLE,
                cognito.UserPoolClientIdentityProvider.COGNITO
            ],
            o_auth=cognito.OAuthSettings(
                flows=cognito.OAuthFlows(authorization_code_grant=True),
                scopes=[
                    cognito.OAuthScope.OPENID,
                    cognito.OAuthScope.EMAIL,
                    cognito.OAuthScope.PROFILE
                ],
                callback_urls=[redirect_uri, "http://localhost:3000", "http://localhost"],
                logout_urls=[logout_uri, "http://localhost:3000/aws-signout", "http://localhost/aws-signout"]
            ),
            prevent_user_existence_errors=True,
            auth_flows=cognito.AuthFlow(
                user_password=True,
                user_srp=True,
                admin_user_password=True
            )
        )
        user_pool_client.node.add_dependency(google_idp)
        
        # ------------------------------------------------------------
        #  (K) Update ECS container environment with Cognito details
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
            container_def.add_environment("REACT_APP_COGNITO_AUTHORITY", 
                f"https://cognito-idp.{self.region}.amazonaws.com/{user_pool.user_pool_id}"
            )
        
        # ------------------------------------------------------------
        #  (L) Outputs
        # ------------------------------------------------------------
        CfnOutput(self, "CloudFrontURL", value=f"https://{distribution.domain_name}",
                 description="CloudFront distribution domain")
        CfnOutput(self, "CognitoHostedUIDomain", value=cognito_domain_url,
                 description="Cognito Hosted UI domain")
        CfnOutput(self, "UserPoolID", value=user_pool.user_pool_id)
        CfnOutput(self, "UserPoolClientID", value=user_pool_client.user_pool_client_id)
        CfnOutput(self, "GoogleClientID", value=google_client_id)
        CfnOutput(self, "LoadBalancerDNS", value=service.load_balancer.load_balancer_dns_name)
        CfnOutput(self, "CloudFrontSecretHeader", value="X-CloudFront-Auth",
                 description="Secret header name used for CloudFront authentication")
        CfnOutput(self, "CloudFrontSecretValue", value="[Stored in AWS Secrets Manager]",
                 description="Value stored in AWS Secrets Manager with name: CloudFrontALBSecret")

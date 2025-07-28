from aws_cdk import Stack, RemovalPolicy, CfnOutput
from constructs import Construct
from aws_cdk import aws_cognito as cognito

class AuthStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        self.user_pool = cognito.UserPool(self, "PacsUserPool",
            user_pool_name="PacsUserPool",
            self_sign_up_enabled=False,
            sign_in_aliases=cognito.SignInAliases(username=True, email=True),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True, mutable=False)
            ),
            removal_policy=RemovalPolicy.DESTROY
        )

        self.user_pool_client = self.user_pool.add_client("PacsClient",
            generate_secret=True,
            auth_flows=cognito.AuthFlow(user_password=True),
            o_auth=cognito.OAuthSettings(
                flows=cognito.OAuthFlows(
                    authorization_code_grant=True
                ),
                scopes=[cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID],
                callback_urls=["http://localhost:3000"],
                logout_urls=["http://localhost:3000"]
            )
        )

        
        self.user_pool_domain = cognito.UserPoolDomain(
            self, "UserPoolDomain",
            user_pool=self.user_pool,
            cognito_domain=cognito.CognitoDomainOptions(
                domain_prefix="pacs-auth-dev"
            )
        )

        # Output utili
        CfnOutput(self, "UserPoolId", value=self.user_pool.user_pool_id)
        CfnOutput(self, "UserPoolClientId", value=self.user_pool_client.user_pool_client_id)

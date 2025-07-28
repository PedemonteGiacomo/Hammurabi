from aws_cdk import Stack, CfnOutput
from aws_cdk import aws_apigateway as apigateway
from aws_cdk import aws_cognito as cognito
from aws_cdk import aws_lambda as _lambda
from constructs import Construct
import os

class ApiStack(Stack):

    def __init__(self, scope: Construct, construct_id: str,
                 user_pool: cognito.UserPool,
                 user_pool_client: cognito.UserPoolClient,
                 **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # Lambda backend
        lambda_fn = _lambda.Function(
            self, "PacsBackendHandler",
            runtime=_lambda.Runtime.PYTHON_3_11,
            handler="app.handler",
            code=_lambda.Code.from_asset("../"),
            environment={
                "REGION": os.getenv("REGION", "us-east-1"),
                "USERPOOL_ID": user_pool.user_pool_id,
                "CLIENT_ID": user_pool_client.user_pool_client_id
            },
            memory_size=512,
            timeout=30
        )

        # Cognito Authorizer
        authorizer = apigateway.CognitoUserPoolsAuthorizer(
            self, "CognitoAuthorizer",
            cognito_user_pools=[user_pool]
        )

        # API Gateway
        api = apigateway.RestApi(
            self, "PacsApi",
            rest_api_name="PACS ZeroTrust API",
            description="API protetta da Cognito per PACS"
        )

        # /studies endpoint
        studies = api.root.add_resource("studies")
        studies.add_method(
            "GET",
            apigateway.LambdaIntegration(lambda_fn),
            authorization_type=apigateway.AuthorizationType.COGNITO,
            authorizer=authorizer,
            method_responses=[
                {"statusCode": "200"},
                {"statusCode": "401"},
                {"statusCode": "403"}
            ]
        )

        CfnOutput(self, "ApiUrl", value=api.url)

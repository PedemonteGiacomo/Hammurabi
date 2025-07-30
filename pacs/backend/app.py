
#!/usr/bin/env python3
import aws_cdk as cdk
from aws_cdk import Environment
from stacks.auth_stack import AuthStack
from stacks.api_stack import ApiStack
from stacks.infra_pacs_stack import InfraPacsStack
from stacks.vpc_stack import VpcStack



app = cdk.App()
env_us_east_1 = Environment(region="us-east-1")

auth_stack = AuthStack(app, "AuthStack", env=env_us_east_1)
vpc_stack = VpcStack(app, "VpcStack", env=env_us_east_1)
infra_stack = InfraPacsStack(app, "InfraPacsStack", env=env_us_east_1)

api_stack = ApiStack(app, "ApiStack",
    vpc=vpc_stack.vpc,
    dicom_bucket=infra_stack.bucket,
    dicom_table=infra_stack.table,
    dicom_policy=infra_stack.dicom_access_policy,
    cognito_client_id=auth_stack.user_pool_client.user_pool_client_id,
    jwt_issuer=f"https://cognito-idp.{env_us_east_1.region}.amazonaws.com/{auth_stack.user_pool.user_pool_id}",
    env=env_us_east_1
)

app.synth()


#!/usr/bin/env python3
import aws_cdk as cdk
from stacks.auth_stack import AuthStack
from stacks.api_stack import ApiStack
from stacks.infra_pacs_stack import InfraPacsStack
from stacks.vpc_stack import VpcStack

app = cdk.App()

auth_stack = AuthStack(app, "AuthStack")
vpc_stack = VpcStack(app, "VpcStack")
infra_stack = InfraPacsStack(app, "InfraPacsStack")

api_stack = ApiStack(app, "ApiStack",
    vpc=vpc_stack.vpc,
    dicom_bucket=infra_stack.bucket,
    dicom_table=infra_stack.table,
    dicom_policy=infra_stack.dicom_access_policy,
)

app.synth()

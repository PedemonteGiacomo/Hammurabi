#!/usr/bin/env python3
import aws_cdk as cdk
from infra_pacs_stack import InfraPacsStack

app = cdk.App()
InfraPacsStack(app, "InfraPacsStack",
    env=cdk.Environment(
        region="us-east-1",
        account=cdk.Aws.ACCOUNT_ID
    )
)
app.synth()

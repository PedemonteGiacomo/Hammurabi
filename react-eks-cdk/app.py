#!/usr/bin/env python3
import os

import aws_cdk as cdk

from react_eks_cdk.react_eks_cdk_stack import ReactEksCdkStack
from react_ecs_cdk.react_ecs_cdk_stack import ReactEcsCdkStack

app = cdk.App()

#ReactEksCdkStack(app, "ReactEksCdkStack",env=cdk.Environment(account='544547773663', region='us-east-1'))

ReactEcsCdkStack(app, "ReactEcsCdkStack",env=cdk.Environment(account='544547773663', region='us-east-1'))

app.synth()

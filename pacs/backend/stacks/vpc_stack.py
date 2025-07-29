from aws_cdk import Stack, aws_ec2 as ec2
from constructs import Construct

class VpcStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)
        self.vpc = ec2.Vpc(self, "PacsVpc", max_azs=2)

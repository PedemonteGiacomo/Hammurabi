from aws_cdk import (
    Stack,
    aws_s3 as s3,
    aws_dynamodb as dynamodb,
    aws_iam as iam,
    RemovalPolicy,
)
from constructs import Construct

class InfraPacsStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # Bucket S3 per file DICOM
        self.bucket = s3.Bucket(
            self, "DicomBucket",
            bucket_name=f"pacs-dicom-dev-{self.account}-{self.region}",
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            versioned=True,
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
        )

        # DynamoDB per indicizzazione DICOM
        self.table = dynamodb.Table(
            self, "DicomIndexTable",
            table_name="dicom-index",
            partition_key=dynamodb.Attribute(name="study_id", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="image_id", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
        )

        # Policy di accesso comune (es. per Fargate task role)
        self.dicom_access_policy = iam.ManagedPolicy(
            self, "DicomAccessPolicy",
            statements=[
                iam.PolicyStatement(
                    actions=["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
                    resources=[
                        self.bucket.bucket_arn,
                        f"{self.bucket.bucket_arn}/*",
                    ]
                ),
                iam.PolicyStatement(
                    actions=["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query", "dynamodb:Scan"],
                    resources=[self.table.table_arn]
                )
            ]
        )

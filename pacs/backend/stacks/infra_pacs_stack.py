from aws_cdk import (
    Stack,
    aws_s3 as s3,
    aws_dynamodb as dynamodb,
    aws_iam as iam,
    RemovalPolicy,
)
from constructs import Construct
import os

class InfraPacsStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # Bucket S3 per file DICOM
        # self.bucket = s3.Bucket(
        #     self, "DicomBucket",
        #     bucket_name=f"pacs-dicom-dev-{self.account}-{self.region}",
        #     removal_policy=RemovalPolicy.DESTROY,
        #     auto_delete_objects=True,
        #     versioned=True,
        #     block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
        # )
        self.bucket = s3.Bucket.from_bucket_name(self, "ImportedBucket", os.getenv("S3_BUCKET_NAME","pacs-dicom-dev-544547773663-us-east-1"))

        # DynamoDB per indicizzazione DICOM
        # self.table = dynamodb.Table(
        #     self, "DicomIndexTable",
        #     table_name="dicom-index",
        #     partition_key=dynamodb.Attribute(name="study_id", type=dynamodb.AttributeType.STRING),
        #     sort_key=dynamodb.Attribute(name="image_id", type=dynamodb.AttributeType.STRING),
        #     billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
        #     removal_policy=RemovalPolicy.DESTROY,
        # )
        self.table = dynamodb.Table.from_table_name(self, "ImportedTable", "dicom-index")

        # Policy di accesso comune (es. per Fargate task role)
        bucket_arn = f"arn:aws:s3:::{os.getenv('S3_BUCKET_NAME')}"
        bucket_objects_arn = f"{bucket_arn}/*"
        table_arn = "arn:aws:dynamodb:us-east-1:544547773663:table/dicom-index"

        self.dicom_access_policy = iam.ManagedPolicy(
            self, "DicomAccessPolicy",
            statements=[
                iam.PolicyStatement(
                    actions=["s3:GetObject", "s3:PutObject", "s3:ListBucket"],
                    resources=[
                        bucket_arn,
                        bucket_objects_arn,
                    ]
                ),
                iam.PolicyStatement(
                    actions=["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:Query", "dynamodb:Scan"],
                    resources=[table_arn]
                )
            ]
        )

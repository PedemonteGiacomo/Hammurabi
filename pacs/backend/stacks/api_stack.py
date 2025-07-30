from aws_cdk import (
    Stack,
    aws_ecs as ecs,
    aws_ecr as ecr,
    aws_ecs_patterns as ecs_patterns,
    aws_logs as logs,
)
from constructs import Construct

class ApiStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, vpc, dicom_bucket, dicom_table, dicom_policy, cognito_client_id, jwt_issuer, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # ECS Cluster
        cluster = ecs.Cluster(self, "ApiCluster", vpc=vpc)

        # Task Definition
        task_definition = ecs.FargateTaskDefinition(self, "ApiTaskDef")
        task_definition.task_role.add_managed_policy(dicom_policy)

        # Container Definition con immagine ECR e environment
        pacs_repo = ecr.Repository.from_repository_name(
            self, "PacsRepo", "pacs-repo"
        )
        img = ecs.ContainerImage.from_ecr_repository(
            pacs_repo,
            tag="latest"
        )
        container = task_definition.add_container(
            "ApiContainer",
            image=img,
            logging=ecs.LogDriver.aws_logs(
                stream_prefix="Api",
                log_retention=logs.RetentionDays.ONE_WEEK
            ),
            environment={
                "S3_BUCKET_NAME": dicom_bucket.bucket_name,
                "DYNAMO_TABLE_NAME": dicom_table.table_name,
                "REGION": self.region,
                "COGNITO_CLIENT_ID": cognito_client_id,
                "JWT_ISSUER": jwt_issuer
            }
        )
        container.add_port_mappings(
            ecs.PortMapping(container_port=8000)
        )

        # Fargate + Load Balancer SOLO con task_definition
        service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "ApiFargateService",
            cluster=cluster,
            task_definition=task_definition,
            public_load_balancer=True,
            desired_count=1,
        )

        # Configura health check sulla porta 8000
        service.target_group.configure_health_check(
            port="8000"
        )

        # Output: URL pubblico del servizio
        self.api_url = service.load_balancer.load_balancer_dns_name

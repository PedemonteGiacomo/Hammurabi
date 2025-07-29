from aws_cdk import (
    Stack,
    aws_ecs as ecs,
    aws_ecs_patterns as ecs_patterns,
    aws_logs as logs,
    aws_iam as iam,
)
from constructs import Construct

class ApiStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, vpc, dicom_bucket, dicom_table, dicom_policy, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # ECS Cluster
        cluster = ecs.Cluster(self, "ApiCluster", vpc=vpc)

        # Task Definition
        task_definition = ecs.FargateTaskDefinition(self, "ApiTaskDef")
        task_definition.task_role.add_managed_policy(dicom_policy)

        # Container Definition
        container = task_definition.add_container(
            "ApiContainer",
            image=ecs.ContainerImage.from_asset("."),
            logging=ecs.LogDriver.aws_logs(
                stream_prefix="Api",
                log_retention=logs.RetentionDays.ONE_WEEK
            )
        )
        container.add_port_mappings(
            ecs.PortMapping(container_port=8000)
        )

        # Fargate + Load Balancer
        service = ecs_patterns.ApplicationLoadBalancedFargateService(
            self, "ApiFargateService",
            cluster=cluster,
            task_definition=task_definition,
            public_load_balancer=True,
            desired_count=1,
        )

        # Output: URL pubblico del servizio
        self.api_url = service.load_balancer.load_balancer_dns_name

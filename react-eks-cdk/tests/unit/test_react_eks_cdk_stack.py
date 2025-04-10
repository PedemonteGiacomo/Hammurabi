import aws_cdk as core
import aws_cdk.assertions as assertions

from react_eks_cdk.react_eks_cdk_stack import ReactEksCdkStack

# example tests. To run these tests, uncomment this file along with the example
# resource in react_eks_cdk/react_eks_cdk_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = ReactEksCdkStack(app, "react-eks-cdk")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })

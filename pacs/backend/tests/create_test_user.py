import boto3

client = boto3.client("cognito-idp", region_name="us-east-1")

response = client.admin_create_user(
    UserPoolId="us-east-1_3dj0VCrYn",
    Username="testuser",
    TemporaryPassword="UnaPasswordTemp123!",
    UserAttributes=[
        {"Name": "email", "Value": "testuser@example.com"},
        {"Name": "email_verified", "Value": "true"}
    ],
    MessageAction="SUPPRESS"
)

print("Utente creato con password temporanea: UnaPasswordTemp123!")
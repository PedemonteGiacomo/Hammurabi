import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import boto3
import requests
from mangum import Mangum


load_dotenv()

app = FastAPI()

REGION = os.getenv("AWS_REGION")
USERPOOL_ID = os.getenv("COGNITO_USERPOOL_ID")
CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
JWKS_URL = f"https://cognito-idp.{REGION}.amazonaws.com/{USERPOOL_ID}/.well-known/jwks.json"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

jwks = requests.get(JWKS_URL).json()
public_keys = {key["kid"]: key for key in jwks["keys"]}

def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        unverified_header = jwt.get_unverified_header(token)
        key = public_keys.get(unverified_header["kid"])
        if key is None:
            raise HTTPException(status_code=403, detail="Invalid token")
        payload = jwt.decode(token, key, algorithms=["RS256"], audience=CLIENT_ID)
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@app.get("/protected")
def protected_route(user: dict = Depends(verify_token)):
    return {"message": f"Access granted to {user['email']}"}

@app.get("/public")
def public_route():
    return {"message": "This is open"}

handler = Mangum(app)
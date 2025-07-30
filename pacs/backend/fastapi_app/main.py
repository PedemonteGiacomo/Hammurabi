# backend/fastapi_app/main.py

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, jwk, JWTError
import boto3
import os
from dotenv import load_dotenv
import requests


# Carica le variabili da .env
load_dotenv()

# === CONFIG ===
USERPOOL_ID = os.getenv("COGNITO_USERPOOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
COGNITO_REGION = os.getenv("AWS_REGION")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
JWT_ISSUER = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{USERPOOL_ID}"
JWKS_URL = f"{JWT_ISSUER}/.well-known/jwks.json"


app = FastAPI()
security = HTTPBearer()
_jwks = None

# === AWS CLIENT ===
s3_client = boto3.client("s3")

# === FUNZIONE DI LOAD JWT ===
def get_jwks():
    global _jwks
    if _jwks is None:
        resp = requests.get(JWKS_URL)
        resp.raise_for_status()
        _jwks = resp.json()["keys"]
    return _jwks

# === FUNZIONE DI VERIFICA JWT ===
def verify_jwt(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        jwks = get_jwks()
        unverified_header = jwt.get_unverified_header(token)

        key_data = next((k for k in jwks if k["kid"] == unverified_header["kid"]), None)
        if not key_data:
            raise HTTPException(status_code=401, detail="Chiave JWT non trovata")

        # 🔐 Costruisce la chiave RSA dalla JWK
        public_key = jwk.construct(key_data, algorithm="RS256")

        # Decodifica e verifica il token
        payload = jwt.decode(
            token,
            key=public_key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID,
            issuer=JWT_ISSUER
        )
        return payload

    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"Token non valido: {str(e)}")



# === ENDPOINT PROTETTO ===
@app.get("/studies")
def get_study(study_id: str, payload=Depends(verify_jwt)):
    # Simula il nome dell’oggetto DICOM nello S3
    object_key = f"studies/{study_id}.dcm"

    try:
        # Genera un URL firmato valido 10 minuti
        presigned_url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': object_key},
            ExpiresIn=600  # 10 minuti
        )
        return {"url": presigned_url}
    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"Studio non trovato: {str(e)}"
        )

# backend/fastapi_app/main.py

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from jose import jwt, jwk, JWTError
import boto3
import os
from dotenv import load_dotenv
import requests
from boto3.dynamodb.conditions import Key





# Carica le variabili da .env
load_dotenv()

# === CONFIG ===
USERPOOL_ID = os.getenv("COGNITO_USERPOOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
REGION = os.getenv("AWS_REGION")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
JWT_ISSUER = f"https://cognito-idp.{REGION}.amazonaws.com/{USERPOOL_ID}"
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

# === HEALTH CHECK ===
@app.get("/")
def root():
    return {"status": "ok"}


# === ENDPOINT: Presigned URL per tutte le immagini di una series ===
@app.get("/studies/{study_id}/{substudy_id}/series/{series_id}/images", dependencies=[Depends(verify_jwt)])
def get_series_images(
    study_id: str,
    substudy_id: str,
    series_id: str
):
    """
    Ritorna i presigned url di tutti i file DICOM per una series specifica.
    study_id: es. D55-01
    substudy_id: es. 40
    series_id: es. AiCE_BODY-SHARP_40_152622.890
    """
    import botocore
    prefix = f"liver1/phantomx_abdomen_pelvis_dataset/{study_id}/{substudy_id}/{series_id}/"
    try:
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, Prefix=prefix)
        contents = response.get("Contents", [])
        images = []
        for obj in contents:
            key = obj["Key"]
            if key.endswith(".dcm"):
                file_name = key.split("/")[-1]
                url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': S3_BUCKET_NAME, 'Key': key},
                    ExpiresIn=600
                )
                images.append({"file": file_name, "url": url})
        if not images:
            raise HTTPException(status_code=404, detail="No DICOM images found for this series.")
        return {
            "study_id": f"{study_id}/{substudy_id}",
            "series_id": series_id,
            "images": images
        }
    except botocore.exceptions.ClientError as e:
        raise HTTPException(status_code=500, detail=f"S3 error: {str(e)}")

# === ENDPOINT: Presigned URL per una singola immagine DICOM ===
from fastapi import Path
@app.get("/studies/{study_id}/{substudy_id}/series/{series_id}/images/{image_id}", dependencies=[Depends(verify_jwt)])
def get_single_image(
    study_id: str = Path(..., description="Study ID, es. D55-01"),
    substudy_id: str = Path(..., description="Substudy ID, es. 40"),
    series_id: str = Path(..., description="Series ID, es. AiCE_BODY-SHARP_40_152622.890"),
    image_id: str = Path(..., description="Image file name, es. IM-0014-0001.dcm")
):
    """
    Ritorna il presigned url per una singola immagine DICOM.
    """
    import botocore
    key = f"liver1/phantomx_abdomen_pelvis_dataset/{study_id}/{substudy_id}/{series_id}/{image_id}"
    try:
        s3_client.head_object(Bucket=S3_BUCKET_NAME, Key=key)
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': key},
            ExpiresIn=600
        )
        return {
            "study_id": f"{study_id}/{substudy_id}",
            "series_id": series_id,
            "image_id": image_id,
            "url": url
        }
    except botocore.exceptions.ClientError as e:
        if e.response['Error']['Code'] == '404':
            raise HTTPException(status_code=404, detail="Image not found.")
        raise HTTPException(status_code=500, detail=f"S3 error: {str(e)}")

# === ENDPOINT PER METADATA ===
# Imposta la regione per DynamoDB
dynamodb = boto3.resource("dynamodb", region_name=REGION)
table = dynamodb.Table("dicom-index")

@app.get("/metadata")
def get_metadata(series_id: str = Query(..., description="Series ID")):
    response = table.get_item(Key={"series_id": series_id})
    item = response.get("Item")
    if not item:
        return JSONResponse(status_code=404, content={"detail": "Metadata not found"})
    
    return item
import os
import boto3
import pydicom
from uuid import uuid4
from pathlib import Path
from botocore.exceptions import ClientError, ParamValidationError

# === CONFIG ===
BUCKET_NAME = "pacs-dicom-dev-544547773663-us-east-1"
TABLE_NAME = "dicom-index"
ROOT_PATH = Path(__file__).resolve().parent / "dicom-data"
MAX_FILES = None  # None means no limit, otherwise set to an integer

# === AWS CLIENTS ===
try:
    s3 = boto3.client("s3", region_name="us-east-1")
    dynamo = boto3.resource("dynamodb", region_name="us-east-1").Table(TABLE_NAME)

    # Validazione nome bucket
    s3.head_bucket(Bucket=BUCKET_NAME)
except (ClientError, ParamValidationError) as e:
    print(f"\n❌ ERRORE: bucket name '{BUCKET_NAME}' not valid or not existing.")
    print("➡️  Check CDK name on AWS Console.")
    exit(1)

# === FUNZIONE DI UPLOAD ===
def upload_dicom(file_path: Path):
    try:
        dcm = pydicom.dcmread(file_path, force=True)

        study_id = str(dcm.get("StudyInstanceUID", uuid4()))
        image_id = str(dcm.get("SOPInstanceUID", uuid4()))
        patient_id = str(dcm.get("PatientID", "unknown"))
        series_id = str(dcm.get("SeriesInstanceUID", "unknown"))
        modality = str(dcm.get("Modality", ""))
        body_part = str(dcm.get("BodyPartExamined", ""))

        relative_path = file_path.relative_to(ROOT_PATH)
        s3_key = str(relative_path).replace("\\", "/")  # Win compat

        s3.upload_file(str(file_path), BUCKET_NAME, s3_key)

        dynamo.put_item(Item={
            "study_id": study_id,
            "image_id": image_id,
            "s3_path": s3_key,
            "patient_id": patient_id,
            "series_id": series_id,
            "modality": modality,
            "body_part": body_part,
        })

        print(f"✔ {s3_key}")
        return True

    except (pydicom.errors.InvalidDicomError, FileNotFoundError) as e:
        print(f"✖ [DICOM ERROR] {file_path.name}: {e}")
    except (ClientError, ParamValidationError) as e:
        print(f"✖ [S3/Dynamo ERROR] {file_path.name}: {e}")
    except Exception as e:
        print(f"✖ [GENERIC ERROR] {file_path.name}: {e}")
    return False

# === MAIN ===
def scan_and_upload():
    dcm_files = list(ROOT_PATH.rglob("*.dcm"))
    if not dcm_files:
        print("⚠️ DICOM files not found.")
        return

    if MAX_FILES:
        dcm_files = dcm_files[:MAX_FILES]

    print(f"🔍 Found {len(dcm_files)} file. Starting upload...\n")
    success, fail = 0, 0

    for f in dcm_files:
        if upload_dicom(f):
            success += 1
        else:
            fail += 1

    print(f"\n✅ Completed: {success} succesful, {fail} failed.")

if __name__ == "__main__":
    scan_and_upload()

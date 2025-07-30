import os
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import boto3
import botocore
import pydicom
from uuid import uuid4

# === CONFIG ===
BUCKET_NAME = "pacs-dicom-dev-544547773663-us-east-1"
TABLE_NAME = "dicom-index"
ROOT_PATH = Path(__file__).resolve().parent / "dicom-data"
MAX_FILES = None  # None = no limit
USE_DYNAMO = True  # Set False to skip DynamoDB

# === AWS CLIENTS ===
s3 = boto3.client("s3", region_name="us-east-1")
dynamo = boto3.resource("dynamodb", region_name="us-east-1").Table(TABLE_NAME) if USE_DYNAMO else None

# === FUNZIONE DI UPLOAD PARALLELO ===
def process_file(file_path: Path):
    try:
        relative_path = file_path.relative_to(ROOT_PATH)
        s3_key = str(relative_path).replace("\\", "/")

        # Upload S3
        s3.upload_file(str(file_path), BUCKET_NAME, s3_key)

        # DynamoDB insert (opzionale)
        if USE_DYNAMO:
            dcm = pydicom.dcmread(file_path, force=True)
            item = {
                "study_id": str(dcm.get("StudyInstanceUID", uuid4())),
                "image_id": str(dcm.get("SOPInstanceUID", uuid4())),
                "s3_path": s3_key,
                "patient_id": str(dcm.get("PatientID", "unknown")),
                "series_id": str(dcm.get("SeriesInstanceUID", "unknown")),
                "modality": str(dcm.get("Modality", "")),
                "body_part": str(dcm.get("BodyPartExamined", "")),
            }
            dynamo.put_item(Item=item)

        return (s3_key, True, None)

    except Exception as e:
        return (str(file_path), False, str(e))


def main():
    dcm_files = list(ROOT_PATH.rglob("*.dcm"))
    if not dcm_files:
        print("⚠️  Nessun file DICOM trovato.")
        return

    if MAX_FILES:
        dcm_files = dcm_files[:MAX_FILES]

    print(f"🚀 Inizio upload di {len(dcm_files)} file...\n")

    success, fail = 0, 0
    with ThreadPoolExecutor(max_workers=16) as executor:
        future_to_file = {executor.submit(process_file, f): f for f in dcm_files}
        for future in as_completed(future_to_file):
            s3_key, ok, error = future.result()
            if ok:
                print(f"✔ {s3_key}")
                success += 1
            else:
                print(f"✖ {s3_key} — {error}")
                fail += 1

    print(f"\n✅ Completato: {success} successi, {fail} errori.")

if __name__ == "__main__":
    main()

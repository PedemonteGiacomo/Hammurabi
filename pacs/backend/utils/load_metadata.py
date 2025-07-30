import csv
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('dicom-index')  # Cambia con il nome giusto

def load_csv_to_dynamo(csv_path):
    with open(csv_path, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            series_desc = row["SeriesDescription"]
            phantom = row["PhantomName"]

            # Assumiamo che tu abbia già una mappa phantom+desc → series_id
            series_id = map_series(phantom, series_desc)
            if not series_id:
                print(f"SKIP: {phantom} / {series_desc} not matched")
                continue

            # Convert fields
            item_update = {
                k: Decimal(row[k]) if row[k].replace('.', '', 1).isdigit() else row[k]
                for k in row.keys()
                if k not in ["PhantomName", "SeriesDescription"]
            }

            print(f"Updating {series_id} with: {item_update}")

            table.update_item(
                Key={"series_id": series_id},
                UpdateExpression="SET " + ", ".join(f"#{k}=:{k}" for k in item_update.keys()),
                ExpressionAttributeNames={f"#{k}": k for k in item_update.keys()},
                ExpressionAttributeValues={f":{k}": v for k, v in item_update.items()}
            )

def map_series(phantom, series_desc):
    # TODO: crea una mappa hardcoded per ora. Es:
    mapping = {
        ("D55-02", "AIDR3D"): "1.2.392.200036.9116.2.6.1.61487.1955992646.1701764095.847479",
        # aggiungi gli altri qui
    }
    return mapping.get((phantom, series_desc))

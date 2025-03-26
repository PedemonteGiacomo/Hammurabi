import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
from pynetdicom import AE, evt, StoragePresentationContexts
from pynetdicom.sop_class import (
    PatientRootQueryRetrieveInformationModelFind,
    PatientRootQueryRetrieveInformationModelMove
)
from pydicom.dataset import Dataset
import os

def wait_for_files(folder):
    while True:
        files = [f for f in os.listdir(folder) if f.endswith(".dcm")]
        if len(files) > 0:
            return files
        time.sleep(1)

@app.route('/api/images', methods=['GET'])
def get_images():
    patient_id = request.args.get('patientId')
    image_urls = []
    # 1. First association: send a C-FIND to verify the patient exists.
    ...
    # 2. Second association: send a C-MOVE request to retrieve images.
    ...
    # 3. Wait for all images to be received
    dest_folder = os.path.join("static", f"retrieved_{patient_id}")
    files = wait_for_files(dest_folder)
    for fname in files:
        full_url = request.host_url.rstrip('/') + f"/static/retrieved_{patient_id}/{fname}"
        image_urls.append(full_url)

    return jsonify({'images': image_urls})
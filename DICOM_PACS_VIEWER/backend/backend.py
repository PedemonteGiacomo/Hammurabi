# backend.py
from flask import Flask, jsonify, request
from flask_cors import CORS
from pynetdicom import AE, evt, StoragePresentationContexts
from pynetdicom.sop_class import (
    PatientRootQueryRetrieveInformationModelFind,
    PatientRootQueryRetrieveInformationModelMove
)
from pydicom.dataset import Dataset
import os
import time
import logging
import threading

# Enable debug logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__, static_folder='static')
CORS(app)

# read from environment
PACS_AE_TITLE = os.environ.get("PACS_AE_TITLE", "MYPACS")
PACS_IP = os.environ.get("PACS_IP", "pacs-service")  # e.g. a Kubernetes service name
PACS_PORT = int(os.environ.get("PACS_PORT", "104"))

CLIENT_AE_TITLE = os.environ.get("CLIENT_AE_TITLE", "TESTSCU2")
CLIENT_PORT = int(os.environ.get("CLIENT_PORT", "11119"))  # for this backend to receive C-MOVE images

BACKEND_PORT = os.environ.get("BACKEND_PORT", "5001")
# Global variable to track the SCP server instance
scp_server = None

# Keep track of ongoing or completed retrievals in a dict
# c_move_status[patient_id] = { 'done': bool, 'error': str or None, 'thread': Thread, ... }
c_move_status = {}

# ---------------------------
# SCP (Storage) functions
# ---------------------------
def handle_store(event):
    """
    Handler for incoming C-STORE requests. Save DICOM to disk.
    """
    ds = event.dataset
    ds.file_meta = event.file_meta
    patient_id = ds.get("PatientID", "unknown").strip()
    folder_name = os.path.join("static", f"retrieved_{patient_id}")
    os.makedirs(folder_name, exist_ok=True)
    filename = os.path.join(folder_name, f"{ds.SOPInstanceUID}.dcm")
    ds.save_as(filename, write_like_original=False)
    logging.info("Received and saved: %s", filename)
    return 0x0000  # Success

def start_scp_server():
    global scp_server
    if scp_server is not None:
        # Already running
        return
    ae = AE(ae_title=CLIENT_AE_TITLE)
    for context in StoragePresentationContexts:
        ae.add_supported_context(context.abstract_syntax, scp_role=True, scu_role=False)
    handlers = [(evt.EVT_C_STORE, handle_store)]
    logging.info(f"Starting DICOM C-STORE SCP on port {CLIENT_PORT} with AE Title {CLIENT_AE_TITLE}")
    scp_server = ae.start_server(("0.0.0.0", CLIENT_PORT), block=False, evt_handlers=handlers)

def stop_scp_server():
    global scp_server
    if scp_server:
        logging.info("Stopping DICOM C-STORE SCP on port %d", CLIENT_PORT)
        scp_server.shutdown()
        scp_server = None

# ----------------------------------
# Background thread for the C-MOVE
# ----------------------------------
def run_cmove(patient_id):
    """
    This function runs in a thread. It performs the C-FIND (to confirm patient exists)
    and then the C-MOVE to retrieve the images. We store the success/failure in
    c_move_status[patient_id].
    """
    try:
        # 1) Associate for C-FIND
        ae_find = AE(ae_title="MY_CLIENT")
        ae_find.add_requested_context(PatientRootQueryRetrieveInformationModelFind)
        assoc_find = ae_find.associate(PACS_IP, PACS_PORT, ae_title=PACS_AE_TITLE)
        if not assoc_find.is_established:
            raise RuntimeError("Could not associate with PACS for C-FIND")

        query_ds = Dataset()
        query_ds.QueryRetrieveLevel = "PATIENT"
        query_ds.PatientID = patient_id
        logging.info("Sending C-FIND for PatientID: %s", patient_id)

        found = False
        for status, identifier in assoc_find.send_c_find(query_ds, PatientRootQueryRetrieveInformationModelFind):
            if status and status.Status in (0xFF00, 0xFF01):
                found = True
                break
        assoc_find.release()

        if not found:
            raise ValueError(f"PatientID {patient_id} not found on PACS.")

        # 2) Start C-MOVE
        ae_move = AE(ae_title="MY_CLIENT_MOVE")
        ae_move.add_requested_context(PatientRootQueryRetrieveInformationModelMove)
        assoc_move = ae_move.associate(PACS_IP, PACS_PORT, ae_title=PACS_AE_TITLE)
        if not assoc_move.is_established:
            raise RuntimeError("Could not associate with PACS for C-MOVE")

        move_ds = Dataset()
        move_ds.QueryRetrieveLevel = "PATIENT"
        move_ds.PatientID = patient_id

        logging.info("Sending C-MOVE for PatientID: %s to AE: %s", patient_id, CLIENT_AE_TITLE)

        completed = False
        for status, identifier in assoc_move.send_c_move(
            move_ds,
            move_aet=CLIENT_AE_TITLE,
            query_model=PatientRootQueryRetrieveInformationModelMove
        ):
            if status:
                status_code = status.Status
                logging.info("C-MOVE Response: Status 0x{0:04X}".format(status_code))
                # 0x0000 = success
                if status_code == 0x0000:
                    completed = True

        assoc_move.release()

        if not completed:
            raise RuntimeError("C-MOVE did not complete successfully.")

        # If we get here, it's done with no errors
        logging.info(f"C-MOVE for PatientID {patient_id} completed.")
        c_move_status[patient_id]['done'] = True

    except Exception as e:
        logging.error(f"Error in run_cmove thread for patient {patient_id}: {e}")
        c_move_status[patient_id]['done'] = True
        c_move_status[patient_id]['error'] = str(e)
    finally:
        # Optionally stop SCP if you only want it running per retrieval
        # (If you want to keep it always on, remove this line.)
        stop_scp_server()


# ----------------------------------
# Endpoints
# ----------------------------------
@app.route("/api/start_retrieve", methods=["GET"])
def start_retrieve():
    """
    1) Start up the SCP server if not running
    2) Spawn a background thread to do the C-FIND + C-MOVE
    3) Immediately return {"status": "started"} or error
    """
    patient_id = request.args.get("patientId", "").strip()
    if not patient_id:
        return jsonify({"error": "Missing patientId"}), 400

    # Clean or create output folder
    dest_folder = os.path.join("static", f"retrieved_{patient_id}")
    if os.path.exists(dest_folder):
        # You might want to remove old files or not, up to you.
        pass
    else:
        os.makedirs(dest_folder, exist_ok=True)

    # Keep track in global dict
    c_move_status[patient_id] = {
        'done': False,
        'error': None,
        'thread': None
    }

    # Start the SCP to receive images
    start_scp_server()

    # Kick off the thread
    thread = threading.Thread(target=run_cmove, args=(patient_id,), daemon=True)
    c_move_status[patient_id]['thread'] = thread
    thread.start()

    return jsonify({"status": "started"}), 200


@app.route("/api/images", methods=["GET"])
def get_images():
    """
    Return the list of currently available images for a given patientId,
    plus 'done' and 'error' status. The front-end can keep polling
    this endpoint to see if new images have arrived yet.
    """
    patient_id = request.args.get("patientId", "").strip()
    if not patient_id:
        return jsonify({"error": "Missing patientId"}), 400

    dest_folder = os.path.join("static", f"retrieved_{patient_id}")
    if not os.path.exists(dest_folder):
        return jsonify({"images": [], "done": False, "error": None})

    # Gather all .dcm files
    files = [f for f in os.listdir(dest_folder) if f.endswith(".dcm")]
    image_urls = []
    for fname in files:
        # Construct the absolute URL for the front-end
        full_url = request.host_url.rstrip('/') + f"/static/retrieved_{patient_id}/{fname}"
        image_urls.append(full_url)

    done = c_move_status.get(patient_id, {}).get('done', True)
    error = c_move_status.get(patient_id, {}).get('error', None)

    return jsonify({
        "images": image_urls,
        "done": done,
        "error": error
    })


if __name__ == "__main__":
    os.makedirs("static", exist_ok=True)
    app.run(host='0.0.0.0', port=BACKEND_PORT, debug=True)

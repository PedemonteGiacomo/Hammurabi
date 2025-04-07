import csv
import json
import os

# =====================================================================
# CONFIGURE THESE PATHS
# =====================================================================

# A) The location of your CSV (the one with the "File Size" comma problem)
CSV_FILE = r"C:\Users\giacomo.pedemonte\Hammurabi\DICOM_PACS_VIEWER_REFACTORED\hammurabi-ui\public\assets\NBIA_DICOM_Files\manifest-BaJgFARK7427162305084893340\metadata.csv"

# B) The base folder that should be joined with the CSV's "File Location"
#    Example: "C:\Users\...\public\assets\NBIA_DICOM_Files\manifest-BaJgFARK7427162305084893340"
BASE_DIR = r"C:\Users\giacomo.pedemonte\Hammurabi\DICOM_PACS_VIEWER_REFACTORED\hammurabi-ui\public\assets\NBIA_DICOM_Files\manifest-BaJgFARK7427162305084893340"

# C) The final JSON we want to produce
OUTPUT_JSON = r"C:\Users\giacomo.pedemonte\Hammurabi\DICOM_PACS_VIEWER_REFACTORED\hammurabi-ui\src\data\dicomDataFromCSV.json"

# Here are the indexes that match the official header you gave:
SERIES_UID_IDX   = 0  # "Series UID"
SUBJECT_ID_IDX   = 4  # "Subject ID"
STUDY_UID_IDX    = 5  # "Study UID"
STUDY_DESC_IDX   = 6  # "Study Description"
STUDY_DATE_IDX   = 7  # "Study Date"
SERIES_DESC_IDX  = 8  # "Series Description"
NUM_IMAGES_IDX   = 13 # "Number of Images"
FILE_LOC_IDX     = 16 # "File Location" (only if your CSV truly has it at index 15)

# If your CSV has an unquoted comma in "File Size" that splits it,
# the real file path might shift to index 16 or 17.  Adjust as needed!


# ------------------------------------------------------------------------
# 1) BUILD A NESTED DICT => patients_dict[patient_id]["studies"][study_uid]["series"][series_uid]
# ------------------------------------------------------------------------
patients_dict = {}

with open(CSV_FILE, "r", encoding="utf-8") as f:
    reader = csv.reader(f)

    # Skip the header row
    header = next(reader, None)
    if not header:
        raise SystemExit("ERROR: CSV is empty or missing header")

    row_count = 0
    for row in reader:
        row_count += 1
        # If the row is missing columns, skip or warn
        if len(row) <= FILE_LOC_IDX:
            print(f"Row {row_count} has only {len(row)} columns, skipping: {row}")
            continue

        # Extract columns by index
        series_uid  = row[SERIES_UID_IDX].strip()
        patient_id  = row[SUBJECT_ID_IDX].strip()
        study_uid   = row[STUDY_UID_IDX].strip()
        study_desc  = row[STUDY_DESC_IDX].strip()
        study_date  = row[STUDY_DATE_IDX].strip()
        series_desc = row[SERIES_DESC_IDX].strip()
        num_img_str = row[NUM_IMAGES_IDX].strip()
        file_loc    = row[FILE_LOC_IDX].strip()

        # parse integer
        try:
            number_of_images = int(num_img_str)
        except ValueError:
            number_of_images = 0

        # Insert into nested dict
        if patient_id not in patients_dict:
            patients_dict[patient_id] = {
                "patientID": patient_id,
                "studies": {}
            }

        if study_uid not in patients_dict[patient_id]["studies"]:
            patients_dict[patient_id]["studies"][study_uid] = {
                "studyUID": study_uid,
                "studyDescription": study_desc,
                "studyDate": study_date,
                "series": {}
            }

        if series_uid not in patients_dict[patient_id]["studies"][study_uid]["series"]:
            patients_dict[patient_id]["studies"][study_uid]["series"][series_uid] = {
                "seriesUID": series_uid,
                "seriesDescription": series_desc,
                "numberOfImages": number_of_images,
                # We'll add imageFilePaths after enumerating .dcm
                "imageFilePaths": [],
                "csvFileLocation": file_loc
            }

print(f"Parsed {row_count} data rows from CSV.\n")

# ------------------------------------------------------------------------
# 2) ENUMERATE .DCM FILES PER SERIES FOLDER
# ------------------------------------------------------------------------
for pid, pinfo in patients_dict.items():
    for study_uid, study_val in pinfo["studies"].items():
        for series_uid, series_val in study_val["series"].items():
            csv_loc = series_val["csvFileLocation"]

            # handle leading "./" or ".\"
            if csv_loc.startswith("./") or csv_loc.startswith(".\\"):
                csv_loc = csv_loc[2:]

            # unify slashes
            csv_loc = csv_loc.replace("/", os.sep).replace("\\", os.sep)

            abs_folder = os.path.join(BASE_DIR, csv_loc)

            print("---------------------------------------------------")
            print(f"PatientID: {pid}")
            print(f"StudyUID:  {study_uid}")
            print(f"SeriesUID: {series_uid}")
            print(f" - CSV File Location: {series_val['csvFileLocation']}")
            print(f" - Constructed Path => {abs_folder}")
            dir_exists = os.path.isdir(abs_folder)
            print(f" - Directory exists? {dir_exists}")

            if not dir_exists:
                print(" --> Path invalid or missing, skipping.\n")
                continue

            # find .dcm files
            all_files = sorted(os.listdir(abs_folder))
            dcm_files = [f for f in all_files if f.lower().endswith(".dcm")]
            print(f" - Found {len(dcm_files)} .dcm files.\n")

            # store full absolute paths
            full_paths = []
            for df in dcm_files:
                full_paths.append(os.path.join(abs_folder, df))

            series_val["imageFilePaths"] = full_paths


# ------------------------------------------------------------------------
# 3) CONVERT NESTED DICT => FINAL LIST [ { patientID, studies: [...] }, ... ]
# ------------------------------------------------------------------------
final_list = []
for pid, pval in patients_dict.items():
    p_obj = {
        "patientID": pval["patientID"],
        "studies": []
    }
    for st_uid, st_data in pval["studies"].items():
        s_obj = {
            "studyUID": st_data["studyUID"],
            "studyDescription": st_data["studyDescription"],
            "studyDate": st_data["studyDate"],
            "series": []
        }
        for sr_uid, sr_val in st_data["series"].items():
            s_obj["series"].append({
                "seriesUID": sr_val["seriesUID"],
                "seriesDescription": sr_val["seriesDescription"],
                "numberOfImages": sr_val["numberOfImages"],
                "imageFilePaths": sr_val["imageFilePaths"]
            })
        p_obj["studies"].append(s_obj)
    final_list.append(p_obj)

# ------------------------------------------------------------------------
# 4) WRITE THE OUTPUT JSON
# ------------------------------------------------------------------------
os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)

with open(OUTPUT_JSON, "w", encoding="utf-8") as out:
    json.dump(final_list, out, indent=2, ensure_ascii=False)

print("\nDONE! Wrote JSON =>", OUTPUT_JSON)

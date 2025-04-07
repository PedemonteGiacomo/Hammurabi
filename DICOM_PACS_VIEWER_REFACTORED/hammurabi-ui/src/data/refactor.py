import json
import os

# Input and output JSON files
INPUT_JSON = "dicomDataFromCSV.json"
OUTPUT_JSON = "dicomData_updated.json"

# Windows prefix you want to remove:
prefix_to_strip = r"C:\Users\giacomo.pedemonte\Hammurabi\DICOM_PACS_VIEWER_REFACTORED\hammurabi-ui\public"
# We will replace that entire prefix with just "."
replacement_prefix = "."

def convert_path(win_path: str) -> str:
    """
    Given an absolute Windows path, remove the unwanted prefix
    and replace backslashes with forward slashes to get 
    a relative web-friendly path (like /assets/whatever).
    """
    # Normalize Windows backslashes to Python’s path style
    # Then do a replace for the known prefix
    # Or do a .replace() if you are sure the prefix is exactly as typed.
    
    # 1) Turn backslashes into forward slashes
    forward_slash_path = win_path.replace("\\", "/")

    # 2) If the path starts with the known prefix, remove it
    #    (the prefix itself also has backslashes changed to forward slashes)
    prefix_forward = prefix_to_strip.replace("\\", "/")
    
    if forward_slash_path.startswith(prefix_forward):
        new_path = forward_slash_path.replace(prefix_forward, replacement_prefix, 1)
    else:
        # Fallback if something doesn't match exactly
        new_path = forward_slash_path

    # 3) Optionally ensure it starts with "/" if not empty
    if not new_path.startswith("/") and not new_path.startswith("/"):
        new_path = "." + new_path

    return new_path

def main():
    with open(INPUT_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    # data is a list of patient entries
    for patient in data:
        for study in patient["studies"]:
            for series in study["series"]:
                # For each path in imageFilePaths, do the conversion
                paths = series["imageFilePaths"]
                new_paths = [convert_path(p) for p in paths]
                series["imageFilePaths"] = new_paths

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    main()

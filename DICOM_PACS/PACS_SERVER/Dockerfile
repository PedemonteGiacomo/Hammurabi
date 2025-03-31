# pacs/Dockerfile

FROM python:3.10-slim

# Create working directory
WORKDIR /app

# Copy requirements and install
COPY requirements_pacs.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy your PACS server code
COPY pacs.py /app/

# Expose the DICOM port (104)
EXPOSE 104

# By default, run the PACS server
CMD ["python", "pacs.py"]

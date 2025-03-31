# backend/Dockerfile

FROM python:3.10-slim

WORKDIR /app

# Copy your backend requirements
COPY requirements_backend.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy your Flask app code
COPY backend.py /app/

# Expose Flask port
EXPOSE 5001
EXPOSE 11119


# Run the Flask server
CMD ["python", "backend.py"]

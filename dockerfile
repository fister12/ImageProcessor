# Use a Python 3.9 slim base image
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies with cleanup to reduce image size
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    libgthread-2.0-0 \
    libgl1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy only the requirements file and install dependencies to leverage Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files, including the model file
# The destination directory is created by the COPY command
COPY u2net.onnx .
COPY . .

# Expose the port your application listens on
EXPOSE 5000

# Specify the command to run the application
CMD ["python", "app.py"]
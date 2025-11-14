# Use a Python 3.9 slim base image
FROM python:3.9-slim

# Set environment variables to optimize pip
ENV PIP_DEFAULT_TIMEOUT=1000
ENV PIP_RETRIES=5
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV PIP_NO_CACHE_DIR=1

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
# Install packages with better timeout and retry settings
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --timeout=1000 --retries=5 -r requirements.txt

# Copy the rest of the application files
COPY . .

# Expose the port your application listens on
EXPOSE 5000

# Specify the command to run the application
CMD ["python", "app.py"]
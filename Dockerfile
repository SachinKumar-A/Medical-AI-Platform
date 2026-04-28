# Use Python 3.10 base image
FROM python:3.10-slim

# Install git and git-lfs
RUN apt-get update && apt-get install -y git git-lfs wget && \
    git lfs install && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application files
COPY app.py .
COPY templates/ templates/

# Download model directly from the Space's git repo
# This bypasses Docker's LFS handling issues
RUN wget -q --show-progress \
    "https://huggingface.co/spaces/sksandysachin242/Pneumonia-Detection/resolve/main/model2result.keras" \
    -O model2result.keras || echo "Model download failed, will try runtime download"

# Verify model file
RUN if [ -f "model2result.keras" ]; then \
        echo "Model file present: $(du -h model2result.keras)"; \
    else \
        echo "WARNING: Model file not found, app will download at runtime"; \
    fi

# Create uploads directory
RUN mkdir -p uploads

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

# Set environment variable for port
ENV PORT=7860

# Run the application
CMD ["python", "app.py"]

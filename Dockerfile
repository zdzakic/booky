# Dockerfile
FROM python:3.12-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --break-system-packages -r requirements.txt

# Copy project
COPY . /app/

# Run server
CMD cd booky_be && gunicorn config.wsgi --bind 0.0.0.0:$PORT

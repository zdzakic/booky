FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --break-system-packages -r requirements.txt

COPY . /app/

CMD gunicorn config.wsgi --bind 0.0.0.0:$PORT

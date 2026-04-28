FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY django_app/ ./django_app/

ENV DJANGO_SETTINGS_MODULE=soundwave.settings
ENV PYTHONPATH=/app/django_app

CMD ["sh", "-c", "python django_app/manage.py migrate && python django_app/manage.py runserver 0.0.0.0:8001"]
# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN apt-get update && \
    apt-get install -y wget && \
    wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy && \
    chmod +x cloud_sql_proxy && \
    apt-get install -y libpq-dev && \
    apt-get install -y postgresql-client && \
    apt-get install -y build-essential && \
    pip3 install --trusted-host pypi.python.org -r requirements.txt

# Copy the Cloud SQL credentials file into the container
COPY credentials.json /secrets/cloudsql/credentials.json

# Set the environment variables for connecting to the Cloud SQL instance
ENV CLOUD_SQL_USERNAME="postgres"
ENV CLOUD_SQL_PASSWORD="Welcome@1234"
ENV CLOUD_SQL_DATABASE="imdb"
ENV CLOUD_SQL_INSTANCE="cmpt-786-im:us-central1:cmpt-756-final-project"

# Start the Cloud SQL Proxy and then run the Flask app
CMD ["sh", "-c", "./cloud_sql_proxy -instances=$CLOUD_SQL_INSTANCE=tcp:5432 -credential_file=/secrets/cloudsql/credentials.json & exec flask run --host 0.0.0.0"]

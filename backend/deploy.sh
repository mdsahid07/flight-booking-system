#!/bin/bash

# Stop the existing Spring Boot app (if running)
sudo pkill -f "java -jar backend-0.0.1-SNAPSHOT.jar"

# Pull the latest code
git pull origin main

# Build the application
mvn clean install

# Run the application
nohup java -jar target/backend-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
echo "Backend application started!"
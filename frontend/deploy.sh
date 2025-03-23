#!/bin/bash

# Install dependencies and build the frontend
npm install
npm run build

# Sync the build folder to S3
aws s3 sync dist/ s3://bookingapp-frontend --delete
echo "Frontend deployed to S3!"
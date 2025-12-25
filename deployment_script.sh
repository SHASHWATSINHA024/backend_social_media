#!/bin/bash

# Ensure localtunnel is installed
if ! command -v lt &> /dev/null
then
    echo "Installing localtunnel..."
    npm install -g localtunnel
fi

echo "Starting server in background..."
npm run start &
SERVER_PID=$!

echo "Waiting for server to start..."
sleep 5

echo "Starting tunnel..."
npx localtunnel --port 3000

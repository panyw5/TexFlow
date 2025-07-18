#!/bin/bash

# Start development server for TexFlow

echo "Starting TexFlow development environment..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the development server
echo "Starting development server..."
npm run dev

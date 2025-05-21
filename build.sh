#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d '.' -f 1)

if [ "$NODE_MAJOR_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be 20 or higher. Current version: $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js version $NODE_VERSION detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

echo "✅ Build completed"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️ .env file not found. Creating from example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file from .env.example"
        echo "⚠️ Please update the WEATHERAPI_KEY in the .env file"
    else
        echo "❌ .env.example file not found. Please create a .env file manually."
        exit 1
    fi
fi

echo "🌈 Deployment preparation complete! Start the app with 'npm start'"

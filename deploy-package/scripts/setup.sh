#!/bin/bash

echo "🚀 Setting up SEO Blog Agent..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
if command -v yarn &> /dev/null; then
    yarn install
else
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your API credentials before starting the server"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your API token"
echo "2. Run 'npm run dev' or 'yarn dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Happy blogging! 🎉"

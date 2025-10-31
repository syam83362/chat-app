#!/bin/bash

# Development Setup Script for Real-Time Chat Application

echo "🛠️ Setting up Real-Time Chat Application for development..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL and try again."
    exit 1
fi

echo "✅ Prerequisites check passed!"

# Backend setup
echo "🐍 Setting up Python backend..."

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install Python dependencies
echo "📥 Installing Python dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "⚠️  Please update .env with your database credentials before running the application."
fi

# Frontend setup
echo "⚛️ Setting up React frontend..."

cd frontend

# Install Node.js dependencies
echo "📥 Installing Node.js dependencies..."
npm install

cd ..

# Database setup
echo "🗄️ Setting up database..."

# Check if database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw chat_app; then
    echo "📊 Creating database..."
    createdb chat_app
    echo "✅ Database 'chat_app' created successfully!"
else
    echo "✅ Database 'chat_app' already exists!"
fi

echo ""
echo "🎉 Development setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: source venv/bin/activate && uvicorn app.main:app --reload"
echo "2. Frontend: cd frontend && npm start"
echo ""
echo "Or use Docker: ./start.sh"
echo ""

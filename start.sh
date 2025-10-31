#!/bin/bash

# Real-Time Chat Application Startup Script

echo "🚀 Starting Real-Time Chat Application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose and try again."
    exit 1
fi

echo "📦 Building and starting services..."

# Start the application with docker-compose
docker-compose up --build -d

echo "⏳ Waiting for services to be ready..."

# Wait for database to be ready
echo "🔍 Checking database connection..."
until docker-compose exec db pg_isready -U postgres > /dev/null 2>&1; do
    echo "⏳ Waiting for database..."
    sleep 2
done

echo "✅ Database is ready!"

# Wait for Redis to be ready
echo "🔍 Checking Redis connection..."
until docker-compose exec redis redis-cli ping > /dev/null 2>&1; do
    echo "⏳ Waiting for Redis..."
    sleep 2
done

echo "✅ Redis is ready!"

# Wait for web service to be ready
echo "🔍 Checking web service..."
until curl -s http://localhost:8000/health > /dev/null 2>&1; do
    echo "⏳ Waiting for web service..."
    sleep 2
done

echo "✅ Web service is ready!"

echo ""
echo "🎉 Application is now running!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "To stop the application, run: docker-compose down"
echo "To view logs, run: docker-compose logs -f"
echo ""
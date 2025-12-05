#!/bin/bash

# India Legal Assistance AI Platform - Quick Start Script
# This script sets up and runs the entire platform

set -e

echo "🏛️  India Legal Assistance AI Platform - Quick Start"
echo "=================================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Create .env file if it doesn't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env (you can edit this file to add API keys)"
else
    echo "✅ backend/.env already exists"
fi

echo ""
echo "🚀 Starting all services..."
echo ""

# Start Docker Compose
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ All services are running!"
echo ""
echo "=================================================="
echo "🎉 Platform is ready!"
echo "=================================================="
echo ""
echo "📱 Access the application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "🧪 Test the AI:"
echo "   1. Open http://localhost:3000"
echo "   2. Enter an incident description (min 50 characters)"
echo "   3. Click 'Analyze Incident'"
echo "   4. View AI-powered legal analysis"
echo ""
echo "📚 Documentation:"
echo "   README:     ./README.md"
echo "   Summary:    ./docs/PROJECT_SUMMARY.md"
echo "   Architecture: ./docs/ARCHITECTURE.md"
echo ""
echo "🛑 To stop all services:"
echo "   docker-compose down"
echo ""
echo "📋 To view logs:"
echo "   docker-compose logs -f backend"
echo "   docker-compose logs -f frontend"
echo ""
echo "=================================================="
echo "Happy coding! 🚀"
echo "=================================================="

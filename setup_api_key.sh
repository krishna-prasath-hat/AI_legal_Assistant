#!/bin/bash

# Script to add OpenAI API key to the application

echo "=================================================="
echo "🔑 OpenAI API Key Setup"
echo "=================================================="
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found"
    echo "Run ./run_app.sh first to create the .env file"
    exit 1
fi

echo "Please enter your OpenAI API key (starts with sk-):"
echo "(Get it from: https://platform.openai.com/api-keys)"
echo ""
read -p "API Key: " api_key

if [ -z "$api_key" ]; then
    echo "❌ No API key entered. Exiting."
    exit 1
fi

# Update .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$api_key|g" backend/.env
else
    # Linux
    sed -i "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$api_key|g" backend/.env
fi

echo ""
echo "✅ API key added successfully!"
echo ""
echo "=================================================="
echo "🚀 Next Steps:"
echo "=================================================="
echo ""
echo "1. Restart the backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "2. Open the app: http://localhost:3000"
echo ""
echo "3. Test with an incident description (min 50 characters)"
echo ""
echo "=================================================="

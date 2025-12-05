#!/bin/bash

# AI Legal Assistance Platform - Automated Startup Script
# This script will check, setup, and run the entire application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}🏛️  AI Legal Assistance Platform - Auto Startup${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :"$1" >/dev/null 2>&1
}

# Step 1: Check Prerequisites
echo -e "${YELLOW}📋 Step 1: Checking Prerequisites...${NC}"

if ! command_exists python3; then
    echo -e "${RED}❌ Python3 is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Python3 found: $(python3 --version)${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"

if ! command_exists redis-server; then
    echo -e "${YELLOW}⚠️  Redis not found. Installing via Homebrew...${NC}"
    if command_exists brew; then
        brew install redis
    else
        echo -e "${RED}❌ Homebrew not found. Please install Redis manually${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✅ Redis found${NC}"

echo ""

# Step 2: Setup Backend Environment
echo -e "${YELLOW}📋 Step 2: Setting up Backend Environment...${NC}"

cd "$BACKEND_DIR"

if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    
    # Generate secure keys
    SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    ENCRYPTION_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    
    # Update .env with generated keys
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|SECRET_KEY=.*|SECRET_KEY=$SECRET_KEY|g" .env
        sed -i '' "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|g" .env
        sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=sqlite:///./data/legal_assistant.db|g" .env
    else
        sed -i "s|SECRET_KEY=.*|SECRET_KEY=$SECRET_KEY|g" .env
        sed -i "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|g" .env
        sed -i "s|DATABASE_URL=.*|DATABASE_URL=sqlite:///./data/legal_assistant.db|g" .env
    fi
    
    echo -e "${GREEN}✅ Created .env file with secure keys${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Create data directory for SQLite
mkdir -p data
mkdir -p uploads

echo ""

# Step 3: Install Backend Dependencies
echo -e "${YELLOW}📋 Step 3: Installing Backend Dependencies...${NC}"

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment...${NC}"
    python3 -m venv venv
fi

source venv/bin/activate

echo -e "${YELLOW}Installing Python packages...${NC}"
pip3 install --upgrade pip > /dev/null 2>&1
pip3 install -r requirements.txt > /dev/null 2>&1

echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Step 4: Setup Frontend Environment
echo -e "${YELLOW}📋 Step 4: Setting up Frontend Environment...${NC}"

cd "$FRONTEND_DIR"

if [ ! -f .env.local ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
    echo -e "${GREEN}✅ Created .env.local${NC}"
else
    echo -e "${GREEN}✅ .env.local already exists${NC}"
fi

echo ""

# Step 5: Install Frontend Dependencies
echo -e "${YELLOW}📋 Step 5: Installing Frontend Dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing Node.js packages...${NC}"
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

echo ""

# Step 6: Start Redis
echo -e "${YELLOW}📋 Step 6: Starting Redis...${NC}"

if port_in_use 6379; then
    echo -e "${GREEN}✅ Redis is already running on port 6379${NC}"
else
    redis-server --daemonize yes
    sleep 2
    if port_in_use 6379; then
        echo -e "${GREEN}✅ Redis started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start Redis${NC}"
        exit 1
    fi
fi

echo ""

# Step 7: Start Qdrant (Optional - using Docker)
echo -e "${YELLOW}📋 Step 7: Checking Qdrant Vector Database...${NC}"

if command_exists docker; then
    if ! docker ps | grep -q qdrant; then
        echo -e "${YELLOW}Starting Qdrant in Docker...${NC}"
        docker run -d -p 6333:6333 -p 6334:6334 \
            -v $(pwd)/qdrant_storage:/qdrant/storage \
            --name qdrant \
            qdrant/qdrant:latest > /dev/null 2>&1 || echo -e "${YELLOW}⚠️  Qdrant container may already exist${NC}"
        sleep 3
        echo -e "${GREEN}✅ Qdrant started${NC}"
    else
        echo -e "${GREEN}✅ Qdrant is already running${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Docker not found. Qdrant will not be available (optional feature)${NC}"
fi

echo ""

# Step 8: Start Backend Server
echo -e "${YELLOW}📋 Step 8: Starting Backend Server...${NC}"

cd "$BACKEND_DIR"
source venv/bin/activate

if port_in_use 8000; then
    echo -e "${YELLOW}⚠️  Port 8000 is already in use. Killing existing process...${NC}"
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo -e "${YELLOW}Starting FastAPI backend on http://localhost:8000${NC}"
nohup uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!

sleep 5

if port_in_use 8000; then
    echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Failed to start backend server${NC}"
    cat backend.log
    exit 1
fi

echo ""

# Step 9: Start Frontend Server
echo -e "${YELLOW}📋 Step 9: Starting Frontend Server...${NC}"

cd "$FRONTEND_DIR"

if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Killing existing process...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo -e "${YELLOW}Starting Next.js frontend on http://localhost:3000${NC}"
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 8

if port_in_use 3000; then
    echo -e "${GREEN}✅ Frontend server started (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Failed to start frontend server${NC}"
    cat frontend.log
    exit 1
fi

echo ""
echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}🎉 Application is Running Successfully!${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""
echo -e "${GREEN}📱 Access Points:${NC}"
echo -e "   Frontend:      ${BLUE}http://localhost:3000${NC}"
echo -e "   Backend API:   ${BLUE}http://localhost:8000${NC}"
echo -e "   API Docs:      ${BLUE}http://localhost:8000/docs${NC}"
echo ""
echo -e "${GREEN}📊 Running Services:${NC}"
echo -e "   Backend PID:   ${BACKEND_PID}"
echo -e "   Frontend PID:  ${FRONTEND_PID}"
echo -e "   Redis:         Running on port 6379"
if command_exists docker && docker ps | grep -q qdrant; then
    echo -e "   Qdrant:        Running on port 6333"
fi
echo ""
echo -e "${GREEN}📋 Logs:${NC}"
echo -e "   Backend:  tail -f $BACKEND_DIR/backend.log"
echo -e "   Frontend: tail -f $FRONTEND_DIR/frontend.log"
echo ""
echo -e "${GREEN}🛑 To Stop:${NC}"
echo -e "   kill $BACKEND_PID $FRONTEND_PID"
echo -e "   redis-cli shutdown"
if command_exists docker && docker ps | grep -q qdrant; then
    echo -e "   docker stop qdrant"
fi
echo ""
echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}Happy Coding! 🚀${NC}"
echo -e "${BLUE}==================================================${NC}"

# Save PIDs to file for easy cleanup
echo "$BACKEND_PID" > "$SCRIPT_DIR/.backend.pid"
echo "$FRONTEND_PID" > "$SCRIPT_DIR/.frontend.pid"

# Keep script running and show logs
echo ""
echo -e "${YELLOW}Showing live logs (Ctrl+C to stop viewing, services will keep running)...${NC}"
echo ""
sleep 2

tail -f "$BACKEND_DIR/backend.log" "$FRONTEND_DIR/frontend.log"

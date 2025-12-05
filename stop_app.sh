#!/bin/bash

# AI Legal Assistance Platform - Stop Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}🛑 Stopping AI Legal Assistance Platform${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to check if a port is in use
port_in_use() {
    lsof -i :"$1" >/dev/null 2>&1
}

# Stop Backend
echo -e "${YELLOW}Stopping Backend Server...${NC}"
if [ -f "$SCRIPT_DIR/.backend.pid" ]; then
    BACKEND_PID=$(cat "$SCRIPT_DIR/.backend.pid")
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Backend server stopped (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend process not found${NC}"
    fi
    rm "$SCRIPT_DIR/.backend.pid"
elif port_in_use 8000; then
    lsof -ti:8000 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Killed process on port 8000${NC}"
else
    echo -e "${GREEN}✅ Backend server not running${NC}"
fi

# Stop Frontend
echo -e "${YELLOW}Stopping Frontend Server...${NC}"
if [ -f "$SCRIPT_DIR/.frontend.pid" ]; then
    FRONTEND_PID=$(cat "$SCRIPT_DIR/.frontend.pid")
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Frontend server stopped (PID: $FRONTEND_PID)${NC}"
    else
        echo -e "${YELLOW}⚠️  Frontend process not found${NC}"
    fi
    rm "$SCRIPT_DIR/.frontend.pid"
elif port_in_use 3000; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    echo -e "${GREEN}✅ Killed process on port 3000${NC}"
else
    echo -e "${GREEN}✅ Frontend server not running${NC}"
fi

# Stop Redis
echo -e "${YELLOW}Stopping Redis...${NC}"
if port_in_use 6379; then
    redis-cli shutdown 2>/dev/null || true
    echo -e "${GREEN}✅ Redis stopped${NC}"
else
    echo -e "${GREEN}✅ Redis not running${NC}"
fi

# Stop Qdrant (if running in Docker)
echo -e "${YELLOW}Stopping Qdrant...${NC}"
if command -v docker >/dev/null 2>&1; then
    if docker ps | grep -q qdrant; then
        docker stop qdrant > /dev/null 2>&1
        docker rm qdrant > /dev/null 2>&1
        echo -e "${GREEN}✅ Qdrant stopped${NC}"
    else
        echo -e "${GREEN}✅ Qdrant not running${NC}"
    fi
else
    echo -e "${GREEN}✅ Docker not found, skipping Qdrant${NC}"
fi

echo ""
echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}✅ All Services Stopped${NC}"
echo -e "${BLUE}==================================================${NC}"

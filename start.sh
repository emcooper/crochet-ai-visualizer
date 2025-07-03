#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Crochet AI Visualizer...${NC}"

# Function to cleanup background processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${GREEN}📡 Starting Go backend...${NC}"
cd backend
go run . &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo -e "${GREEN}🌐 Starting Next.js frontend...${NC}"
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Services started!${NC}"
echo -e "${YELLOW}📡 Backend: http://localhost:8081${NC}"
echo -e "${YELLOW}🌐 Frontend: http://localhost:3000${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
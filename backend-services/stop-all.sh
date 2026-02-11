#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}Stopping all microservices...${NC}"

# Read PIDs from file if it exists
if [ -f .pids ]; then
    while read pid; do
        if ps -p $pid > /dev/null; then
            echo "Killing process $pid"
            kill -9 $pid
        fi
    done < .pids
    rm .pids
fi

# Also kill by port (backup)
for port in 8761 8080 8081 8082 8083 8084; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "Killing process on port $port"
        kill -9 $(lsof -t -i:$port)
    fi
done

echo -e "${GREEN}All services stopped${NC}"

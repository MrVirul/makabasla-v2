#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Starting Microservices Infrastructure${NC}"
echo -e "${GREEN}======================================${NC}"

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${RED}Port $1 is already in use!${NC}"
        echo "Kill the process? (y/n)"
        read answer
        if [ "$answer" = "y" ]; then
            kill -9 $(lsof -t -i:$1)
            echo -e "${GREEN}Process killed${NC}"
        else
            exit 1
        fi
    fi
}

# Check required ports
echo -e "${YELLOW}Checking ports...${NC}"
check_port 8761
check_port 8080
check_port 8081
check_port 8082

# Start Eureka Server
echo -e "${GREEN}Starting Eureka Server...${NC}"
cd eureka-server
mvn clean install -DskipTests > /dev/null 2>&1
mvn spring-boot:run > ../logs/eureka.log 2>&1 &
EUREKA_PID=$!
echo -e "${GREEN}✓ Eureka Server started (PID: $EUREKA_PID)${NC}"
cd ..

# Wait for Eureka to be ready
echo -e "${YELLOW}Waiting for Eureka Server to be ready (20 seconds)...${NC}"
sleep 20

# Check if Eureka is actually running
if curl -s http://localhost:8761/actuator/health > /dev/null; then
    echo -e "${GREEN}✓ Eureka Server is healthy${NC}"
else
    echo -e "${RED}✗ Eureka Server failed to start${NC}"
    exit 1
fi

# Start API Gateway
echo -e "${GREEN}Starting API Gateway...${NC}"
cd api-gateway
mvn clean install -DskipTests > /dev/null 2>&1
mvn spring-boot:run > ../logs/gateway.log 2>&1 &
GATEWAY_PID=$!
echo -e "${GREEN}✓ API Gateway started (PID: $GATEWAY_PID)${NC}"
cd ..

# Wait for Gateway
echo -e "${YELLOW}Waiting for API Gateway (10 seconds)...${NC}"
sleep 10

# Start User Service
echo -e "${GREEN}Starting User Service...${NC}"
cd user-service
mvn clean install -DskipTests > /dev/null 2>&1
mvn spring-boot:run > ../logs/user-service.log 2>&1 &
USER_PID=$!
echo -e "${GREEN}✓ User Service started (PID: $USER_PID)${NC}"
cd ..

# Wait
sleep 5

# Start Order Service
echo -e "${GREEN}Starting Order Service...${NC}"
cd order-service
mvn clean install -DskipTests > /dev/null 2>&1
mvn spring-boot:run > ../logs/order-service.log 2>&1 &
ORDER_PID=$!
echo -e "${GREEN}✓ Order Service started (PID: $ORDER_PID)${NC}"
cd ..

# Wait for all services to register
echo -e "${YELLOW}Waiting for services to register with Eureka (15 seconds)...${NC}"
sleep 15

# Summary
echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}All Services Started Successfully!${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo "Service PIDs:"
echo "  Eureka Server:  $EUREKA_PID"
echo "  API Gateway:    $GATEWAY_PID"
echo "  User Service:   $USER_PID"
echo "  Order Service:  $ORDER_PID"
echo ""
echo "Access Points:"
echo "  Eureka Dashboard: http://localhost:8761"
echo "  API Gateway:      http://localhost:8080"
echo "  User Service:     http://localhost:8081"
echo "  Order Service:    http://localhost:8082"
echo ""
echo "Logs are available in ./logs/ directory"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Save PIDs to file for stop script
echo "$EUREKA_PID" > .pids
echo "$GATEWAY_PID" >> .pids
echo "$USER_PID" >> .pids
echo "$ORDER_PID" >> .pids

# Keep script running
wait

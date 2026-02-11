#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}Testing Microservices${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# Base URL
GATEWAY_URL="http://localhost:8080"

# Test 1: Check Eureka Dashboard
echo -e "${YELLOW}Test 1: Checking Eureka Server...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8761)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ Eureka Server is UP${NC}"
else
    echo -e "${RED}✗ Eureka Server is DOWN${NC}"
    exit 1
fi

# Test 2: Check Gateway Health
echo -e "${YELLOW}Test 2: Checking API Gateway...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" $GATEWAY_URL/actuator/health)
if [ $response -eq 200 ]; then
    echo -e "${GREEN}✓ API Gateway is UP${NC}"
else
    echo -e "${RED}✗ API Gateway is DOWN${NC}"
    exit 1
fi

# Test 3: Create a User
echo ""
echo -e "${YELLOW}Test 3: Creating a user...${NC}"
user_response=$(curl -s -X POST $GATEWAY_URL/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "1234567890"
  }')

if [[ $user_response == *"id"* ]]; then
    echo -e "${GREEN}✓ User created successfully${NC}"
    echo "Response: $user_response"
else
    echo -e "${RED}✗ Failed to create user${NC}"
    echo "Response: $user_response"
fi

# Test 4: Get All Users
echo ""
echo -e "${YELLOW}Test 4: Getting all users...${NC}"
users=$(curl -s $GATEWAY_URL/api/users)
if [[ $users == "["* ]]; then
    echo -e "${GREEN}✓ Successfully retrieved users${NC}"
    echo "Response: $users"
else
    echo -e "${RED}✗ Failed to retrieve users${NC}"
fi

# Test 5: Create an Order
echo ""
echo -e "${YELLOW}Test 5: Creating an order...${NC}"
order_response=$(curl -s -X POST $GATEWAY_URL/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "productName": "Test Product",
    "quantity": 2,
    "totalPrice": 100.00
  }')

if [[ $order_response == *"id"* ]]; then
    echo -e "${GREEN}✓ Order created successfully${NC}"
    echo "Response: $order_response"
else
    echo -e "${RED}✗ Failed to create order${NC}"
    echo "Response: $order_response"
fi

# Test 6: Get All Orders
echo ""
echo -e "${YELLOW}Test 6: Getting all orders...${NC}"
orders=$(curl -s $GATEWAY_URL/api/orders)
if [[ $orders == "["* ]]; then
    echo -e "${GREEN}✓ Successfully retrieved orders${NC}"
    echo "Response: $orders"
else
    echo -e "${RED}✗ Failed to retrieve orders${NC}"
fi

# Test 7: Check Services Registered in Eureka
echo ""
echo -e "${YELLOW}Test 7: Checking registered services in Eureka...${NC}"
eureka_apps=$(curl -s http://localhost:8761/eureka/apps)
if [[ $eureka_apps == *"USER-SERVICE"* ]] && [[ $eureka_apps == *"ORDER-SERVICE"* ]]; then
    echo -e "${GREEN}✓ All services registered in Eureka${NC}"
else
    echo -e "${RED}✗ Some services not registered${NC}"
fi

# Summary
echo ""
echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}All Tests Completed!${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""
echo "View Eureka Dashboard: http://localhost:8761"
echo "Access services through gateway at: http://localhost:8080"

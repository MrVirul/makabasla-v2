#!/bin/bash

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Setting up PostgreSQL databases...${NC}"

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
    echo -e "${RED}PostgreSQL is not running!${NC}"
    echo "Start PostgreSQL first:"
    echo "  brew services start postgresql@14"
    echo "  OR"
    echo "  pg_ctl -D /usr/local/var/postgres start"
    exit 1
fi

echo -e "${GREEN}PostgreSQL is running${NC}"

# Run the SQL setup script
echo -e "${YELLOW}Creating databases...${NC}"
psql -U postgres -f setup-databases.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Databases created successfully!${NC}"
    echo ""
    echo "Created databases:"
    echo "  - userdb"
    echo "  - orderdb"
    echo "  - billingdb"
    echo "  - iamdb"
else
    echo -e "${RED}✗ Failed to create databases${NC}"
    echo "You may need to run manually:"
    echo "  psql -U postgres -f setup-databases.sql"
    exit 1
fi

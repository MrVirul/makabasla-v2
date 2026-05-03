#!/bin/bash
# Centralized Test Runner for Makabasla v2 System Services

# Get the root directory (parent of this script's directory)
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# List of system services to test
SERVICES=(
    "appointment-service"
    "billing-service"
    "iam-service"
    "task-mgt-service"
    "webstore-service"
)

echo "========================================="
echo "🧪 Running Makabasla System Service Tests"
echo "========================================="

FAILED=0

for SERVICE in "${SERVICES[@]}"; do
    printf "[...] Testing %-20s " "$SERVICE..."
    if go test "$ROOT_DIR/backend-services/$SERVICE/internal/service/..." > /dev/null 2>&1; then
        echo "PASS"
    else
        echo "FAIL"
        FAILED=1
    fi
done

echo "========================================="
if [ $FAILED -eq 0 ]; then
    echo "✅ ALL SYSTEM SERVICES PASSED"
    exit 0
else
    echo "❌ SOME TESTS FAILED"
    exit 1
fi

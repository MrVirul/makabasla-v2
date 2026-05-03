# 🧪 System Service Tests

This folder centralizes the management and execution of unit tests for all microservices in the `backend-services` directory.

## 🏗️ Structure
Unit tests in this project are located within each service's `internal/service/` directory. This adheres to Go's best practices:
- **Package Access**: Tests can access unexported members (private logic).
- **Internal Scope**: Respects Go's `internal` directory restrictions, ensuring services remain decoupled.

## 🚀 How to Run Tests

### 1. Run All Tests (Recommended)
Use the root-level Makefile command:
```bash
make test
```
Or run the script directly:
```bash
./tests/run_tests.sh
```

### 2. Run a Specific Service Test
To test only a single service (e.g., `iam-service`):
```bash
go test ./backend-services/iam-service/internal/service/...
```

### 3. Run with Verbose Output
If a test fails and you want to see the details:
```bash
go test -v ./backend-services/billing-service/internal/service/...
```

## 📝 Adding New Tests
When adding new services or features:
1. Create a `*_test.go` file in the same package as your service logic.
2. If it's a new service, add its directory name to the `SERVICES` list in `tests/run_tests.sh`.

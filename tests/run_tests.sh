#!/bin/bash
# Runs the Go unit tests for every backend microservice.
#
# Tests live under backend-services/*/ and are executed via `go test` in
# each module's directory. The script exits non-zero if any package fails so
# it can be used by `make test` and CI.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="${ROOT}/backend-services"
FAILED=0

for module in api-gateway appointment-service billing-service iam-service task-mgt-service webstore-service shared; do
  if [ ! -d "${BACKEND}/${module}" ]; then
    echo "SKIP  ${module} (not found)"
    continue
  fi
  echo "==>   ${module}"
  if (cd "${BACKEND}/${module}" && go test ./...); then
    echo "PASS  ${module}"
  else
    echo "FAIL  ${module}"
    FAILED=1
  fi
  echo
done

if [ $FAILED -ne 0 ]; then
  echo "One or more test suites failed."
  exit 1
fi

echo "All tests passed."

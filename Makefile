.PHONY: test help

help:
	@echo "Makabasla v2 Management Commands:"
	@echo "  make test      Run all system service unit tests"

test:
	@chmod +x tests/run_tests.sh
	@./tests/run_tests.sh

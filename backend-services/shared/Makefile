# backend-services/shared Makefile

GOPATH=$(shell go env GOPATH)
PATH:=$(GOPATH)/bin:$(PATH)

.PHONY: protos clean help

help:
	@echo "Available commands:"
	@echo "  make protos   - Generate Go code from .proto files"
	@echo "  make clean    - Remove generated code"

protos:
	@echo "Generating Go code from protos..."
	@protoc --proto_path=proto \
		--go_out=pkg/pb --go_opt=paths=source_relative \
		--go-grpc_out=pkg/pb --go-grpc_opt=paths=source_relative \
		proto/common/common.proto \
		proto/billing/billing.proto
	@echo "Generation complete."

clean:
	@rm -rf pkg/pb/*
	@echo "Cleaned generated protos."

# syntax=docker/dockerfile:1
FROM golang:1.26-alpine AS build

WORKDIR /app

# Copy go mod and source files
COPY . .

# Initialize/tidy dependencies
# If proxy issues occur, you can add GOPROXY
RUN go env -w GOPROXY=https://proxy.golang.org,direct
RUN apk add --no-cache git
RUN go mod tidy

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o iam-service ./cmd/main.go

FROM alpine:latest

WORKDIR /app

# Copy the binary from the build stage
COPY --from=build /app/iam-service .

# Create a non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Expose the port
EXPOSE 8084

ENTRYPOINT ["./iam-service"]

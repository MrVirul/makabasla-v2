# syntax=docker/dockerfile:1
FROM golang:1.26-alpine AS build

WORKDIR /app

# Copy the entire backend-services directory to access the shared module
COPY . .

# Move into the billing-service directory to build it
WORKDIR /app/billing-service

RUN go env -w GOPROXY=https://proxy.golang.org,direct
RUN apk add --no-cache git
RUN go mod tidy

RUN CGO_ENABLED=0 GOOS=linux go build -o billing-service ./cmd/main.go

FROM alpine:latest

WORKDIR /app

# The built binary is located at /app/billing-service/billing-service
COPY --from=build /app/billing-service/billing-service .

RUN addgroup -S makabas && adduser -S makabas -G makabas
USER makabas:makabas

EXPOSE 8083

ENTRYPOINT ["./billing-service"]

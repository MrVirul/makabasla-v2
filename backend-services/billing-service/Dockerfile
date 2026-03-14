# syntax=docker/dockerfile:1
FROM golang:1.26-alpine AS build

WORKDIR /app

COPY . .

RUN go env -w GOPROXY=https://proxy.golang.org,direct
RUN apk add --no-cache git
RUN go mod tidy

RUN CGO_ENABLED=0 GOOS=linux go build -o billing-service ./cmd/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=build /app/billing-service .

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE 8083

ENTRYPOINT ["./billing-service"]

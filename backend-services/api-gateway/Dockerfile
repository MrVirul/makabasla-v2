# syntax=docker/dockerfile:1
FROM golang:1.26-alpine AS build

WORKDIR /app

COPY . .

RUN go env -w GOPROXY=https://proxy.golang.org,direct
RUN apk add --no-cache git
RUN go mod tidy

RUN CGO_ENABLED=0 GOOS=linux go build -o api-gateway ./cmd/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=build /app/api-gateway .

RUN addgroup -S makabas && adduser -S makabas -G makabas
USER makabas:makabas

EXPOSE 8080

ENTRYPOINT ["./api-gateway"]

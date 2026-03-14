import os
import shutil

services = [
    {"dir": "appointment-service", "port": "8085", "app_name": "APPOINTMENT-SERVICE", "pkg": "appointment", "db": "appointmentdb"},
    {"dir": "billing-service", "port": "8083", "app_name": "BILLING-SERVICE", "pkg": "billing", "db": "billingdb"},
    {"dir": "task-mgt-service", "port": "8086", "app_name": "TASK-MGT-SERVICE", "pkg": "task", "db": "taskdb"},
    {"dir": "webstore-service", "port": "8087", "app_name": "WEBSTORE-SERVICE", "pkg": "webstore", "db": "webstoredb"}
]

base_dir = "/Users/virul/Dev/makabasla-v2/backend-services"

for s in services:
    s_dir = os.path.join(base_dir, s["dir"])

    # 1. Clean existing Java/Maven files
    for item in ["src", "pom.xml", ".mvn", "mvnw", "mvnw.cmd", "target", ".gitkeep", ".gitignore", ".idea"]:
        item_path = os.path.join(s_dir, item)
        if os.path.exists(item_path):
            if os.path.isdir(item_path):
                shutil.rmtree(item_path)
            else:
                os.remove(item_path)

    # 2. Init go module manually since Go is not installed on host
    with open(os.path.join(s_dir, "go.mod"), "w") as f:
        f.write(f"module github.com/makabas/{s['dir']}\\n\\ngo 1.21\\n")

    # 3. Create directories
    os.makedirs("config", exist_ok=True)
    os.makedirs("internal/discovery", exist_ok=True)
    os.makedirs("internal/handler", exist_ok=True)
    os.makedirs("internal/repository", exist_ok=True)
    os.makedirs("internal/service", exist_ok=True)
    os.makedirs("cmd", exist_ok=True)

    # 4. config.go
    with open("config/config.go", "w") as f:
        f.write(f"""package config

import (
\t"log"
\t"strings"

\t"github.com/spf13/viper"
)

type Config struct {{
\tServerPort string `mapstructure:"SERVER_PORT"`
\tAppName    string `mapstructure:"APP_NAME"`
\tConsulHost string `mapstructure:"CONSUL_HOST"`
\tConsulPort string `mapstructure:"CONSUL_PORT"`
\tDBUrl      string `mapstructure:"SPRING_DATASOURCE_URL"`
\tDBUser     string `mapstructure:"SPRING_DATASOURCE_USERNAME"`
\tDBPassword string `mapstructure:"SPRING_DATASOURCE_PASSWORD"`
}}

func LoadConfig() *Config {{
\tviper.SetDefault("SERVER_PORT", "{s["port"]}")
\tviper.SetDefault("APP_NAME", "{s["app_name"]}")
\tviper.SetDefault("CONSUL_HOST", "consul")
\tviper.SetDefault("CONSUL_PORT", "8500")

\tviper.AutomaticEnv()
\tviper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

\tvar config Config
\tif err := viper.Unmarshal(&config); err != nil {{
\t\tlog.Fatalf("Unable to decode into struct, %v", err)
\t}}
\treturn &config
}}
""")

    # 5. discovery/consul.go
    with open("internal/discovery/consul.go", "w") as f:
        f.write(f"""package discovery

import (
\t"fmt"
\t"log"
\t"strconv"

\t"github.com/hashicorp/consul/api"
\t"github.com/makabas/{s["dir"]}/config"
)

type ConsulClient struct {{
\tclient    *api.Client
\tserviceID string
}}

func NewConsulClient(cfg *config.Config) (*ConsulClient, error) {{
\tconsulConfig := api.DefaultConfig()
\tconsulConfig.Address = fmt.Sprintf("%s:%s", cfg.ConsulHost, cfg.ConsulPort)

\tclient, err := api.NewClient(consulConfig)
\tif err != nil {{
\t\treturn nil, err
\t}}

\treturn &ConsulClient{{
\t\tclient: client,
\t}}, nil
}}

func (c *ConsulClient) Register(cfg *config.Config) error {{
\tport, err := strconv.Atoi(cfg.ServerPort)
\tif err != nil {{
\t\treturn fmt.Errorf("invalid server port: %v", err)
\t}}

\tc.serviceID = fmt.Sprintf("%s-%s", cfg.AppName, cfg.ServerPort)

\tregistration := &api.AgentServiceRegistration{{
\t\tID:      c.serviceID,
\t\tName:    cfg.AppName,
\t\tPort:    port,
\t\tAddress: cfg.AppName,
\t\tCheck: &api.AgentServiceCheck{{
\t\t\tHTTP:     fmt.Sprintf("http://%s:%d/actuator/health", cfg.AppName, port),
\t\t\tInterval: "10s",
\t\t\tTimeout:  "5s",
\t\t}},
\t}}

\tlog.Printf("Registering service %s with Consul", cfg.AppName)
\tif err := c.client.Agent().ServiceRegister(registration); err != nil {{
\t\treturn fmt.Errorf("failed to register to consul: %v", err)
\t}}

\tlog.Println("Service registered successfully")
\treturn nil
}}

func (c *ConsulClient) Deregister() error {{
\tlog.Printf("Deregistering service %s from Consul", c.serviceID)
\tif err := c.client.Agent().ServiceDeregister(c.serviceID); err != nil {{
\t\treturn fmt.Errorf("failed to deregister from consul: %v", err)
\t}}
\tlog.Println("Service deregistered successfully")
\treturn nil
}}
""")

    # 6. repository/repository.go
    with open(f"internal/repository/{s['pkg']}_repository.go", "w") as f:
        f.write(f"""package repository

type {s['pkg'].capitalize()}Repository interface {{
\tGetData() (string, error)
}}

type repository struct {{
}}

func New{s['pkg'].capitalize()}Repository() {s['pkg'].capitalize()}Repository {{
\treturn &repository{{}}
}}

func (r *repository) GetData() (string, error) {{
\treturn "{s['pkg']} data", nil
}}
""")

    # 7. service/service.go
    with open(f"internal/service/{s['pkg']}_service.go", "w") as f:
        f.write(f"""package service

import (
\t"fmt"
\t"github.com/makabas/{s['dir']}/internal/repository"
)

type {s['pkg'].capitalize()}Service interface {{
\tProcessData() (string, error)
}}

type service struct {{
\trepo repository.{s['pkg'].capitalize()}Repository
}}

func New{s['pkg'].capitalize()}Service(repo repository.{s['pkg'].capitalize()}Repository) {s['pkg'].capitalize()}Service {{
\treturn &service{{
\t\trepo: repo,
\t}}
}}

func (s *service) ProcessData() (string, error) {{
\tdata, err := s.repo.GetData()
\tif err != nil {{
\t\treturn "", fmt.Errorf("failed: %w", err)
\t}}
\treturn fmt.Sprintf("Processed: %s", data), nil
}}
""")

    # 8. handler/handler.go
    with open(f"internal/handler/{s['pkg']}_handler.go", "w") as f:
        f.write(f"""package handler

import (
\t"net/http"

\t"github.com/labstack/echo/v4"
\t"github.com/makabas/{s['dir']}/internal/service"
)

type {s['pkg'].capitalize()}Handler struct {{
\tsrv service.{s['pkg'].capitalize()}Service
}}

func New{s['pkg'].capitalize()}Handler(srv service.{s['pkg'].capitalize()}Service) *{s['pkg'].capitalize()}Handler {{
\treturn &{s['pkg'].capitalize()}Handler{{
\t\tsrv: srv,
\t}}
}}

func (h *{s['pkg'].capitalize()}Handler) HealthCheck(c echo.Context) error {{
\treturn c.JSON(http.StatusOK, map[string]string{{
\t\t"status": "UP",
\t}})
}}

func (h *{s['pkg'].capitalize()}Handler) GetData(c echo.Context) error {{
\tinfo, err := h.srv.ProcessData()
\tif err != nil {{
\t\treturn echo.NewHTTPError(http.StatusInternalServerError, err.Error())
\t}}

\treturn c.JSON(http.StatusOK, map[string]string{{
\t\t"info": info,
\t}})
}}

func (h *{s['pkg'].capitalize()}Handler) RegisterRoutes(e *echo.Echo) {{
\te.GET("/actuator/health", h.HealthCheck)
\te.GET("/api/v1/{s['pkg']}", h.GetData)
}}
""")

    # 9. cmd/main.go
    with open("cmd/main.go", "w") as f:
        f.write(f"""package main

import (
\t"context"
\t"log"
\t"net/http"
\t"os"
\t"os/signal"
\t"syscall"
\t"time"

\t"github.com/labstack/echo/v4"
\t"github.com/labstack/echo/v4/middleware"
\t"github.com/makabas/{s['dir']}/config"
\t"github.com/makabas/{s['dir']}/internal/discovery"
\t"github.com/makabas/{s['dir']}/internal/handler"
\t"github.com/makabas/{s['dir']}/internal/repository"
\t"github.com/makabas/{s['dir']}/internal/service"
)

func main() {{
\tcfg := config.LoadConfig()

\tconsulClient, err := discovery.NewConsulClient(cfg)
\tif err != nil {{
\t\tlog.Fatalf("Warning: failed to initialize consul client: %v", err)
\t}}

\tif err := consulClient.Register(cfg); err != nil {{
\t\tlog.Printf("Warning: failed to register with consul: %v", err)
\t}}

\trepo := repository.New{s['pkg'].capitalize()}Repository()
\tsvc := service.New{s['pkg'].capitalize()}Service(repo)
\th := handler.New{s['pkg'].capitalize()}Handler(svc)

\te := echo.New()
\te.Use(middleware.Logger())
\te.Use(middleware.Recover())

\th.RegisterRoutes(e)

\tquit := make(chan os.Signal, 1)
\tsignal.Notify(quit, os.Interrupt, syscall.SIGTERM)

\tgo func() {{
\t\tif err := e.Start(":" + cfg.ServerPort); err != nil && err != http.ErrServerClosed {{
\t\t\te.Logger.Fatal("Shutting down the server")
\t\t}}
\t}}()

\t<-quit
\tlog.Println("Received termination signal, shutting down gracefully...")

\tif err := consulClient.Deregister(); err != nil {{
\t\tlog.Printf("Failed to deregister from consul: %v", err)
\t}}

\tctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
\tdefer cancel()

\tif err := e.Shutdown(ctx); err != nil {{
\t\te.Logger.Fatal(err)
\t}}
}}
""")

    # 10. Dockerfile
    with open("Dockerfile", "w") as f:
        f.write(f"""# syntax=docker/dockerfile:1
FROM golang:1.21-alpine AS build

WORKDIR /app

COPY . .

RUN go env -w GOPROXY=direct
RUN go mod tidy

RUN CGO_ENABLED=0 GOOS=linux go build -o {s['dir']} ./cmd/main.go

FROM alpine:latest

WORKDIR /app

COPY --from=build /app/{s['dir']} .

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

EXPOSE {s['port']}

ENTRYPOINT ["./{s['dir']}"]
""")

    # Skip go mod tidy since it runs in docker

print("Migration scripts completed successfully.")

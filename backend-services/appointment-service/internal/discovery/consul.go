package discovery

import (
	"fmt"
	"log"
	"strconv"

	"github.com/hashicorp/consul/api"
	"github.com/makabas/appointment-service/config"
)

type ConsulClient struct {
	client    *api.Client
	serviceID string
}

func NewConsulClient(cfg *config.Config) (*ConsulClient, error) {
	consulConfig := api.DefaultConfig()
	consulConfig.Address = fmt.Sprintf("%s:%s", cfg.ConsulHost, cfg.ConsulPort)

	client, err := api.NewClient(consulConfig)
	if err != nil {
		return nil, err
	}

	return &ConsulClient{
		client: client,
	}, nil
}

func (c *ConsulClient) Register(cfg *config.Config) error {
	port, err := strconv.Atoi(cfg.ServerPort)
	if err != nil {
		return fmt.Errorf("invalid server port: %v", err)
	}

	c.serviceID = fmt.Sprintf("%s-%s", cfg.AppName, cfg.ServerPort)

	registration := &api.AgentServiceRegistration{
		ID:      c.serviceID,
		Name:    cfg.AppName,
		Port:    port,
		Address: cfg.AppName,
		Check: &api.AgentServiceCheck{
			HTTP:     fmt.Sprintf("http://%s:%d/actuator/health", cfg.AppName, port),
			Interval: "10s",
			Timeout:  "5s",
		},
	}

	log.Printf("Registering service %s with Consul", cfg.AppName)
	if err := c.client.Agent().ServiceRegister(registration); err != nil {
		return fmt.Errorf("failed to register to consul: %v", err)
	}

	log.Println("Service registered successfully")
	return nil
}

func (c *ConsulClient) Deregister() error {
	log.Printf("Deregistering service %s from Consul", c.serviceID)
	if err := c.client.Agent().ServiceDeregister(c.serviceID); err != nil {
		return fmt.Errorf("failed to deregister from consul: %v", err)
	}
	log.Println("Service deregistered successfully")
	return nil
}

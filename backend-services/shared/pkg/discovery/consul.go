package discovery

import (
	"fmt"
	"log"
	"strconv"

	"github.com/hashicorp/consul/api"
)

// RegistryConfig defines the configuration for service registration.
type RegistryConfig struct {
	AppName    string
	AppAddress string
	AppPort    string
	ConsulHost string
	ConsulPort string
}

// Registry defines the interface for service discovery systems.
type Registry interface {
	Register(cfg RegistryConfig) error
	Deregister() error
	ResolveService(name string) ([]*api.ServiceEntry, error)
}

type consulRegistry struct {
	client    *api.Client
	serviceID string
}

// NewConsulRegistry creates a new Consul-based registry.
func NewConsulRegistry(host, port string) (Registry, error) {
	config := api.DefaultConfig()
	config.Address = fmt.Sprintf("%s:%s", host, port)

	client, err := api.NewClient(config)
	if err != nil {
		return nil, fmt.Errorf("failed to create consul client: %w", err)
	}

	return &consulRegistry{
		client: client,
	}, nil
}

func (r *consulRegistry) Register(cfg RegistryConfig) error {
	port, err := strconv.Atoi(cfg.AppPort)
	if err != nil {
		return fmt.Errorf("invalid app port: %v", err)
	}

	r.serviceID = fmt.Sprintf("%s-%s", cfg.AppName, cfg.AppPort)

	registration := &api.AgentServiceRegistration{
		ID:      r.serviceID,
		Name:    cfg.AppName,
		Port:    port,
		Address: cfg.AppAddress,
		Check: &api.AgentServiceCheck{
			HTTP:     fmt.Sprintf("http://%s:%d/health", cfg.AppAddress, port),
			Interval: "10s",
			Timeout:  "5s",
		},
	}

	log.Printf("Registering service %s with Consul...", cfg.AppName)
	return r.client.Agent().ServiceRegister(registration)
}

func (r *consulRegistry) Deregister() error {
	if r.serviceID == "" {
		return nil
	}
	log.Printf("Deregistering service %s from Consul...", r.serviceID)
	return r.client.Agent().ServiceDeregister(r.serviceID)
}

func (r *consulRegistry) ResolveService(name string) ([]*api.ServiceEntry, error) {
	entries, _, err := r.client.Health().Service(name, "", true, nil)
	return entries, err
}

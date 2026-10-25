package discovery

import (
	"fmt"
	"log"
	"net"
	"strconv"
	"sync"
	"time"
)

// Target is a resolved service instance.
type Target struct {
	Host string
	Port int
	Meta map[string]string
}

// HostPort renders the target as a "host:port" dial address.
func (t Target) HostPort() string {
	return net.JoinHostPort(t.Host, strconv.Itoa(t.Port))
}

// URL renders the target as a base URL with the given scheme.
func (t Target) URL(scheme string) string {
	return fmt.Sprintf("%s://%s", scheme, t.HostPort())
}

// MetaPort reads a port published in the service registration metadata.
func (t Target) MetaPort(key string) (int, bool) {
	raw, ok := t.Meta[key]
	if !ok {
		return 0, false
	}
	port, err := strconv.Atoi(raw)
	if err != nil {
		return 0, false
	}
	return port, true
}

// Resolver looks up service instances in Consul and caches the result for a
// short period.
//
// When Consul has no healthy instance for a service the resolver falls back to
// a statically configured address, so a gateway can still route requests in an
// environment where the Consul agent is unavailable. The fallback is logged so
// a misconfigured registry does not fail silently.
type Resolver struct {
	registry Registry
	fallback map[string]string
	ttl      time.Duration

	mu    sync.RWMutex
	cache map[string]cachedTarget
}

type cachedTarget struct {
	target    Target
	fetchedAt time.Time
}

// NewResolver creates a Resolver. The fallback map maps a service name to a
// "host:port" address used when Consul cannot supply one.
func NewResolver(registry Registry, fallback map[string]string) *Resolver {
	copied := make(map[string]string, len(fallback))
	for k, v := range fallback {
		copied[k] = v
	}
	return &Resolver{
		registry: registry,
		fallback: copied,
		ttl:      10 * time.Second,
		cache:    make(map[string]cachedTarget),
	}
}

// SetTTL changes how long a resolved address is reused before Consul is
// consulted again.
func (r *Resolver) SetTTL(ttl time.Duration) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.ttl = ttl
}

// Resolve returns the address of a healthy instance of the named service.
func (r *Resolver) Resolve(name string) (Target, error) {
	r.mu.RLock()
	cached, ok := r.cache[name]
	ttl := r.ttl
	r.mu.RUnlock()

	if ok && time.Since(cached.fetchedAt) < ttl {
		return cached.target, nil
	}

	target, err := r.resolveFromConsul(name)
	if err != nil {
		fallback, ok := r.fallback[name]
		if !ok {
			return Target{}, fmt.Errorf("service %q: %w and no fallback address configured", name, err)
		}
		log.Printf("Service discovery: falling back to %s for %q (%v)", fallback, name, err)
		host, port, parseErr := splitHostPort(fallback)
		if parseErr != nil {
			return Target{}, parseErr
		}
		target = Target{Host: host, Port: port}
	}

	r.mu.Lock()
	r.cache[name] = cachedTarget{target: target, fetchedAt: time.Now()}
	r.mu.Unlock()

	return target, nil
}

// Invalidate drops the cached address for a service so the next Resolve call
// queries Consul again.
func (r *Resolver) Invalidate(name string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	delete(r.cache, name)
}

func (r *Resolver) resolveFromConsul(name string) (Target, error) {
	if r.registry == nil {
		return Target{}, fmt.Errorf("no registry configured")
	}

	entries, err := r.registry.ResolveService(name)
	if err != nil {
		return Target{}, fmt.Errorf("consul lookup failed: %w", err)
	}
	if len(entries) == 0 {
		return Target{}, fmt.Errorf("no healthy instances registered")
	}

	entry := entries[0]
	meta := map[string]string{}
	for k, v := range entry.Service.Meta {
		meta[k] = v
	}

	return Target{
		Host: entry.Service.Address,
		Port: entry.Service.Port,
		Meta: meta,
	}, nil
}

// splitHostPort parses a "host:port" address, tolerating a missing port.
func splitHostPort(address string) (string, int, error) {
	host, portStr, err := net.SplitHostPort(address)
	if err != nil {
		return "", 0, fmt.Errorf("invalid address %q: %w", address, err)
	}
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return "", 0, fmt.Errorf("invalid port in address %q: %w", address, err)
	}
	return host, port, nil
}

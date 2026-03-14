package config

import (
	"log"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	ServerPort string `mapstructure:"SERVER_PORT"`
	AppName    string `mapstructure:"APP_NAME"`
	ConsulHost string `mapstructure:"CONSUL_HOST"`
	ConsulPort string `mapstructure:"CONSUL_PORT"`
	Username   string `mapstructure:"SECURITY_USER_NAME"`
	Password   string `mapstructure:"SECURITY_USER_PASSWORD"`
}

func LoadConfig() *Config {
	viper.SetDefault("SERVER_PORT", "8084")
	viper.SetDefault("APP_NAME", "IAM-SERVICE")
	viper.SetDefault("CONSUL_HOST", "consul")
	viper.SetDefault("CONSUL_PORT", "8500")
	viper.SetDefault("SECURITY_USER_NAME", "admin")
	viper.SetDefault("SECURITY_USER_PASSWORD", "password")

	viper.AutomaticEnv()
	// Allow mapping env vars like CONSUL_HOST
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		log.Fatalf("Unable to decode into struct, %v", err)
	}
	return &config
}

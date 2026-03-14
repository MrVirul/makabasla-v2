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
	DBUrl      string `mapstructure:"SPRING_DATASOURCE_URL"`
	DBUser     string `mapstructure:"SPRING_DATASOURCE_USERNAME"`
	DBPassword string `mapstructure:"SPRING_DATASOURCE_PASSWORD"`
}

func LoadConfig() *Config {
	viper.SetDefault("SERVER_PORT", "8083")
	viper.SetDefault("APP_NAME", "BILLING-SERVICE")
	viper.SetDefault("CONSUL_HOST", "consul")
	viper.SetDefault("CONSUL_PORT", "8500")

	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		log.Fatalf("Unable to decode into struct, %v", err)
	}
	return &config
}

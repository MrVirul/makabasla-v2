package config

import (
	"log"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	ServerPort string `mapstructure:"SERVER_PORT"`
	AppName    string `mapstructure:"APP_NAME"`
	JwtSecret  string `mapstructure:"JWT_SECRET"`
}

func LoadConfig() *Config {
	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("APP_NAME", "api-gateway")
	viper.SetDefault("JWT_SECRET", "your-256-bit-secret-key-here-change-in-production-make-it-at-least-32-characters-long")

	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		log.Fatalf("Unable to decode config into struct: %v", err)
	}
	return &config
}

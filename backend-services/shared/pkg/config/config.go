package config

import (
	"log"
	"strings"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

// BaseConfig contains fields common to all services.
type BaseConfig struct {
	ServerPort string `mapstructure:"SERVER_PORT"`
	AppName    string `mapstructure:"APP_NAME"`
	ConsulHost string `mapstructure:"CONSUL_HOST"`
	ConsulPort string `mapstructure:"CONSUL_PORT"`
	Env        string `mapstructure:"ENV"`
}

// Load loads the configuration into the target struct.
// It reads from .env files and environment variables.
func Load(target interface{}) error {
	_ = godotenv.Load() // Ignore error if .env doesn't exist.

	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	// Set defaults.
	viper.SetDefault("SERVER_PORT", "8080")
	viper.SetDefault("CONSUL_HOST", "consul")
	viper.SetDefault("CONSUL_PORT", "8500")
	viper.SetDefault("ENV", "local")

	if err := viper.Unmarshal(target); err != nil {
		log.Printf("Unable to decode into struct, %v", err)
		return err
	}

	return nil
}

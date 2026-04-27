package database

import (
	"log"
	"time"

	"github.com/makabas/webstore-service/config"
	"github.com/makabas/webstore-service/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func NewDatabase(cfg *config.Config) (*gorm.DB, error) {
	// GORM logger configuration
	gormLogger := logger.Default.LogMode(logger.Info) // You can change this based on environment

	db, err := gorm.Open(postgres.Open(cfg.DBUrl), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		return nil, err
	}

	// Connection Pool Settings
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	if err := db.AutoMigrate(&models.Product{}, &models.Order{}); err != nil {
		log.Printf("Warning: failed to auto-migrate models: %v", err)
	}

	log.Printf("Successfully connected to database for %s", cfg.AppName)

	return db, nil
}

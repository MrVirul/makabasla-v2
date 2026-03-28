package database

import (
	"log"
	"time"

	"github.com/makabas/iam-service/config"
	"github.com/makabas/iam-service/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func NewDatabase(cfg *config.Config) (*gorm.DB, error) {
	gormLogger := logger.Default.LogMode(logger.Info)

	db, err := gorm.Open(postgres.Open(cfg.DBUrl), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		return nil, err
	}

	// AutoMigrate models
	err = db.AutoMigrate(&models.Customer{}, &models.Vehicle{}, &models.Admin{}, &models.Technician{}, &models.Staff{})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	log.Printf("Successfully connected to database for %s", cfg.AppName)

	return db, nil
}

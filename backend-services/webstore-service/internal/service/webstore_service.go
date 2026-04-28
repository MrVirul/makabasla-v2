package service

import (
	"fmt"
	"log"
	"time"

	"github.com/makabas/webstore-service/internal/models"
	"github.com/makabas/webstore-service/internal/repository"
)

type WebstoreService interface {
	GetAllProducts() ([]models.Product, error)
	SearchProducts(query string) ([]models.Product, error)
	CreateProduct(p *models.Product) error
	UpdateProduct(p *models.Product) error
	DeleteProduct(id uint) error
	BuyProduct(id uint, quantity int) error
	GetAnalytics() (map[string]interface{}, error)
}

type service struct {
	repo repository.WebstoreRepository
}

func NewWebstoreService(repo repository.WebstoreRepository) WebstoreService {
	return &service{
		repo: repo,
	}
}

func (s *service) GetAllProducts() ([]models.Product, error) {
	return s.repo.GetAllProducts()
}

func (s *service) CreateProduct(p *models.Product) error {
	return s.repo.CreateProduct(p)
}

func (s *service) UpdateProduct(p *models.Product) error {
	return s.repo.UpdateProduct(p)
}

func (s *service) DeleteProduct(id uint) error {
	return s.repo.DeleteProduct(id)
}

func (s *service) SearchProducts(query string) ([]models.Product, error) {
	return s.repo.SearchProducts(query)
}

func (s *service) GetAnalytics() (map[string]interface{}, error) {
	return s.repo.GetAnalytics()
}

func (s *service) BuyProduct(id uint, quantity int) error {
	p, err := s.repo.GetProductByID(id)
	if err != nil {
		return err
	}

	if p.Stock < quantity {
		return fmt.Errorf("insufficient stock")
	}

	p.Stock -= quantity
	err = s.repo.UpdateProduct(p)
	if err != nil {
		return err
	}

	order := &models.Order{
		ProductID: p.ID,
		Quantity:  quantity,
		Total:     float64(quantity) * p.Price,
		CreatedAt: time.Now(),
	}
	err = s.repo.CreateOrder(order)
	if err != nil {
		return err
	}

	// Trigger low stock alert notification immediately on threshold breach!
	if p.Stock <= 5 {
		log.Printf("⚠️  ALERT: Low-stock notification sent for Product '%s' (ID: %d). Remaining stock: %d\n", p.Name, p.ID, p.Stock)
	}

	return nil
}

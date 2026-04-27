package repository

import (
	"strconv"

	"github.com/makabas/webstore-service/internal/models"
	"gorm.io/gorm"
)

type WebstoreRepository interface {
	GetAllProducts() ([]models.Product, error)
	SearchProducts(query string) ([]models.Product, error)
	GetProductByID(id uint) (*models.Product, error)
	CreateProduct(p *models.Product) error
	UpdateProduct(p *models.Product) error
	DeleteProduct(id uint) error
	CreateOrder(order *models.Order) error
	GetAnalytics() (map[string]interface{}, error)
}

type repository struct {
	db *gorm.DB
}

func NewWebstoreRepository(db *gorm.DB) WebstoreRepository {
	return &repository{db: db}
}

func (r *repository) GetAllProducts() ([]models.Product, error) {
	var products []models.Product
	err := r.db.Find(&products).Error
	return products, err
}

func (r *repository) CreateProduct(p *models.Product) error {
	return r.db.Create(p).Error
}

func (r *repository) UpdateProduct(p *models.Product) error {
	return r.db.Save(p).Error
}

func (r *repository) DeleteProduct(id uint) error {
	return r.db.Delete(&models.Product{}, id).Error
}

func (r *repository) SearchProducts(query string) ([]models.Product, error) {
	var products []models.Product
	idQuery, _ := strconv.Atoi(query)

	err := r.db.Where("name ILIKE ? OR category ILIKE ? OR id = ?", "%"+query+"%", "%"+query+"%", idQuery).Find(&products).Error
	return products, err
}

func (r *repository) GetProductByID(id uint) (*models.Product, error) {
	var product models.Product
	err := r.db.First(&product, id).Error
	return &product, err
}

func (r *repository) CreateOrder(order *models.Order) error {
	return r.db.Create(order).Error
}

func (r *repository) GetAnalytics() (map[string]interface{}, error) {
	var totalRevenue float64
	var totalItemsSold int
	var lowStockItems int64
	var activeProducts int64

	r.db.Model(&models.Order{}).Select("COALESCE(SUM(total), 0)").Scan(&totalRevenue)
	r.db.Model(&models.Order{}).Select("COALESCE(SUM(quantity), 0)").Scan(&totalItemsSold)
	r.db.Model(&models.Product{}).Where("stock <= ?", 5).Count(&lowStockItems)
	r.db.Model(&models.Product{}).Count(&activeProducts)

	return map[string]interface{}{
		"totalRevenue":   totalRevenue,
		"totalItemsSold": totalItemsSold,
		"lowStockItems":  lowStockItems,
		"activeProducts": activeProducts,
	}, nil
}

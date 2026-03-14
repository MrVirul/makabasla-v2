package service

import (
	"fmt"
	"github.com/makabas/iam-service/internal/repository"
)

type IamService interface {
	GetUserInfo(username string) (string, error)
}

type iamService struct {
	repo repository.IamRepository
}

func NewIamService(repo repository.IamRepository) IamService {
	return &iamService{
		repo: repo,
	}
}

func (s *iamService) GetUserInfo(username string) (string, error) {
	user, err := s.repo.GetUser(username)
	if err != nil {
		return "", fmt.Errorf("failed to retrieve user: %w", err)
	}

	return fmt.Sprintf("User info for: %s", user), nil
}

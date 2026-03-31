package handler

import (
	"context"

	"github.com/makabas/billing-service/internal/models"
	billingpb "github.com/makabas/shared/pkg/pb/billing"
	"github.com/makabas/billing-service/internal/service"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type BillingHandler struct {
	billingpb.UnimplementedBillingServiceServer
	srv service.BillingService
}

func NewBillingHandler(srv service.BillingService) *BillingHandler {
	return &BillingHandler{
		srv: srv,
	}
}

func (h *BillingHandler) CreateBilling(_ context.Context, req *billingpb.CreateBillingRequest) (*billingpb.CreateBillingResponse, error) {
	if req == nil {
		return nil, status.Error(codes.InvalidArgument, "request is required")
	}

	billing := mapCreateBillingRequest(req)
	if err := h.srv.CreateBilling(billing); err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create billing: %v", err)
	}

	return &billingpb.CreateBillingResponse{
		Id: billing.ID,
	}, nil
}

func mapCreateBillingRequest(req *billingpb.CreateBillingRequest) *models.Billing {
	return &models.Billing{
		ID:            req.GetId(),
		VehicleID:     uint(req.GetVehicleId()),
		ExpenseCost:   req.GetExpenseCost(),
		AdvanceIncome: req.GetAdvanceIncome(),
		TotalExpenses: req.GetTotalExpenses(),
		TotalAdvance:  req.GetTotalAdvance(),
		Balance:       req.GetBalance(),
	}
}

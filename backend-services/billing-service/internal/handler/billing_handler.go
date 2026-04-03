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

func (h *BillingHandler) GetBilling(_ context.Context, req *billingpb.GetBillingRequest) (*billingpb.Billing, error) {
	billing, err := h.srv.GetBillingByVehicleID(uint(req.GetVehicleId()))
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "billing not found: %v", err)
	}
	return mapToPbBilling(billing), nil
}

func (h *BillingHandler) CreateBilling(_ context.Context, req *billingpb.CreateBillingRequest) (*billingpb.Billing, error) {
	billing, err := h.srv.CreateBilling(uint(req.GetVehicleId()))
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to create billing: %v", err)
	}
	return mapToPbBilling(billing), nil
}

func (h *BillingHandler) AddExpense(_ context.Context, req *billingpb.AddExpenseRequest) (*billingpb.Billing, error) {
	billing, err := h.srv.AddExpense(uint(req.GetVehicleId()), req.GetDate(), req.GetDescription(), req.GetAmount())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to add expense: %v", err)
	}
	return mapToPbBilling(billing), nil
}

func (h *BillingHandler) AddAdvance(_ context.Context, req *billingpb.AddAdvanceRequest) (*billingpb.Billing, error) {
	billing, err := h.srv.AddAdvance(uint(req.GetVehicleId()), req.GetDate(), req.GetDescription(), req.GetAmount())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to add advance: %v", err)
	}
	return mapToPbBilling(billing), nil
}

func (h *BillingHandler) DeleteBilling(_ context.Context, req *billingpb.DeleteBillingRequest) (*billingpb.DeleteResponse, error) {
	err := h.srv.DeleteBillingByVehicleID(uint(req.GetVehicleId()))
	if err != nil {
		return nil, status.Errorf(codes.Internal, "failed to delete billing: %v", err)
	}
	return &billingpb.DeleteResponse{Success: true}, nil
}

func mapToPbBilling(b *models.Billing) *billingpb.Billing {
	expenses := make([]*billingpb.Expense, len(b.Expenses))
	for i, e := range b.Expenses {
		expenses[i] = &billingpb.Expense{
			Id:          e.ID,
			Date:        e.Date,
			Description: e.Description,
			Amount:      e.Amount,
		}
	}

	advances := make([]*billingpb.Advance, len(b.Advances))
	for i, a := range b.Advances {
		advances[i] = &billingpb.Advance{
			Id:          a.ID,
			Date:        a.Date,
			Description: a.Description,
			Amount:      a.Amount,
		}
	}

	return &billingpb.Billing{
		Id:            b.ID,
		VehicleId:     uint32(b.VehicleID),
		Expenses:      expenses,
		Advances:      advances,
		TotalExpenses: b.TotalExpenses,
		TotalAdvances: b.TotalAdvances,
		BalanceDue:    b.BalanceDue,
		CreatedAt:     b.CreatedAt.String(),
		UpdatedAt:     b.UpdatedAt.String(),
	}
}

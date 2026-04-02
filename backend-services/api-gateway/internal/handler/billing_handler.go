package handler

import (
	"context"
	"io"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	billingpb "github.com/makabas/shared/pkg/pb/billing"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

type BillingHandler struct {
	billingClient   billingpb.BillingServiceClient
	billingRestBase string
}

func NewBillingHandler(billingServiceAddr string, billingRestBase string) *BillingHandler {
	conn, err := grpc.Dial(billingServiceAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil
	}
	return &BillingHandler{
		billingClient:   billingpb.NewBillingServiceClient(conn),
		billingRestBase: billingRestBase,
	}
}

func (h *BillingHandler) GetBilling(c echo.Context) error {
	vehicleID, err := strconv.ParseUint(c.Param("vehicleId"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid vehicle ID")
	}

	res, err := h.billingClient.GetBilling(context.Background(), &billingpb.GetBillingRequest{
		VehicleId: uint32(vehicleID),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusNotFound, "Billing not found")
	}

	return c.JSON(http.StatusOK, res)
}

// GetAllBillings proxies to the billing-service internal REST monitoring endpoint.
func (h *BillingHandler) GetAllBillings(c echo.Context) error {
	resp, err := http.Get(h.billingRestBase + "/api/v1/internal/billings")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadGateway, "billing monitoring service unavailable")
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, "failed to read billing data")
	}

	return c.JSONBlob(resp.StatusCode, body)
}

func (h *BillingHandler) StartBilling(c echo.Context) error {
	vehicleID, err := strconv.ParseUint(c.Param("vehicleId"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid vehicle ID")
	}

	res, err := h.billingClient.CreateBilling(context.Background(), &billingpb.CreateBillingRequest{
		VehicleId: uint32(vehicleID),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusCreated, res)
}

func (h *BillingHandler) AddExpense(c echo.Context) error {
	vehicleID, err := strconv.ParseUint(c.Param("vehicleId"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid vehicle ID")
	}

	var req struct {
		Date        string  `json:"date"`
		Description string  `json:"description"`
		Amount      float64 `json:"amount"`
	}
	if err := c.Bind(&req); err != nil {
		return err
	}

	res, err := h.billingClient.AddExpense(context.Background(), &billingpb.AddExpenseRequest{
		VehicleId:   uint32(vehicleID),
		Date:        req.Date,
		Description: req.Description,
		Amount:      req.Amount,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, res)
}

func (h *BillingHandler) AddAdvance(c echo.Context) error {
	vehicleID, err := strconv.ParseUint(c.Param("vehicleId"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid vehicle ID")
	}

	var req struct {
		Date        string  `json:"date"`
		Description string  `json:"description"`
		Amount      float64 `json:"amount"`
	}
	if err := c.Bind(&req); err != nil {
		return err
	}

	res, err := h.billingClient.AddAdvance(context.Background(), &billingpb.AddAdvanceRequest{
		VehicleId:   uint32(vehicleID),
		Date:        req.Date,
		Description: req.Description,
		Amount:      req.Amount,
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, res)
}

func (h *BillingHandler) DeleteBilling(c echo.Context) error {
	vehicleID, err := strconv.ParseUint(c.Param("vehicleId"), 10, 32)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "Invalid vehicle ID")
	}

	res, err := h.billingClient.DeleteBilling(context.Background(), &billingpb.DeleteBillingRequest{
		VehicleId: uint32(vehicleID),
	})
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, res)
}

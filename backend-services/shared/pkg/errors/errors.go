package errors

import (
	"fmt"
	"net/http"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

// AppError represents a generic application error.
type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

func (e *AppError) Error() string {
	return e.Message
}

// Common error types.
var (
	ErrNotFound      = &AppError{Code: http.StatusNotFound, Message: "Resource not found"}
	ErrUnauthorized  = &AppError{Code: http.StatusUnauthorized, Message: "Unauthorized access"}
	ErrInternal      = &AppError{Code: http.StatusInternalServerError, Message: "Internal server error"}
	ErrBadRequest    = &AppError{Code: http.StatusBadRequest, Message: "Invalid request"}
)

// New creates a new application error.
func New(code int, format string, args ...interface{}) *AppError {
	return &AppError{
		Code:    code,
		Message: fmt.Sprintf(format, args...),
	}
}

// ToGRPCStatus converts an AppError to a gRPC status.
func (e *AppError) ToGRPCStatus() *status.Status {
	var gCode codes.Code
	switch e.Code {
	case http.StatusNotFound:
		gCode = codes.NotFound
	case http.StatusUnauthorized:
		gCode = codes.Unauthenticated
	case http.StatusBadRequest:
		gCode = codes.InvalidArgument
	default:
		gCode = codes.Internal
	}
	return status.New(gCode, e.Message)
}

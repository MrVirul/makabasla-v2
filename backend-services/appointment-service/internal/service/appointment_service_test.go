package service

import (
	"errors"
	"testing"
)

// Mock repository
type mockAppointmentRepo struct {
	getDataFunc func() (string, error)
}

func (m *mockAppointmentRepo) GetData() (string, error) {
	return m.getDataFunc()
}

func TestAppointmentService_ProcessData(t *testing.T) {
	t.Run("Scenario: Processing appointment data", func(t *testing.T) {
		tests := []struct {
			name      string
			mockData  string
			mockErr   error
			want      string
			wantErr   bool
		}{
			{
				name:     "Success: Format raw data with prefix",
				mockData: "sample-appointment",
				mockErr:  nil,
				want:     "Processed: sample-appointment",
				wantErr:  false,
			},
			{
				name:     "Failure: Repository returns connection error",
				mockData: "",
				mockErr:  errors.New("connection reset"),
				want:     "",
				wantErr:  true,
			},
		}

		for _, tt := range tests {
			t.Run(tt.name, func(t *testing.T) {
				// Arrange
				mockRepo := &mockAppointmentRepo{
					getDataFunc: func() (string, error) {
						return tt.mockData, tt.mockErr
					},
				}
				svc := NewAppointmentService(mockRepo)

				// Act
				got, err := svc.ProcessData()

				// Assert
				if (err != nil) != tt.wantErr {
					t.Errorf("ProcessData() unexpected error state: got error=%v, wantErr=%v", err, tt.wantErr)
					return
				}
				if got != tt.want {
					t.Errorf("ProcessData() output mismatch: got=%q, want=%q", got, tt.want)
				}
			})
		}
	})
}


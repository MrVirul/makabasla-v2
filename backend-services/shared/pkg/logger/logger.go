package logger

import (
	// "os"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var Log *zap.Logger

// Init initializes a global zap logger with service context.
func Init(serviceName string, env string) {
	config := zap.NewProductionConfig()

	if env == "development" || env == "local" || env == "" {
		config = zap.NewDevelopmentConfig()
		config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
	}

	config.InitialFields = map[string]interface{}{
		"service": serviceName,
		"env":     env,
	}

	var err error
	Log, err = config.Build()
	if err != nil {
		panic(err)
	}

	zap.ReplaceGlobals(Log)
}

// Info logs an informational message.
func Info(msg string, fields ...zap.Field) {
	Log.Info(msg, fields...)
}

// Error logs an error message.
func Error(msg string, fields ...zap.Field) {
	Log.Error(msg, fields...)
}

// Fatal logs a fatal message and exits.
func Fatal(msg string, fields ...zap.Field) {
	Log.Fatal(msg, fields...)
}

// Sync flushes the logger.
func Sync() {
	_ = Log.Sync()
}

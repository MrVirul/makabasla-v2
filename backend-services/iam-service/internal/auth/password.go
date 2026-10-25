package auth

import (
	"crypto/subtle"
	"errors"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

// BcryptCost is the work factor used for newly hashed passwords.
const BcryptCost = 10

// ErrEmptyPassword is returned when a password is required but missing.
var ErrEmptyPassword = errors.New("password must not be empty")

// HashPassword returns a bcrypt hash of the plaintext password.
func HashPassword(plain string) (string, error) {
	if plain == "" {
		return "", ErrEmptyPassword
	}
	hashed, err := bcrypt.GenerateFromPassword([]byte(plain), BcryptCost)
	if err != nil {
		return "", err
	}
	return string(hashed), nil
}

// VerifyPassword checks a plaintext password against a stored credential.
//
// The stored value is normally a bcrypt hash. Legacy rows that still hold a
// plaintext password are accepted so existing accounts keep working, but they
// are reported as needing a rehash so the caller can upgrade them in place.
//
// It returns whether the password matched and whether the stored credential
// should be rewritten as a bcrypt hash. A stored credential that is empty
// never matches: those accounts authenticate through an external provider
// (Google OAuth) and must not be reachable with an arbitrary password.
func VerifyPassword(stored, plain string) (ok bool, needsRehash bool) {
	if stored == "" || plain == "" {
		return false, false
	}

	if IsBcryptHash(stored) {
		if err := bcrypt.CompareHashAndPassword([]byte(stored), []byte(plain)); err != nil {
			return false, false
		}
		cost, err := bcrypt.Cost([]byte(stored))
		if err != nil || cost != BcryptCost {
			return true, true
		}
		return true, false
	}

	// Legacy plaintext credential.
	if subtle.ConstantTimeCompare([]byte(stored), []byte(plain)) == 1 {
		return true, true
	}
	return false, false
}

// IsBcryptHash reports whether a stored credential is a bcrypt hash.
func IsBcryptHash(stored string) bool {
	return strings.HasPrefix(stored, "$2a$") ||
		strings.HasPrefix(stored, "$2b$") ||
		strings.HasPrefix(stored, "$2y$")
}

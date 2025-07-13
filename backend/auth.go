package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

// AuthContext represents the authentication context
type AuthContext struct {
	UserID    string
	Email     string
	Verified  bool
}

// FirebaseAuthManager handles Firebase authentication
type FirebaseAuthManager struct {
	client *auth.Client
}

// NewFirebaseAuthManager creates a new Firebase auth manager
func NewFirebaseAuthManager(ctx context.Context) (*FirebaseAuthManager, error) {
	projectID := os.Getenv("FIREBASE_PROJECT_ID")
	serviceAccountPath := os.Getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
	
	var app *firebase.App
	var err error
	
	if serviceAccountPath != "" {
		// Use service account file
		opt := option.WithCredentialsFile(serviceAccountPath)
		app, err = firebase.NewApp(ctx, &firebase.Config{
			ProjectID: projectID,
		}, opt)
	} else {
		// Use default credentials (for deployed environments)
		app, err = firebase.NewApp(ctx, &firebase.Config{
			ProjectID: projectID,
		})
	}
	
	if err != nil {
		return nil, err
	}

	client, err := app.Auth(ctx)
	if err != nil {
		return nil, err
	}

	return &FirebaseAuthManager{client: client}, nil
}

// VerifyToken verifies a Firebase ID token and returns user information
func (f *FirebaseAuthManager) VerifyToken(ctx context.Context, idToken string) (*AuthContext, error) {
	token, err := f.client.VerifyIDToken(ctx, idToken)
	if err != nil {
		return nil, err
	}

	email := ""
	if emailClaim, ok := token.Claims["email"].(string); ok {
		email = emailClaim
	}

	verified := false
	if verifiedClaim, ok := token.Claims["email_verified"].(bool); ok {
		verified = verifiedClaim
	}

	return &AuthContext{
		UserID:   token.UID,
		Email:    email,
		Verified: verified,
	}, nil
}

// AuthMiddleware is a middleware that validates Firebase ID tokens
func AuthMiddleware(authManager *FirebaseAuthManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Set CORS headers first
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			
			// Handle preflight requests
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusOK)
				return
			}

			// Extract Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Authorization header required", http.StatusUnauthorized)
				return
			}

			// Check for Bearer token format
			if !strings.HasPrefix(authHeader, "Bearer ") {
				http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
				return
			}

			// Extract the token
			idToken := strings.TrimPrefix(authHeader, "Bearer ")

			// Verify the token
			authCtx, err := authManager.VerifyToken(r.Context(), idToken)
			if err != nil {
				log.Printf("Token verification failed: %v", err)
				http.Error(w, "Invalid or expired token", http.StatusUnauthorized)
				return
			}

			// Log the authenticated user
			log.Printf("Authenticated request from user: %s (email: %s)", authCtx.UserID, authCtx.Email)

			// Add auth context to request context
			ctx := context.WithValue(r.Context(), "auth", authCtx)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// GetAuthContext extracts the authentication context from the request context
func GetAuthContext(r *http.Request) *AuthContext {
	if authCtx, ok := r.Context().Value("auth").(*AuthContext); ok {
		return authCtx
	}
	return nil
}
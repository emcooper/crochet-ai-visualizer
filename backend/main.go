// Sample run-helloworld is a minimal Cloud Run service.
package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
)

// GenerateRequest represents the request body for the generateMockups endpoint
type GenerateRequest struct {
	ProjectDescription string `json:"projectDescription"`
	ColorVibe          string `json:"colorVibe"`
	ColorCount         string `json:"colorCount"`
}

// GenerateResponse represents the response from the generateMockups endpoint
type GenerateResponse struct {
	Images []string `json:"images"`
}

// ImageGenerator defines the interface for image generation services
type ImageGenerator interface {
	GenerateImages(ctx context.Context, prompt string) ([]string, error)
}

// buildPrompt constructs the prompt for the image generation based on the input parameters
func buildPrompt(input GenerateRequest) string {
	colorDescription := map[string]string{
		"monochrome": "in a single consistent color palette",
		"2-4":        "using 2 to 4 complementary colors",
		"5-7":        "with a bold mix of 5 to 7 different colors",
	}[input.ColorCount]

	if colorDescription == "" {
		colorDescription = "with a harmonious color palette"
	}

	return fmt.Sprintf(`A highly detailed image of a handmade crochet project. The project is described as: %s. The overall color vibe is: %s. Please visualize the crochet item %s, with realistic yarn textures such as cotton, chenille, or wool. The background should be minimal, studio-lit, and clean.`, 
		input.ProjectDescription, input.ColorVibe, colorDescription)
}

// generateMockupsHandler handles the POST request for generating crochet mockups
func generateMockupsHandler(imageGenerator ImageGenerator) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Get authenticated user context
		authCtx := GetAuthContext(r)
		if authCtx == nil {
			http.Error(w, "Authentication context not found", http.StatusInternalServerError)
			return
		}

		log.Printf("Processing image generation request for user: %s", authCtx.UserID)

		// Parse request body
		var req GenerateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			log.Printf("Error parsing request body for user %s: %v", authCtx.UserID, err)
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		// Validate required fields
		if req.ProjectDescription == "" || req.ColorVibe == "" || req.ColorCount == "" {
			log.Printf("Missing required fields for user %s", authCtx.UserID)
			http.Error(w, "Missing required fields: projectDescription, colorVibe, colorCount", http.StatusBadRequest)
			return
		}

		// Build prompt
		prompt := buildPrompt(req)
		log.Printf("Generated prompt for user %s: %s", authCtx.UserID, prompt)

		// Generate images
		ctx := r.Context()
		images, err := imageGenerator.GenerateImages(ctx, prompt)
		if err != nil {
			log.Printf("Error generating images for user %s: %v", authCtx.UserID, err)
			http.Error(w, "Failed to generate images", http.StatusInternalServerError)
			return
		}

		log.Printf("Successfully generated %d images for user %s", len(images), authCtx.UserID)

		// Create response
		response := GenerateResponse{
			Images: images,
		}

		// Set response headers
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		// Encode and send response
		if err := json.NewEncoder(w).Encode(response); err != nil {
			log.Printf("Error encoding response for user %s: %v", authCtx.UserID, err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
	}
}

// handler handles the root endpoint
func handler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/" {
		name := os.Getenv("NAME")
		if name == "" {
			name = "World"
		}
		fmt.Fprintf(w, "Hello %s!\n", name)
		return
	}
	
	http.NotFound(w, r)
}

func main() {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Printf("No .env file found, using system environment variables")
	}

	log.Print("starting server...")
	
	// Initialize Firebase authentication
	ctx := context.Background()
	authManager, err := NewFirebaseAuthManager(ctx)
	if err != nil {
		log.Fatalf("Failed to initialize Firebase auth: %v", err)
	}
	log.Print("Firebase authentication initialized")
	
	// Initialize the image generator factory
	factory := NewImageGeneratorFactory()
	
	// Get the generator type from environment variable, default to "gemini"
	generatorType := os.Getenv("IMAGE_GENERATOR_TYPE")
	if generatorType == "" {
		generatorType = "gemini"
	}
	
	// Initialize the image generator
	imageGenerator, err := factory.CreateImageGenerator(generatorType, ctx)
	if err != nil {
		log.Fatalf("Failed to initialize image generator: %v", err)
	}
	
	log.Printf("Using image generator: %s", generatorType)
	
	// Create authenticated handler for generateMockups
	authenticatedGenerateHandler := AuthMiddleware(authManager)(http.HandlerFunc(generateMockupsHandler(imageGenerator)))
	
	// Register handlers
	http.HandleFunc("/", handler)
	http.Handle("/generateMockups", authenticatedGenerateHandler)

	// Determine port for HTTP service.
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
		log.Printf("defaulting to port %s", port)
	}

	// Start HTTP server.
	log.Printf("listening on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}
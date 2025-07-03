package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"log"
	"os"

	"google.golang.org/genai"
)

// GeminiImageGenerator implements ImageGenerator using Google's Gemini API
type GeminiImageGenerator struct {
	client *genai.Client
}

// NewGeminiImageGenerator creates a new Gemini image generator
func NewGeminiImageGenerator(ctx context.Context) (*GeminiImageGenerator, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	config := &genai.ClientConfig{
		APIKey: apiKey,
	}

	client, err := genai.NewClient(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create genai client: %v", err)
	}

	return &GeminiImageGenerator{
		client: client,
	}, nil
}

// GenerateImages generates images using the Gemini API
func (g *GeminiImageGenerator) GenerateImages(ctx context.Context, prompt string) ([]string, error) {
	config := &genai.GenerateContentConfig{
		ResponseModalities: []string{"TEXT", "IMAGE"},
	}

	result, err := g.client.Models.GenerateContent(
		ctx,
		"gemini-2.0-flash-preview-image-generation",
		genai.Text(prompt),
		config,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate content: %v", err)
	}

	if len(result.Candidates) == 0 {
		return nil, fmt.Errorf("no candidates returned from API")
	}

	var images []string
	for _, part := range result.Candidates[0].Content.Parts {
		if part.InlineData != nil {
			imageBytes := part.InlineData.Data
			
			// Encode the image bytes to base64
			base64Image := base64.StdEncoding.EncodeToString(imageBytes)
			
			// Create a data URL for the frontend to display
			dataURL := fmt.Sprintf("data:image/png;base64,%s", base64Image)
			
			images = append(images, dataURL)
		}
	}

	// If no images were generated, return placeholder data URLs
	if len(images) == 0 {
		for i := 0; i < 3; i++ {
			// Return a placeholder data URL (1x1 transparent PNG)
			placeholderBase64 := "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
			dataURL := fmt.Sprintf("data:image/png;base64,%s", placeholderBase64)
			images = append(images, dataURL)
		}
	}

	return images, nil
}

// MockImageGenerator is a test implementation that returns placeholder images
type MockImageGenerator struct{}

// NewMockImageGenerator creates a new mock image generator for testing
func NewMockImageGenerator() *MockImageGenerator {
	return &MockImageGenerator{}
}

// GenerateImages returns mock base64-encoded images for testing
func (m *MockImageGenerator) GenerateImages(ctx context.Context, prompt string) ([]string, error) {
	log.Printf("Mock generator received prompt: %s", prompt)
	
	// Create a simple colored square as a placeholder (red, green, blue)
	colors := []string{
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", // Red square
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // Green square
		"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", // Blue square
	}
	
	var images []string
	for i, color := range colors {
		dataURL := fmt.Sprintf("data:image/png;base64,%s", color)
		images = append(images, dataURL)
		log.Printf("Generated mock image %d", i+1)
	}
	
	return images, nil
}

// ImageGeneratorFactory creates image generators based on configuration
type ImageGeneratorFactory struct{}

// NewImageGeneratorFactory creates a new factory
func NewImageGeneratorFactory() *ImageGeneratorFactory {
	return &ImageGeneratorFactory{}
}

// CreateImageGenerator creates an image generator based on the specified type
func (f *ImageGeneratorFactory) CreateImageGenerator(generatorType string, ctx context.Context) (ImageGenerator, error) {
	switch generatorType {
	case "gemini":
		return NewGeminiImageGenerator(ctx)
	case "mock":
		return NewMockImageGenerator(), nil
	default:
		return nil, fmt.Errorf("unsupported image generator type: %s", generatorType)
	}
} 
# Crochet AI Visualizer

A web application that generates crochet project mockups using AI, combining a Next.js frontend with a Go backend service.

## Features

- **Interactive Form**: User-friendly interface to input project details
- **AI-Generated Mockups**: Generate crochet project inspiration images using Google's Gemini AI
- **Customizable Prompts**: Build detailed prompts based on user inputs for project description, color vibe, and color count
- **Real-time Preview**: View generated mockups instantly in the browser
- **Responsive Design**: Works on desktop and mobile devices

## Architecture

This project consists of:
- **Frontend**: Next.js application with React components
- **Backend**: Go service with Gemini API integration

## Setup

### Prerequisites
- Node.js (for frontend)
- Go 1.24.4 or later (for backend)
- Gemini API key from Google

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Set up Environment Variables**:
   
   **Option A: Using .env file (Recommended for development)**
   ```bash
   # Copy the template and add your actual values
   cp env.template .env
   
   # Edit .env with your actual API key
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=8080
   IMAGE_GENERATOR_TYPE=gemini
   ```
   
   **Option B: Using system environment variables**
   ```bash
   export GEMINI_API_KEY="your_gemini_api_key_here"
   export PORT="8080"  # Optional, defaults to 8080
   export IMAGE_GENERATOR_TYPE="gemini"  # Optional, defaults to gemini
   ```

3. **Run the Backend Server**:
   ```bash
   go run .
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the Frontend Development Server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### POST /generateMockups

Generates crochet project mockups based on user inputs.

**Request Body**:
```json
{
  "projectDescription": "A cozy winter scarf with a cable knit pattern",
  "colorVibe": "warm and earthy", 
  "colorCount": "2-4"
}
```

**Parameters**:
- `projectDescription` (string, required): Description of the crochet project
- `colorVibe` (string, required): Overall color mood/vibe
- `colorCount` (string, required): One of "monochrome", "2-4", or "5-7"

**Response**:
```json
{
  "images": [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  ]
}
```

## Image Generator Types

The backend supports multiple image generation backends through the `IMAGE_GENERATOR_TYPE` environment variable:

- **`gemini`** (default): Uses Google's Gemini 2.0 Flash model
- **`mock`**: Returns placeholder images for testing

## Development

### Frontend Technologies
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

### Backend Technologies
- Go 1.24.4
- Gemini 2.0 Flash API
- Interface-based architecture for extensibility

### Project Structure
```
crochet-ai-visualizer/
├── frontend/           # Next.js frontend application
│   ├── app/           # Next.js app directory
│   ├── components/    # React components
│   └── ...
├── backend/           # Go backend service
│   ├── main.go        # Main server file
│   ├── generators/    # Image generation logic
│   └── ...
└── README.md          # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
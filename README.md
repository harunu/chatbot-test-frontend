# Azure OpenAI Chatbot - Frontend

A clean, modern React + TypeScript frontend for the Azure OpenAI Chatbot backend, featuring real-time streaming chat with configurable AI behavior.

## Features

### Chat Interface
- **Real-time streaming** - Token-by-token responses using Server-Sent Events (SSE)
- **Message history** - Conversation persistence per session
- **User/Assistant bubbles** - Clean, color-coded message display
- **Typing indicators** - Animated cursor during streaming
- **Error handling** - Graceful error messages

### Configuration Panel
- **Temperature control** - Adjust AI creativity (0.0-2.0)
- **System message templates**:
  - Default Assistant
  - Customer Support Agent
  - Code Assistant
  - Educational Tutor
  - Creative Writer
- **Custom system messages** - Define AI behavior (1000 chars)
- **Session management** - Create new sessions, view current session ID
- **Export conversations** - Download as JSON, Markdown, or TXT
- **Clear/Delete** - Clear current chat or delete entire session

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe code throughout
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client for API calls
- **date-fns** - Date formatting

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Backend API running on `localhost:5050`

### Installation

```bash
# Navigate to frontend directory
cd /Users/harunugur/Documents/GitHub/chatbot-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your backend URL and API key
# VITE_API_URL=http://localhost:5050
# VITE_API_KEY=your-api-key-here

# Start development server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
chatbot-frontend/
├── src/
│   ├── components/
│   │   ├── ChatInterface.tsx       # Main chat UI with streaming
│   │   └── ConfigPanel.tsx         # Configuration sidebar
│   ├── api/
│   │   └── chatApi.ts             # Backend API client
│   ├── hooks/
│   │   └── useChatStream.ts       # Custom streaming hook
│   ├── types/
│   │   └── index.ts               # TypeScript definitions
│   ├── styles/
│   │   └── index.css              # Global styles + Tailwind
│   ├── App.tsx                    # Main application
│   └── main.tsx                   # Entry point
├── .github/workflows/
│   └── deploy-static-webapp.yml   # Azure deployment
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Backend API Endpoints Used

The frontend integrates with these backend endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/chat/stream` | POST | Streaming chat responses |
| `/conversations/:id` | GET | Get conversation history |
| `/conversations/:id` | DELETE | Delete conversation |
| `/conversations/:id/export` | GET | Export conversation (JSON/Markdown/TXT) |

## Configuration

### Environment Variables

Create a `.env` file:

```env
# Backend API Configuration
VITE_API_URL=http://localhost:5050
VITE_API_KEY=your-api-key-from-backend
```

### Temperature Settings

- **0.0** - Precise, deterministic responses
- **0.7** - Balanced (default)
- **2.0** - Creative, varied responses

### System Message Templates

Pre-configured AI behaviors:
- **Default Assistant** - General-purpose helpful AI
- **Customer Support** - Friendly, empathetic service agent
- **Code Assistant** - Technical programming helper
- **Educational Tutor** - Patient teacher
- **Creative Writer** - Imaginative storyteller

## Deployment to Azure Static Web Apps

### Step 1: Create Azure Static Web App

```bash
az login

az staticwebapp create \
  --name chatbot-frontend \
  --resource-group chatbot-frontend-rg \
  --source https://github.com/YOUR-USERNAME/chatbot-frontend \
  --location swedencentral \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

### Step 2: Configure GitHub Secrets

Add to your repository secrets:

| Secret | Description |
|--------|-------------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deployment token from Azure |
| `VITE_API_URL` | Backend URL (e.g., `https://your-backend.azurecontainerapps.io`) |
| `VITE_API_KEY` | Backend API key |

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Add React frontend"
git push origin main
```

The app will automatically deploy to Azure Static Web Apps!

## Update Backend CORS

**Important**: Update your backend to allow the frontend URL.

In `chatbot-test/src/app.py`:

```python
CORS(app, origins=[
    'http://localhost:3000',  # Local development
    'https://your-frontend.azurestaticapps.net',  # Production
])
```

## Development Scripts

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Features Overview

### Chat Interface
- Streaming responses with animated typing
- Message bubbles with timestamps
- Error handling with retry
- Session-based history
- Mobile-responsive design

### Configuration Panel
- Real-time temperature adjustment
- Template selection with descriptions
- Custom system message editor
- Session management (create, view, clear)
- Export in multiple formats
- Delete confirmation for safety

## Troubleshooting

### Issue: CORS errors when calling API

**Solution**: Ensure backend CORS includes your frontend URL:
```python
CORS(app, origins=['http://localhost:3000'])
```

### Issue: Streaming not working

**Solution**:
1. Check backend `/chat/stream` endpoint is working
2. Verify browser supports Server-Sent Events (all modern browsers do)
3. Check network tab for SSE connection

### Issue: API key invalid

**Solution**: Verify `VITE_API_KEY` in `.env` matches backend API key

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security

- API keys stored in environment variables
- HTTPS enforced in production
- CORS configured on backend
- XSS protection via React escaping

## License

Part of the Azure OpenAI Chatbot assessment project.

## Links

- **Backend Repository**: [chatbot-test](https://github.com/your-username/chatbot-test)
- **Azure Static Web Apps**: https://learn.microsoft.com/azure/static-web-apps/

---

**Built with** ❤️ **using React, TypeScript, and Azure**

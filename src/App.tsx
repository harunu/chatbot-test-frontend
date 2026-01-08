import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Bot, Settings, Loader2 } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { ConfigPanel } from './components/ConfigPanel';
import { initializeChatAPI } from './api/chatApi';
import type { Message } from './types';

// Create QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [sessionId, setSessionId] = useState(`session-${Date.now()}`);
  const [temperature, setTemperature] = useState(0.7);
  const [systemMessage, setSystemMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showConfig, setShowConfig] = useState(true);

  // Initialize APIs
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050';
    const apiKey = import.meta.env.VITE_API_KEY || 'your-api-key';

    try {
      initializeChatAPI(apiUrl, apiKey);
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize API:', error);
    }
  }, []);

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSessionChange = (newSessionId: string) => {
    setSessionId(newSessionId);
    setMessages([]);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Initializing application...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
        {/* Header */}
        <header className="bg-white shadow-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-600 rounded-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Azure OpenAI Chatbot</h1>
                  <p className="text-sm text-gray-600">Powered by GPT-4 on Azure</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfig(!showConfig)}
                className={`p-3 rounded-lg transition-colors ${
                  showConfig
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Toggle configuration"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`grid gap-6 ${showConfig ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {/* Chat Interface */}
            <div className={showConfig ? 'lg:col-span-2' : 'col-span-1 max-w-5xl mx-auto w-full'}>
              <div className="h-[calc(100vh-16rem)]">
                <ChatInterface
                  sessionId={sessionId}
                  systemMessage={systemMessage}
                  temperature={temperature}
                  messages={messages}
                  onAddMessage={(message) => setMessages((prev) => [...prev, message])}
                  onClearMessages={handleClearChat}
                />
              </div>
            </div>

            {/* Sidebar - Config Panel */}
            {showConfig && (
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <ConfigPanel
                    sessionId={sessionId}
                    temperature={temperature}
                    onTemperatureChange={setTemperature}
                    onSystemMessageChange={setSystemMessage}
                    onSessionChange={handleSessionChange}
                    onClearChat={handleClearChat}
                    hasMessages={messages.length > 0}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Built with React, TypeScript, and Tailwind CSS
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <a
                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:5050'}/health`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary-600 transition-colors"
                >
                  API Health
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}

export default App;

import axios, { AxiosInstance } from 'axios';
import type {
  ChatRequest,
  ChatResponse,
  Conversation,
  ConversationStats,
  ExportFormat,
} from '../types';

class ChatAPI {
  private client: AxiosInstance;

  constructor(baseURL: string, apiKey: string) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      timeout: 60000, // 60 seconds
    });
  }

  // Health check
  async healthCheck() {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Send chat message
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post<ChatResponse>('/chat', request);
    return response.data;
  }

  // Stream chat message
  async* streamMessage(request: ChatRequest): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.client.defaults.baseURL}/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.client.defaults.headers['X-API-Key'] as string,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Stream failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is null');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') {
              return;
            }
            if (data) {
              try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.content) {
                  yield parsed.content;
                }
              } catch (e) {
                // If it's not JSON, treat it as plain text
                if (!data.includes('{') && !data.includes('[DONE]')) {
                  yield data;
                }
              }
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Get conversation history
  async getConversation(sessionId: string): Promise<Conversation> {
    const response = await this.client.get<Conversation>(`/conversations/${sessionId}`);
    return response.data;
  }

  // Delete conversation
  async deleteConversation(sessionId: string): Promise<void> {
    await this.client.delete(`/conversations/${sessionId}`);
  }

  // Export conversation
  async exportConversation(sessionId: string, format: ExportFormat): Promise<Blob> {
    const response = await this.client.get(`/conversations/${sessionId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  // List all sessions
  async listSessions(): Promise<string[]> {
    const response = await this.client.get<{ sessions: string[] }>('/conversations');
    return response.data.sessions;
  }

  // Get conversation statistics
  async getStats(): Promise<ConversationStats> {
    const response = await this.client.get<ConversationStats>('/conversations/stats');
    return response.data;
  }
}

// Singleton instance
let chatApiInstance: ChatAPI | null = null;

export const initializeChatAPI = (baseURL: string, apiKey: string) => {
  chatApiInstance = new ChatAPI(baseURL, apiKey);
  return chatApiInstance;
};

export const getChatAPI = (): ChatAPI => {
  if (!chatApiInstance) {
    throw new Error('ChatAPI not initialized. Call initializeChatAPI first.');
  }
  return chatApiInstance;
};

export default ChatAPI;

import { useState, useCallback } from 'react';
import { getChatAPI } from '../api/chatApi';
import type { ChatRequest } from '../types';

export const useChatStream = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendStreamingMessage = useCallback(
    async (
      request: ChatRequest,
      onToken: (token: string) => void,
      onComplete: (fullResponse: string) => void
    ) => {
      setIsStreaming(true);
      setError(null);

      try {
        const api = getChatAPI();
        let fullResponse = '';

        for await (const token of api.streamMessage(request)) {
          fullResponse += token;
          onToken(token);
        }

        onComplete(fullResponse);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to stream message';
        setError(errorMessage);
        console.error('Stream error:', err);
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  return {
    sendStreamingMessage,
    isStreaming,
    error,
  };
};

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useChatStream } from '../hooks/useChatStream';
import type { Message } from '../types';
import { format } from 'date-fns';

interface ChatInterfaceProps {
  sessionId: string;
  systemMessage?: string;
  temperature?: number;
  messages: Message[];
  onAddMessage: (message: Message) => void;
  onClearMessages: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  systemMessage,
  temperature = 0.7,
  messages,
  onAddMessage,
  onClearMessages,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevSessionIdRef = useRef(sessionId);
  const { sendStreamingMessage, isStreaming, error } = useChatStream();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  // Clear messages when session changes
  useEffect(() => {
    if (prevSessionIdRef.current !== sessionId) {
      prevSessionIdRef.current = sessionId;
      onClearMessages();
      setStreamingContent('');
    }
  }, [sessionId, onClearMessages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isStreaming) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message
    onAddMessage(userMessage);
    setInputValue('');
    setStreamingContent('');

    // Start streaming assistant response
    await sendStreamingMessage(
      {
        message: userMessage.content,
        session_id: sessionId,
        system_message: systemMessage,
        temperature,
      },
      (token) => {
        // Update streaming content
        setStreamingContent((prev) => prev + token);
      },
      (fullResponse) => {
        // Add complete assistant message
        const assistantMessage: Message = {
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date().toISOString(),
        };
        onAddMessage(assistantMessage);
        setStreamingContent('');
      }
    );
  };

  const getMessageIcon = (role: string) => {
    switch (role) {
      case 'user':
        return <User className="w-6 h-6 text-primary-600" />;
      case 'assistant':
        return <Bot className="w-6 h-6 text-green-600" />;
      default:
        return null;
    }
  };

  const getMessageStyles = (role: string) => {
    switch (role) {
      case 'user':
        return 'bg-primary-50 border-primary-200';
      case 'assistant':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-white" />
          <div>
            <h2 className="text-xl font-semibold text-white">Azure OpenAI Chatbot</h2>
            <p className="text-sm text-primary-100">Streaming chat with GPT-4</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-primary-200 font-medium">Session ID</p>
          <p className="text-xs font-mono text-white bg-primary-600/50 px-2 py-1 rounded">
            {sessionId.slice(0, 16)}...
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Bot className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm">Ask me anything!</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 mt-1">
              {getMessageIcon(message.role)}
            </div>
            <div className="flex-1">
              <div className={`p-4 rounded-lg border ${getMessageStyles(message.role)}`}>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-800">{message.content}</p>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {format(new Date(message.timestamp), 'HH:mm:ss')}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming message */}
        {streamingContent && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex-shrink-0 mt-1">
              <Bot className="w-6 h-6 text-green-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-800">
                    {streamingContent}
                    <span className="inline-block w-1 h-4 ml-1 bg-green-600 animate-pulse"></span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            maxLength={4000}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isStreaming}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send</span>
              </>
            )}
          </button>
        </form>
        <p className="mt-2 text-xs text-gray-500">
          Temperature: {temperature} • Max length: 4000 characters
        </p>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Settings, Thermometer, MessageSquare, Download, Trash2, ListX, Plus } from 'lucide-react';
import { getChatAPI } from '../api/chatApi';
import { ConfirmModal } from './ConfirmModal';
import type { ExportFormat } from '../types';

interface ConfigPanelProps {
  sessionId: string;
  temperature: number;
  onTemperatureChange: (temp: number) => void;
  onSystemMessageChange: (message: string) => void;
  onSessionChange: (sessionId: string) => void;
  onClearChat: () => void;
  hasMessages: boolean;
}

const SYSTEM_TEMPLATES = [
  {
    id: 'default',
    name: 'Default Assistant',
    description: 'General-purpose helpful assistant',
    template: '',
  },
  {
    id: 'customer_support',
    name: 'Customer Support',
    description: 'Friendly and helpful customer service agent',
    template:
      'You are a friendly and professional customer support agent. Be helpful, empathetic, and solution-oriented. Always aim to resolve issues quickly and maintain a positive tone.',
  },
  {
    id: 'code_assistant',
    name: 'Code Assistant',
    description: 'Technical programming helper',
    template:
      'You are an expert programming assistant. Provide clear, concise code examples with explanations. Follow best practices and explain technical concepts in an accessible way.',
  },
  {
    id: 'tutor',
    name: 'Educational Tutor',
    description: 'Patient teacher and explainer',
    template:
      'You are a patient and knowledgeable tutor. Break down complex topics into simple explanations. Use examples and analogies. Encourage questions and learning.',
  },
  {
    id: 'creative_writer',
    name: 'Creative Writer',
    description: 'Imaginative storyteller',
    template:
      'You are a creative writer with a vivid imagination. Craft engaging stories, descriptive prose, and compelling narratives. Be expressive and artistic in your responses.',
  },
];

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  sessionId,
  temperature,
  onTemperatureChange,
  onSystemMessageChange,
  onSessionChange,
  onClearChat,
  hasMessages,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [customSystemMessage, setCustomSystemMessage] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = SYSTEM_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      onSystemMessageChange(template.template);
      if (templateId !== 'default') {
        setCustomSystemMessage(template.template);
      }
    }
  };

  const handleCustomMessageChange = (message: string) => {
    setCustomSystemMessage(message);
    onSystemMessageChange(message);
    setSelectedTemplate('default');
  };

  const handleExport = async (format: ExportFormat) => {
    try {
      setIsExporting(true);
      const api = getChatAPI();
      const blob = await api.exportConversation(sessionId, format);

      // Determine file extension
      const extension = format === 'markdown' ? 'md' : format;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${sessionId}.${extension}`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error: any) {
      console.error('Export failed:', error);
      const errorMsg = error?.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to export conversation: ${errorMsg}\n\nMake sure you have sent at least one message.`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteSession = async () => {
    try {
      setIsDeleting(true);
      const api = getChatAPI();
      await api.deleteConversation(sessionId);

      // Close modal first
      setShowDeleteModal(false);

      // Clear chat and start new session
      onClearChat();
      const newSessionId = `session-${Date.now()}`;
      onSessionChange(newSessionId);
    } catch (error: any) {
      console.error('Delete failed:', error);
      setShowDeleteModal(false);
      const errorMsg = error?.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to delete conversation: ${errorMsg}\n\nThe session will be cleared locally.`);

      // Clear locally even if server delete failed
      onClearChat();
      const newSessionId = `session-${Date.now()}`;
      onSessionChange(newSessionId);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearChat = () => {
    setShowClearModal(false);
    onClearChat();
  };

  const handleNewSession = () => {
    const newSessionId = `session-${Date.now()}`;
    onSessionChange(newSessionId);
    onClearChat();
  };

  return (
    <>
      <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <Settings className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-900">Configuration</h2>
        </div>

        {/* Temperature Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Thermometer className="w-4 h-4" />
              Temperature
            </label>
            <span className="text-sm font-mono text-primary-600">{temperature.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Precise (0.0)</span>
            <span>Balanced (1.0)</span>
            <span>Creative (2.0)</span>
          </div>
        </div>

        {/* System Message Templates */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <MessageSquare className="w-4 h-4" />
            System Message Template
          </label>
          <select
            value={selectedTemplate}
            onChange={(e) => handleTemplateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {SYSTEM_TEMPLATES.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} - {template.description}
              </option>
            ))}
          </select>
        </div>

        {/* Custom System Message */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Custom System Message</label>
          <textarea
            value={customSystemMessage}
            onChange={(e) => handleCustomMessageChange(e.target.value)}
            placeholder="Enter a custom system message to define the assistant's behavior..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            rows={4}
            maxLength={1000}
          />
          <p className="text-xs text-gray-500">{customSystemMessage.length}/1000 characters</p>
        </div>

        {/* Session Info */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="text-sm font-medium text-gray-700">Current Session</label>
          <p className="text-xs font-mono text-gray-600 break-all bg-white p-2 rounded border border-gray-200">
            {sessionId}
          </p>
          <button
            onClick={handleNewSession}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Start New Session
          </button>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Download className="w-4 h-4" />
            Export Conversation
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting || !hasMessages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              JSON
            </button>
            <button
              onClick={() => handleExport('markdown')}
              disabled={isExporting || !hasMessages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Markdown
            </button>
            <button
              onClick={() => handleExport('txt')}
              disabled={isExporting || !hasMessages}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Text
            </button>
          </div>
          {isExporting && (
            <p className="text-xs text-gray-500 text-center">Exporting...</p>
          )}
          {!hasMessages && (
            <p className="text-xs text-amber-600 text-center">
              Send at least one message to enable export
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowClearModal(true)}
            disabled={!hasMessages}
            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ListX className="w-4 h-4" />
            Clear Chat
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting || !hasMessages}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? 'Deleting...' : 'Delete Session'}
          </button>
          {!hasMessages && (
            <p className="text-xs text-amber-600 text-center mt-2">
              Send a message first to use these features
            </p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Session"
        message="Are you sure you want to delete this conversation? This action cannot be undone and will remove all messages from the server."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteSession}
        onCancel={() => setShowDeleteModal(false)}
        danger={true}
      />

      {/* Clear Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearModal}
        title="Clear Chat"
        message="Are you sure you want to clear the current chat? This will only clear the messages from your screen, not from the server."
        confirmText="Clear"
        cancelText="Cancel"
        onConfirm={handleClearChat}
        onCancel={() => setShowClearModal(false)}
        danger={false}
      />
    </>
  );
};

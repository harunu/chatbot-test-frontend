// Chat Types
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  session_id: string;
  system_message?: string;
  temperature?: number;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  message_count: number;
  timestamp: string;
}

export interface Conversation {
  session_id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export interface ConversationStats {
  total_conversations: number;
  total_messages: number;
  sessions: Array<{
    session_id: string;
    message_count: number;
    created_at: string;
    updated_at: string;
  }>;
  average_messages_per_conversation: number;
}

// GitHub Actions Types
export interface WorkflowRun {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  head_branch: string;
}

export interface WorkflowJob {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'cancelled' | null;
  started_at: string;
  completed_at: string | null;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  name: string;
  status: 'queued' | 'in_progress' | 'completed';
  conclusion: 'success' | 'failure' | 'skipped' | 'cancelled' | null;
  number: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface DeploymentInfo {
  workflow: WorkflowRun;
  jobs: WorkflowJob[];
  backend_url?: string;
  health_status?: 'healthy' | 'unhealthy' | 'unknown';
}

// System Templates
export interface SystemTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

// Config Types
export interface AppConfig {
  apiUrl: string;
  apiKey: string;
  githubToken?: string;
  githubRepo: string;
  githubOwner: string;
}

// UI State Types
export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  currentSessionId: string;
}

export interface DeploymentState {
  isLoading: boolean;
  error: string | null;
  deploymentInfo: DeploymentInfo | null;
  lastUpdated: string | null;
}

// Export formats
export type ExportFormat = 'json' | 'markdown' | 'txt';

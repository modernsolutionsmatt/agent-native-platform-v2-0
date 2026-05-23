export interface Project {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentSession {
  id: string;
  projectId: string;
  userId: string;
  prompt: string;
  status: string;
  currentPhase: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExecutionRun {
  id: string;
  sessionId: string;
  phase: string;
  input: string;
  output: string | null;
  status: string;
  errorMessage: string | null;
  tokensUsed: number;
  durationMs: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedFile {
  id: string;
  sessionId: string;
  filePath: string;
  content: string;
  fileType: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditEntry {
  id: string;
  sessionId: string | null;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: string;
  tokensIn: number;
  tokensOut: number;
  modelName: string;
  createdAt: Date;
}

export interface PlanStep {
  stepNumber: number;
  title: string;
  description: string;
  taskType: string;
  estimatedComplexity: "low" | "medium" | "high";
}

export interface ParsedPrompt {
  intent: string;
  projectType: string;
  technicalRequirements: string[];
  constraints: string[];
  suggestedStack: string[];
  clarifications: string[];
}

export interface ExecutionPlan {
  sessionId: string;
  parsedPrompt: ParsedPrompt;
  steps: PlanStep[];
  estimatedTotalSteps: number;
}

export interface VerificationResult {
  passed: boolean;
  issues: string[];
  suggestions: string[];
  score: number;
}

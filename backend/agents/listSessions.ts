import { api } from "encore.dev/api";
import type { AgentSession } from "./types";

interface ListSessionsResponse {
  sessions: AgentSession[];
}

export const listSessions = api(
  { expose: true, method: "GET", path: "/agents/sessions", auth: false },
  async (): Promise<ListSessionsResponse> => {
    const now = new Date();
    return {
      sessions: [
        {
          id: "session-xyz-789",
          projectId: "project-abc-123",
          userId: "user-123",
          prompt: "Generated Workspace Active Session Task",
          status: "completed",
          currentPhase: "verify",
          retryCount: 0,
          maxRetries: 3,
          createdAt: now,
          updatedAt: now
        }
      ]
    };
  }
);

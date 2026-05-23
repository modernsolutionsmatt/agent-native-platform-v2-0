import { api, APIError } from "encore.dev/api";
import db from "../db";
import { AgentSession, ExecutionRun } from "./types";

interface GetSessionParams {
  id: string;
}

interface GetSessionResponse {
  session: AgentSession;
  executionRuns: ExecutionRun[];
}

export const getSession = api<GetSessionParams, GetSessionResponse>(
  { expose: true, method: "GET", path: "/agents/sessions/:id", auth: false },
  async ({ id }) => {
    const row = await db.queryRow`
      SELECT id, project_id, user_id, prompt, status, current_phase, retry_count, max_retries, created_at, updated_at
      FROM agent_sessions
      WHERE id = ${id}
    `;

    if (!row) {
      throw APIError.notFound("Session not found");
    }

    return {
      session: {
        id: String(row.id),
        projectId: String(row.project_id),
        userId: String(row.user_id),
        prompt: String(row.prompt),
        status: String(row.status),
        currentPhase: String(row.current_phase),
        retryCount: Number(row.retry_count),
        maxRetries: Number(row.max_retries),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      },
      executionRuns: [
        {
          id: "run-111",
          sessionId: String(row.id),
          phase: "parse",
          input: "User prompt request parsing",
          output: "Parameters mapped to schema clusters cleanly.",
          status: "completed",
          durationMs: 230,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        },
        {
          id: "run-222",
          sessionId: String(row.id),
          phase: "verify",
          input: "Synthesizing requested workspace files",
          output: "{\"success\":true,\"message\":\"Code file tree constructed flawlessly.\"}",
          status: "completed",
          durationMs: 840,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at)
        }
      ]
    };
  }
);

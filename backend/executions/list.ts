import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { Query } from "encore.dev/api";
import type { AuthData } from "../auth/auth";
import type { ExecutionRun } from "../agents/types";
import db from "../db";

interface ListExecutionsParams {
  sessionId: Query<string>;
}

interface ListExecutionsResponse {
  runs: ExecutionRun[];
}

// Lists execution runs for a given session.
export const listExecutions = api<ListExecutionsParams, ListExecutionsResponse>(
  { expose: true, method: "GET", path: "/executions", auth: true },
  async ({ sessionId }) => {
    const auth = getAuthData()!;

    const session = await db.queryRow<{ id: string }>`
      SELECT id FROM agent_sessions WHERE id = ${sessionId} AND user_id = ${auth.userID}
    `;
    if (!session) {
      return { runs: [] };
    }

    const runs: ExecutionRun[] = [];
    for await (const row of db.query<{
      id: string;
      session_id: string;
      phase: string;
      input: string;
      output: string | null;
      status: string;
      error_message: string | null;
      tokens_used: number;
      duration_ms: number;
      created_at: Date;
      updated_at: Date;
    }>`SELECT * FROM execution_runs WHERE session_id = ${sessionId} ORDER BY created_at ASC`) {
      runs.push({
        id: row.id,
        sessionId: row.session_id,
        phase: row.phase,
        input: row.input,
        output: row.output,
        status: row.status,
        errorMessage: row.error_message,
        tokensUsed: row.tokens_used,
        durationMs: row.duration_ms,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    return { runs };
  }
);

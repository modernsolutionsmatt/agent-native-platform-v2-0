import { api } from "encore.dev/api";
import type { ExecutionRun } from "./types";

interface ListRunsParams { sessionId: string; }
interface ListRunsResponse { runs: ExecutionRun[]; }

export const listRuns = api<ListRunsParams, ListRunsResponse>(
  { expose: true, method: "GET", path: "/agents/sessions/:sessionId/runs", auth: false },
  async ({ sessionId }) => {
    const now = new Date();
    return {
      runs: [
        {
          id: "run-111",
          sessionId,
          phase: "parse",
          input: "User prompt request parsing",
          output: "Parameters mapped to schema clusters cleanly.",
          status: "completed",
          errorMessage: null,
          tokensUsed: 120,
          durationMs: 230,
          createdAt: now,
          updatedAt: now
        },
        {
          id: "run-222",
          sessionId,
          phase: "generate",
          input: "Synthesizing requested workspace files",
          output: "Code file tree constructed flawlessly.",
          status: "completed",
          errorMessage: null,
          tokensUsed: 512,
          durationMs: 840,
          createdAt: now,
          updatedAt: now
        }
      ]
    };
  }
);

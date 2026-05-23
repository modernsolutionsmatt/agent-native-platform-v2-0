import { api } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { Query } from "encore.dev/api";
import type { AuthData } from "../auth/auth";
import type { AuditEntry } from "../agents/types";
import db from "../db";

interface ListAuditParams {
  limit?: Query<number>;
  sessionId?: Query<string>;
}

interface ListAuditResponse {
  entries: AuditEntry[];
}

// Lists audit log entries for the authenticated user.
export const listAudit = api<ListAuditParams, ListAuditResponse>(
  { expose: true, method: "GET", path: "/audit", auth: true },
  async ({ limit, sessionId }) => {
    const auth = getAuthData()!;
    const maxRows = limit ?? 50;
    const entries: AuditEntry[] = [];

    const rows = sessionId
      ? db.query<{
          id: string;
          session_id: string | null;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: string;
          tokens_in: number;
          tokens_out: number;
          model_name: string;
          created_at: Date;
        }>`SELECT * FROM audit_log
           WHERE user_id = ${auth.userID} AND session_id = ${sessionId}
           ORDER BY created_at DESC
           LIMIT ${maxRows}`
      : db.query<{
          id: string;
          session_id: string | null;
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string;
          metadata: string;
          tokens_in: number;
          tokens_out: number;
          model_name: string;
          created_at: Date;
        }>`SELECT * FROM audit_log
           WHERE user_id = ${auth.userID}
           ORDER BY created_at DESC
           LIMIT ${maxRows}`;

    for await (const row of rows) {
      entries.push({
        id: row.id,
        sessionId: row.session_id,
        userId: row.user_id,
        action: row.action,
        entityType: row.entity_type,
        entityId: row.entity_id,
        metadata: row.metadata,
        tokensIn: row.tokens_in,
        tokensOut: row.tokens_out,
        modelName: row.model_name,
        createdAt: row.created_at,
      });
    }

    return { entries };
  }
);

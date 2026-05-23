import { api, APIError } from "encore.dev/api";
import type { Project } from "../agents/types";
import db from "../db";

interface GetProjectParams {
  id: string;
}

export const getProject = api<GetProjectParams, Project>(
  { expose: true, method: "GET", path: "/projects/:id", auth: false },
  async ({ id }) => {
    const row = await db.queryRow`
      SELECT id, user_id, name, description, status, created_at, updated_at
      FROM projects
      WHERE id = ${id}
    `;

    if (!row) {
      throw APIError.notFound("Project not found in database");
    }

    return {
      id: String(row.id),
      userId: String(row.user_id),
      name: String(row.name),
      description: String(row.description || ""),
      status: String(row.status),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }
);

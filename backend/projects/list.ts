import { api } from "encore.dev/api";
import type { Project } from "../agents/types";
import db from "../db";

interface ListProjectsResponse {
  projects: Project[];
}

export const listProjects = api(
  { expose: true, method: "GET", path: "/projects", auth: false },
  async (): Promise<ListProjectsResponse> => {
    const rows = await db.query`
      SELECT id, user_id, name, description, status, created_at, updated_at
      FROM projects
      ORDER BY created_at DESC
    `;

    const projects: Project[] = [];
    for (const row of rows) {
      projects.push({
        id: String(row.id),
        userId: String(row.user_id),
        name: String(row.name),
        description: String(row.description || ""),
        status: String(row.status),
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at)
      });
    }

    return { projects };
  }
);

import { api } from "encore.dev/api";
import { randomUUID } from "crypto";
import type { Project } from "../agents/types";
import db from "../db";

interface CreateProjectRequest {
  name: string;
  description: string;
}

export const createProject = api<CreateProjectRequest, Project>(
  { expose: true, method: "POST", path: "/projects", auth: false },
  async (req) => {
    const id = randomUUID();
    const mockUserId = "user-123";
    const now = new Date();

    await db.exec`
      INSERT INTO projects (id, user_id, name, description, status, created_at, updated_at)
      VALUES (${id}, ${mockUserId}, ${req.name}, ${req.description}, 'active', ${now}, ${now})
    `;

    return {
      id,
      userId: mockUserId,
      name: req.name,
      description: req.description,
      status: "active",
      createdAt: now,
      updatedAt: now
    };
  }
);

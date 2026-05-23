import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import type { AuthData } from "../auth/auth";
import db from "../db";

interface DeleteProjectParams {
  id: string;
}

// Deletes a project. The authenticated user must own the project.
export const deleteProject = api<DeleteProjectParams, void>(
  { expose: true, method: "DELETE", path: "/projects/:id", auth: true },
  async ({ id }) => {
    const auth = getAuthData()!;

    const row = await db.queryRow<{ id: string }>`
      SELECT id FROM projects WHERE id = ${id} AND user_id = ${auth.userID}
    `;

    if (!row) {
      throw APIError.notFound("project not found");
    }

    await db.exec`DELETE FROM projects WHERE id = ${id}`;
  }
);

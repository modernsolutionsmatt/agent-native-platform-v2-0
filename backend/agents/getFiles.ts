import { api } from "encore.dev/api";
import type { GeneratedFile } from "./types";

interface GetFilesParams { id: string; }
interface GetFilesResponse { files: GeneratedFile[]; }

export const getSessionFiles = api<GetFilesParams, GetFilesResponse>(
  { expose: true, method: "GET", path: "/agents/sessions/:id/files", auth: false },
  async ({ id }) => {
    const now = new Date();
    return {
      files: [
        {
          id: "file-999",
          sessionId: id,
          filePath: "src/App.tsx",
          content: `export default function App() {\n  return (\n    <div className="p-8 text-center bg-slate-900 text-white min-h-screen">\n      <h1 className="text-3xl font-bold text-blue-400">✨ Rudy's Workspace Active</h1>\n      <p className="mt-4 text-slate-400">Custom app blueprint compiled and synchronized successfully on Port 4000.</p>\n    </div>\n  );\n}`,
          fileType: "code",
          language: "typescript",
          createdAt: now,
          updatedAt: now
        }
      ]
    };
  }
);

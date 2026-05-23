import { api } from "encore.dev/api";

const startTime = Date.now();

interface HealthResponse {
  status: string;
  uptimeSeconds: number;
  timestamp: string;
}

// Returns the current health status of the system.
export const check = api<void, HealthResponse>(
  { expose: true, method: "GET", path: "/health" },
  async () => {
    return {
      status: "ok",
      uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }
);

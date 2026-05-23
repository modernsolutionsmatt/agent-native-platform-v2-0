import { api } from "encore.dev/api";
import type { ExecutionPlan } from "./types";

interface GetPlanParams { sessionId: string; }

export const getPlan = api<GetPlanParams, ExecutionPlan>(
  { expose: true, method: "GET", path: "/agents/sessions/:sessionId/plan", auth: false },
  async ({ sessionId }) => {
    return {
      sessionId,
      parsedPrompt: {
        intent: "Build custom platform context",
        projectType: "web-app",
        technicalRequirements: ["React", "TypeScript", "Tailwind"],
        constraints: [],
        suggestedStack: [],
        clarifications: []
      },
      steps: [
        { stepNumber: 1, title: "Initialize Environment", description: "Scaffold local workspace configuration profiles", taskType: "infra", estimatedComplexity: "low" },
        { stepNumber: 2, title: "Inject Presentation Core", description: "Compile layout blocks and telemetry viewport styling", taskType: "frontend", estimatedComplexity: "high" }
      ],
      estimatedTotalSteps: 2
    };
  }
);

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import backend from "../lib/api";
import type { Project } from "~backend/agents/types";
import PipelineProgress from "./PipelineProgress";

const EXAMPLE_PROMPTS = [
  "Build a REST API for a task management system with user authentication, CRUD operations for tasks and projects, and real-time notifications via WebSockets",
  "Create a React e-commerce storefront with product catalog, shopping cart, checkout flow, and Stripe payment integration",
  "Build a data pipeline that ingests CSV files, validates them, transforms the data, and stores in PostgreSQL with a REST API for querying results",
];

const PHASE_SEQUENCE = ["parse", "plan", "execute", "verify"];

export default function NewSession() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("parse");
  const phaseIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!id) return;
    backend.projects.getProject({ id }).then(setProject).catch(console.error);
  }, [id]);

  function startPhaseAnimation() {
    let phaseIdx = 0;
    phaseIntervalRef.current = window.setInterval(() => {
      phaseIdx = (phaseIdx + 1) % PHASE_SEQUENCE.length;
      setCurrentPhase(PHASE_SEQUENCE[phaseIdx]);
    }, 2500);
  }

  function stopPhaseAnimation() {
    if (phaseIntervalRef.current) {
      clearInterval(phaseIntervalRef.current);
      phaseIntervalRef.current = null;
    }
    setCurrentPhase("verify");
  }

  async function handleSubmit() {
    if (!prompt.trim() || !id) return;
    setRunning(true);
    setCurrentPhase("parse");
    startPhaseAnimation();

    try {
      const result = await backend.agents.startSession({
        projectId: id,
        prompt: prompt.trim(),
      });
      stopPhaseAnimation();
      toast({ title: "Pipeline completed!", description: result.message });
      navigate(`/sessions/${result.session?.id || result.id || ""}`);
    } catch (e) {
      console.error(e);
      stopPhaseAnimation();
      toast({ title: "Pipeline failed", description: String(e), variant: "destructive" });
      setRunning(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to={id ? `/projects/${id}` : "/projects"}>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        {project && (
          <span className="text-slate-500 text-sm">
            <ChevronRight className="w-4 h-4 inline" /> {project.name}
          </span>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold text-white">New Agent Session</h1>
        <p className="text-slate-400 text-sm mt-1">
          Describe what you want to build. The AI pipeline will parse, plan, generate, and verify your project.
        </p>
      </div>

      {running && (
        <PipelineProgress currentPhase={currentPhase} running={running} />
      )}

      {!running && (
        <>
          {/* Prompt Input */}
          <div className="space-y-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to build…"
              className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 min-h-40 resize-none font-mono text-sm focus:border-blue-500 transition-colors"
              disabled={running}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">{prompt.length} characters</p>
              <Button
                onClick={handleSubmit}
                disabled={!prompt.trim() || running}
                className="bg-blue-500 hover:bg-blue-600 gap-2 px-6"
              >
                <Sparkles className="w-4 h-4" />
                Run Pipeline
              </Button>
            </div>
          </div>

          {/* Example Prompts */}
          <div>
            <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Example Prompts</p>
            <div className="space-y-2">
              {EXAMPLE_PROMPTS.map((example, i) => (
                <Card
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="bg-slate-900 border-slate-800 hover:border-blue-500/50 cursor-pointer transition-colors group"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-400 font-mono text-xs font-bold mt-0.5 flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="text-sm text-slate-300 group-hover:text-white transition-colors leading-relaxed">
                        {example}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}

      {running && (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">
            The AI pipeline is running. This may take 30–90 seconds…
          </p>
          <p className="text-slate-600 text-xs mt-2 font-mono">
            Gemini 2.0 Flash is analyzing your requirements
          </p>
        </div>
      )}
    </div>
  );
}

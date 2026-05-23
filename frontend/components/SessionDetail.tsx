import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import backend from "../lib/api";
import type { AgentSession, ExecutionRun, GeneratedFile } from "~backend/agents/types";

import StatusBadge from "./StatusBadge";
import FileViewer from "./FileViewer";
import { formatDate, formatDuration, getPhaseIcon, truncate } from "../lib/formatting";

interface VerificationResult {
  passed: boolean;
  issues: string[];
  suggestions: string[];
  score: number;
}

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [session, setSession] = useState<AgentSession | null>(null);
  const [runs, setRuns] = useState<ExecutionRun[]>([]);
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [sessionRes, filesRes] = await Promise.all([
          backend.agents.getSession({ id: id! }),
          backend.agents.getSessionFiles({ id: id! }),
        ]);
        setSession(sessionRes.session);
        setRuns(sessionRes.executionRuns);
        setFiles(filesRes.files);

        // Find verification run
        const verifyRun = (sessionRes.executionRuns || []).find((r: ExecutionRun) => r.phase === "verify");
        if (verifyRun?.output) {
          try {
            setVerificationResult(JSON.parse(verifyRun.output));
          } catch {}
        }
      } catch (e) {
        console.error(e);
        toast({ title: "Failed to load session", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="h-40 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return <div className="p-6 text-slate-500">Session not found.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to={`/projects/${session?.projectId}`}>
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <Button 
          onClick={() => window.open(`http://127.0.0.1:4000/agents/sessions/${id}/preview`, "_blank")}
          className="ml-auto bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer z-50 relative"
        >
          🌐 Open Live Preview
        </Button>
      </div>

      {/* Session Header */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={session?.status} />
                <span className="text-xs text-slate-500 font-mono">
                  Phase: {getPhaseIcon(session?.currentPhase)} {session?.currentPhase}
                </span>
              </div>
              <p className="text-slate-200 font-mono text-sm leading-relaxed max-w-2xl">
                {session?.prompt}
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-xs text-slate-500">
            <span>Created: {formatDate(session?.createdAt)}</span>
            <span>Updated: {formatDate(session?.updatedAt)}</span>
            <span className="font-mono">ID: {session?.id?.slice(0, 8)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Verification Result */}
      {verificationResult && (
        <Card className={`border ${verificationResult.passed ? "bg-emerald-950/30 border-emerald-800/50" : "bg-red-950/30 border-red-800/50"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {verificationResult.passed ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
              <span className={verificationResult.passed ? "text-emerald-400" : "text-red-400"}>
                Verification {verificationResult.passed ? "Passed" : "Failed"}
              </span>
              <Badge className="ml-auto bg-slate-800 text-slate-300 border-slate-600">
                Score: {verificationResult.score}/100
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(verificationResult?.issues || []).length > 0 && (
              <div>
                <p className="text-xs font-medium text-red-400 mb-1">Issues</p>
                <ul className="space-y-1">
                  {(verificationResult?.issues || []).map((issue, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">×</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(verificationResult?.suggestions || []).length > 0 && (
              <div>
                <p className="text-xs font-medium text-amber-400 mb-1">Suggestions</p>
                <ul className="space-y-1">
                  {(verificationResult?.suggestions || []).map((s, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">→</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Generated Files */}
      {files.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            Generated Files ({files.length})
          </h2>
          <FileViewer files={files} />
        </div>
      )}

      {/* Execution Runs */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          Pipeline Execution ({runs.length} phases)
        </h2>
        <div className="space-y-2">
          {(runs || []).map((run) => (
            <Card key={run.id} className="bg-slate-900 border-slate-800">
              <CardContent className="p-0">
                <button
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/30 transition-colors"
                  onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getPhaseIcon(run.phase)}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-200 capitalize">
                        {run.phase.replace(/_/g, " ")}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(run.durationMs)}
                        </span>
                        <StatusBadge status={run.status} />
                      </div>
                    </div>
                  </div>
                  {expandedRun === run.id ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {expandedRun === run.id && (
                  <div className="border-t border-slate-800 p-4 space-y-3">
                    {run.input && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Input</p>
                        <pre className="text-xs font-mono text-slate-400 bg-slate-950 p-3 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap">
                          {truncate(run.input, 500)}
                        </pre>
                      </div>
                    )}
                    {run.output && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Output</p>
                        <pre className="text-xs font-mono text-slate-400 bg-slate-950 p-3 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap">
                          {truncate(run.output, 1000)}
                        </pre>
                      </div>
                    )}
                    {run.errorMessage && (
                      <div>
                        <p className="text-xs font-medium text-red-400 mb-1">Error</p>
                        <pre className="text-xs font-mono text-red-300 bg-red-950/20 p-3 rounded-lg">
                          {run.errorMessage}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

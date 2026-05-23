import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Bot, Plus, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import backend from "../lib/api";
import type { Project, AgentSession } from "~backend/agents/types";
import StatusBadge from "./StatusBadge";
import { formatDate, truncate } from "../lib/formatting";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [projectRes, sessionsRes] = await Promise.all([
          backend.projects.getProject({ id: id! }),
          backend.agents.listSessions({ projectId: id }),
        ]);
        setProject(projectRes);
        setSessions(sessionsRes.sessions);
      } catch (e) {
        console.error(e);
        toast({ title: "Failed to load project", variant: "destructive" });
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
        <div className="h-32 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center text-slate-500">
        <p>Project not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/projects">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white gap-1">
            <ArrowLeft className="w-4 h-4" />
            Projects
          </Button>
        </Link>
      </div>

      {/* Project Info */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{project.name}</h1>
              <p className="text-slate-400 mt-2">{project.description}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(project.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" />
                  {project.id.slice(0, 8)}
                </span>
              </div>
            </div>
            <Link to={`/projects/${project.id}/session/new`}>
              <Button className="bg-blue-500 hover:bg-blue-600 gap-2">
                <Plus className="w-4 h-4" />
                New Session
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Sessions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          Agent Sessions ({sessions.length})
        </h2>
        {sessions.length === 0 ? (
          <div className="text-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <Bot className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium text-slate-400">No sessions yet</p>
            <p className="text-sm mt-1">Run the AI pipeline to generate code</p>
            <Link to={`/projects/${project.id}/session/new`}>
              <Button className="mt-4 bg-blue-500 hover:bg-blue-600 gap-2">
                <Bot className="w-4 h-4" />
                Start First Session
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Link key={session.id} to={`/sessions/${session.id}`}>
                <Card className="bg-slate-900 border-slate-800 hover:border-slate-600 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-slate-200 truncate">
                          {truncate(session.prompt, 80)}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span>{formatDate(session.createdAt)}</span>
                          <span className="capitalize">Phase: {session.currentPhase}</span>
                        </div>
                      </div>
                      <StatusBadge status={session.status} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

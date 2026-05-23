import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  Bot,
  FileCode,
  Coins,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import backend from "../lib/api";
import type { AgentSession, Project, AuditEntry } from "~backend/agents/types";
import StatusBadge from "./StatusBadge";
import { formatDate, formatTokens, truncate } from "../lib/formatting";

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [projectsRes, sessionsRes, auditRes] = await Promise.all([
          backend.projects.listProjects(),
          backend.agents.listSessions({}),
          backend.audit.listAudit({ limit: 100 }),
        ]);
        setProjects(projectsRes.projects);
        setSessions(sessionsRes.sessions);
        setAuditEntries(auditRes.entries);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalTokens = auditEntries.reduce(
    (sum, e) => sum + e.tokensIn + e.tokensOut,
    0
  );
  const filesGenerated = sessions.filter((s) => s.status === "completed").length;
  const activeSessions = sessions.filter((s) => s.status === "running").length;

  const stats = [
    { label: "Total Projects", value: projects.length, icon: FolderKanban, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Active Sessions", value: activeSessions, icon: Bot, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Completed Runs", value: filesGenerated, icon: FileCode, color: "text-violet-400", bg: "bg-violet-400/10" },
    { label: "Tokens Used", value: formatTokens(totalTokens), icon: Coins, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered project scaffold platform</p>
        </div>
        <Link to="/projects">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-slate-900 border-slate-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {loading ? "—" : stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Recent Sessions
              </span>
              <Link to="/projects" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-slate-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No sessions yet. Start a project!</p>
              </div>
            ) : (
              sessions.slice(0, 5).map((session) => (
                <Link
                  key={session.id}
                  to={`/sessions/${session.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50 hover:border-slate-600"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate font-mono">
                      {truncate(session.prompt, 50)}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(session.createdAt)}</p>
                  </div>
                  <StatusBadge status={session.status} className="ml-3 flex-shrink-0" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-violet-400" />
                Your Projects
              </span>
              <Link to="/projects" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Manage <ArrowRight className="w-3 h-3" />
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-slate-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No projects yet.</p>
                <Link to="/projects">
                  <Button size="sm" variant="outline" className="mt-3 border-slate-600 text-slate-300 hover:text-white">
                    Create your first project
                  </Button>
                </Link>
              </div>
            ) : (
              projects.slice(0, 4).map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50 hover:border-slate-600"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">{project.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{project.description}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 flex-shrink-0 ml-2 mt-0.5" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

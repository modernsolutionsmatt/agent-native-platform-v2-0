import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, ArrowRight, FolderKanban, Bot, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import backend from "../lib/api";
import type { Project } from "~backend/agents/types";
import { formatDate } from "../lib/formatting";

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  async function loadProjects() {
    try {
      const res = await backend.projects.listProjects();
      setProjects(res.projects);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to load projects", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await backend.projects.createProject({ name: name.trim(), description: description.trim() });
      toast({ title: "Project created!" });
      setCreateOpen(false);
      setName("");
      setDescription("");
      loadProjects();
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to create project", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await backend.projects.deleteProject({ id: deleteTarget.id });
      toast({ title: "Project deleted" });
      setDeleteTarget(null);
      loadProjects();
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to delete project", variant: "destructive" });
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-blue-500 hover:bg-blue-600 gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <FolderKanban className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-slate-400">No projects yet</p>
          <p className="text-sm mt-1">Create your first project to get started</p>
          <Button
            onClick={() => setCreateOpen(true)}
            className="mt-4 bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <FolderKanban className="w-5 h-5 text-blue-400" />
                  </div>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-semibold text-white mb-1 truncate">{project.name}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">{project.description}</p>

                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(project.createdAt)}</span>
                </div>

                <div className="flex gap-2">
                  <Link to={`/projects/${project.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 gap-1"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                  <Link to={`/projects/${project.id}/session/new`}>
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 gap-1">
                      <Bot className="w-3.5 h-3.5" />
                      Run
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-slate-300">Project Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Project"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you building?"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateOpen(false)} className="text-slate-400">
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || submitting}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {submitting ? "Creating…" : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete <strong className="text-white">{deleteTarget?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="text-slate-400">
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export function formatTokens(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return String(count);
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "completed":
      return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
    case "running":
      return "text-blue-400 bg-blue-400/10 border-blue-400/30";
    case "failed":
      return "text-red-400 bg-red-400/10 border-red-400/30";
    case "pending":
      return "text-amber-400 bg-amber-400/10 border-amber-400/30";
    default:
      return "text-slate-400 bg-slate-400/10 border-slate-400/30";
  }
}

export function getPhaseColor(phase: string): string {
  switch (phase.toLowerCase()) {
    case "parse":
      return "text-violet-400";
    case "plan":
      return "text-blue-400";
    case "execute":
      return "text-amber-400";
    case "verify":
      return "text-emerald-400";
    default:
      return "text-slate-400";
  }
}

export function getPhaseIcon(phase: string): string {
  switch (phase.toLowerCase()) {
    case "parse":
      return "🔍";
    case "plan":
      return "📋";
    case "execute":
      return "⚡";
    case "verify":
      return "✅";
    default:
      return "🔄";
  }
}

export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "…";
}

export function getLanguageLabel(lang: string): string {
  const map: Record<string, string> = {
    typescript: "TypeScript",
    javascript: "JavaScript",
    python: "Python",
    sql: "SQL",
    json: "JSON",
    yaml: "YAML",
    bash: "Bash",
    sh: "Shell",
    markdown: "Markdown",
    html: "HTML",
    css: "CSS",
    unknown: "Text",
  };
  return map[lang.toLowerCase()] ?? lang;
}

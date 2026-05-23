import { useEffect, useState } from "react";
import { ScrollText, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import backend from "../lib/api";
import type { AuditEntry } from "~backend/agents/types";
import { formatDate, formatTokens, truncate } from "../lib/formatting";

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionFilter, setSessionFilter] = useState("");
  const { toast } = useToast();

  async function load(sid?: string) {
    setLoading(true);
    try {
      const res = await backend.audit.listAudit({
        limit: 100,
        ...(sid ? { sessionId: sid } : {}),
      });
      setEntries(res.entries);
    } catch (e) {
      console.error(e);
      toast({ title: "Failed to load audit log", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleFilter() {
    load(sessionFilter.trim() || undefined);
  }

  const totalTokensIn = entries.reduce((s, e) => s + e.tokensIn, 0);
  const totalTokensOut = entries.reduce((s, e) => s + e.tokensOut, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-slate-400 text-sm mt-1">All LLM calls and system events</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono">
            <span className="text-slate-500">In:</span>{" "}
            <span className="text-violet-400">{formatTokens(totalTokensIn)}</span>
            <span className="text-slate-600 mx-1">·</span>
            <span className="text-slate-500">Out:</span>{" "}
            <span className="text-emerald-400">{formatTokens(totalTokensOut)}</span>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Input
          value={sessionFilter}
          onChange={(e) => setSessionFilter(e.target.value)}
          placeholder="Filter by session ID…"
          className="max-w-xs bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 font-mono text-sm"
        />
        <Button
          onClick={handleFilter}
          variant="outline"
          size="sm"
          className="border-slate-700 text-slate-300 gap-1"
        >
          <Filter className="w-3.5 h-3.5" />
          Filter
        </Button>
        {sessionFilter && (
          <Button
            onClick={() => { setSessionFilter(""); load(); }}
            variant="ghost"
            size="sm"
            className="text-slate-500"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-white">
            <ScrollText className="w-4 h-4 text-blue-400" />
            {entries.length} Entries
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No audit entries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-medium">
                    <th className="text-left px-4 py-3">Timestamp</th>
                    <th className="text-left px-4 py-3">Action</th>
                    <th className="text-left px-4 py-3">Entity</th>
                    <th className="text-left px-4 py-3">Session ID</th>
                    <th className="text-left px-4 py-3">Tokens In</th>
                    <th className="text-left px-4 py-3">Tokens Out</th>
                    <th className="text-left px-4 py-3">Model</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${
                        i % 2 === 0 ? "bg-transparent" : "bg-slate-900/30"
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-blue-400 font-mono">{entry.action}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{entry.entityType}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {entry.sessionId ? truncate(entry.sessionId, 12) : "—"}
                      </td>
                      <td className="px-4 py-3 text-violet-400 font-mono">
                        {entry.tokensIn > 0 ? formatTokens(entry.tokensIn) : "—"}
                      </td>
                      <td className="px-4 py-3 text-emerald-400 font-mono">
                        {entry.tokensOut > 0 ? formatTokens(entry.tokensOut) : "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">
                        {entry.modelName || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

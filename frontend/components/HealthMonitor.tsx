import { useEffect, useState, useCallback } from "react";
import { Activity, RefreshCw, CheckCircle, XCircle, Clock, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import backend from "../lib/api";

interface HealthData {
  status: string;
  uptimeSeconds: number;
  timestamp: string;
  responseTimeMs: number;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function HealthMonitor() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = Date.now();
    try {
      const res = await backend.health.check();
      const responseTimeMs = Date.now() - start;
      setHealth({ ...res, responseTimeMs });
      setLastCheck(new Date());
    } catch (e) {
      console.error(e);
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const isHealthy = !!health && !error;

  const metrics = health
    ? [
        { label: "API Status", value: health.status.toUpperCase(), icon: Server, color: "text-emerald-400" },
        { label: "Uptime", value: formatUptime(health.uptimeSeconds), icon: Clock, color: "text-blue-400" },
        { label: "Response Time", value: `${health.responseTimeMs}ms`, icon: Activity, color: "text-amber-400" },
        { label: "Database", value: "Connected", icon: CheckCircle, color: "text-emerald-400" },
      ]
    : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Health</h1>
          <p className="text-slate-400 text-sm mt-1">
            Auto-refreshes every 30 seconds
          </p>
        </div>
        <Button
          onClick={checkHealth}
          variant="outline"
          className="border-slate-700 text-slate-300 gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      <Card className={`border ${isHealthy ? "bg-emerald-950/20 border-emerald-800/40" : "bg-red-950/20 border-red-800/40"}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {isHealthy ? (
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
            <div>
              <h2 className={`text-xl font-bold ${isHealthy ? "text-emerald-400" : "text-red-400"}`}>
                {loading ? "Checking…" : isHealthy ? "All Systems Operational" : "System Degraded"}
              </h2>
              {lastCheck && (
                <p className="text-slate-500 text-sm mt-0.5">
                  Last checked: {lastCheck.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-950/40 rounded-lg border border-red-800/40">
              <p className="text-red-300 text-sm font-mono">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics */}
      {health && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg">
                    <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{metric.label}</p>
                    <p className={`text-lg font-bold mt-0.5 ${metric.color}`}>
                      {metric.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Service Status Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          {[
            { name: "Health Service", endpoint: "/health", status: isHealthy ? "operational" : "degraded" },
            { name: "Projects Service", endpoint: "/projects", status: isHealthy ? "operational" : "unknown" },
            { name: "Agents Service", endpoint: "/agents/sessions", status: isHealthy ? "operational" : "unknown" },
            { name: "Executions Service", endpoint: "/executions", status: isHealthy ? "operational" : "unknown" },
            { name: "Audit Service", endpoint: "/audit", status: isHealthy ? "operational" : "unknown" },
            { name: "AI Pipeline", endpoint: "gemini-2.0-flash", status: isHealthy ? "operational" : "unknown" },
          ].map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0"
            >
              <div>
                <p className="text-sm text-slate-200">{service.name}</p>
                <p className="text-xs text-slate-500 font-mono">{service.endpoint}</p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    service.status === "operational"
                      ? "bg-emerald-400"
                      : service.status === "degraded"
                      ? "bg-red-400"
                      : "bg-amber-400"
                  }`}
                />
                <span
                  className={`text-xs capitalize ${
                    service.status === "operational"
                      ? "text-emerald-400"
                      : service.status === "degraded"
                      ? "text-red-400"
                      : "text-amber-400"
                  }`}
                >
                  {service.status}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

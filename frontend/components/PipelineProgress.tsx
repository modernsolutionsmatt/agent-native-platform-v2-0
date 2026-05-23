import { getPhaseIcon } from "../lib/formatting";

const PHASES = [
  { key: "parse", label: "Parse", description: "Understanding your requirements" },
  { key: "plan", label: "Plan", description: "Creating implementation plan" },
  { key: "execute", label: "Execute", description: "Generating code files" },
  { key: "verify", label: "Verify", description: "Quality verification" },
];

interface PipelineProgressProps {
  currentPhase: string;
  running: boolean;
}

export default function PipelineProgress({ currentPhase, running }: PipelineProgressProps) {
  const currentIdx = PHASES.findIndex((p) => p.key === currentPhase);

  return (
    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-slate-300">AI Pipeline Running…</h3>
        {running && (
          <div className="flex items-center gap-2 text-xs text-blue-400 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-blue-400" />
            Processing
          </div>
        )}
      </div>

      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-6 left-6 right-6 h-px bg-slate-700" />

        <div className="relative flex justify-between">
          {PHASES.map((phase, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;
            const isPending = idx > currentIdx;

            return (
              <div key={phase.key} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 transition-all duration-500 ${
                    isCompleted
                      ? "bg-emerald-500/20 border-emerald-500 scale-100"
                      : isCurrent
                      ? "bg-blue-500/20 border-blue-400 scale-110 " + (running ? "animate-pulse" : "")
                      : "bg-slate-800 border-slate-700 scale-90 opacity-50"
                  }`}
                >
                  {getPhaseIcon(phase.key)}
                </div>
                <div className="text-center">
                  <p
                    className={`text-xs font-semibold ${
                      isCompleted
                        ? "text-emerald-400"
                        : isCurrent
                        ? "text-blue-400"
                        : "text-slate-600"
                    }`}
                  >
                    {phase.label}
                  </p>
                  <p className="text-xs text-slate-600 hidden sm:block max-w-20 text-center leading-tight mt-0.5">
                    {phase.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

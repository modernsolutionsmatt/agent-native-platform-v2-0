import { useState } from "react";
import { Copy, Check, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeneratedFile } from "~backend/agents/types";
import { getLanguageLabel } from "../lib/formatting";

interface FileViewerProps {
  files: GeneratedFile[];
}

export default function FileViewer({ files }: FileViewerProps) {
  const [selected, setSelected] = useState<GeneratedFile | null>(files[0] ?? null);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <FileCode className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No files generated</p>
      </div>
    );
  }

  return (
    <div className="flex h-96 border border-slate-700 rounded-xl overflow-hidden">
      {/* File Tree */}
      <div className="w-56 flex-shrink-0 bg-slate-950 border-r border-slate-700 overflow-y-auto">
        <div className="p-2 border-b border-slate-800">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide px-2">
            Files ({files.length})
          </p>
        </div>
        <div className="p-2 space-y-0.5">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelected(file)}
              className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono truncate transition-colors ${
                selected?.id === file.id
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {file.filePath}
            </button>
          ))}
        </div>
      </div>

      {/* Content Viewer */}
      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {selected && (
          <>
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-mono text-slate-300">{selected.filePath}</span>
                <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded">
                  {getLanguageLabel(selected.language)}
                </span>
              </div>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white h-7 px-2 gap-1"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copy</>
                )}
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <pre className="p-4 text-xs font-mono text-slate-300 leading-relaxed whitespace-pre-wrap break-all">
                <code>{selected.content}</code>
              </pre>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

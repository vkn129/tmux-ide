"use client";

import { useState, useCallback, useRef, type KeyboardEvent } from "react";
import yaml from "js-yaml";

// ── Types ──────────────────────────────────────────────────────────────

interface Pane {
  title?: string;
  command?: string;
  size?: string;
  focus?: boolean;
  role?: "lead" | "teammate";
  task?: string;
}

interface Row {
  size?: string;
  panes: Pane[];
}

interface Team {
  name: string;
  model?: string;
  permissions?: string[];
}

interface IdeConfig {
  name?: string;
  team?: Team;
  rows: Row[];
}

// ── Templates ──────────────────────────────────────────────────────────

const templates = [
  {
    id: "default",
    label: "Default",
    yaml: `name: my-project

rows:
  - size: 70%
    panes:
      - title: Claude 1
        command: claude
      - title: Claude 2
        command: claude

  - panes:
      - title: Dev Server
      - title: Shell`,
  },
  {
    id: "nextjs",
    label: "Next.js",
    yaml: `name: my-app

rows:
  - size: 70%
    panes:
      - title: Claude 1
        command: claude
      - title: Claude 2
        command: claude
      - title: Claude 3
        command: claude

  - panes:
      - title: Next.js
        command: pnpm dev
      - title: Shell
        focus: true`,
  },
  {
    id: "convex",
    label: "Convex",
    yaml: `name: my-app

rows:
  - size: 70%
    panes:
      - title: Claude 1
        command: claude
      - title: Claude 2
        command: claude
      - title: Claude 3
        command: claude

  - panes:
      - title: Next.js
        command: pnpm dev
      - title: Convex
        command: npx convex dev
      - title: Shell
        focus: true`,
  },
  {
    id: "vite",
    label: "Vite",
    yaml: `name: my-app

rows:
  - size: 70%
    panes:
      - title: Claude 1
        command: claude
      - title: Claude 2
        command: claude

  - panes:
      - title: Vite
        command: pnpm dev
      - title: Shell
        focus: true`,
  },
  {
    id: "python",
    label: "Python",
    yaml: `name: my-app

rows:
  - size: 70%
    panes:
      - title: Claude 1
        command: claude
      - title: Claude 2
        command: claude

  - panes:
      - title: Server
        command: uvicorn main:app --reload
      - title: Shell
        focus: true`,
  },
  {
    id: "go",
    label: "Go",
    yaml: `name: my-app

rows:
  - size: 70%
    panes:
      - title: Claude 1
        command: claude
      - title: Claude 2
        command: claude

  - panes:
      - title: Go
        command: go run .
      - title: Shell
        focus: true`,
  },
  {
    id: "agent-team",
    label: "Agent Team",
    yaml: `name: my-app

team:
  name: my-app

rows:
  - size: 70%
    panes:
      - title: Lead
        command: claude
        role: lead
        focus: true
      - title: Frontend
        command: claude
        role: teammate
        task: "Work on React components"
      - title: Backend
        command: claude
        role: teammate
        task: "Work on API routes"

  - panes:
      - title: Dev Server
        command: pnpm dev
      - title: Shell`,
  },
];

// ── Parsing ────────────────────────────────────────────────────────────

function parseConfig(text: string): IdeConfig | null {
  try {
    const parsed = yaml.load(text) as Record<string, unknown>;
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.rows)) return null;
    for (const row of parsed.rows) {
      if (!row || typeof row !== "object" || !Array.isArray(row.panes)) return null;
    }
    return parsed as unknown as IdeConfig;
  } catch {
    return null;
  }
}

// ── Sizing ─────────────────────────────────────────────────────────────

function computeSizes(items: { size?: string }[]): number[] {
  let claimed = 0;
  let unclaimed = 0;
  for (const item of items) {
    if (item.size) claimed += parseFloat(item.size);
    else unclaimed++;
  }
  const remaining = Math.max(0, 100 - claimed);
  const defaultSize = unclaimed > 0 ? remaining / unclaimed : 0;
  return items.map((item) => (item.size ? parseFloat(item.size) : defaultSize));
}

// ── Preview ────────────────────────────────────────────────────────────

function LayoutPreview({ config }: { config: IdeConfig }) {
  const rowSizes = computeSizes(config.rows);

  return (
    <div className="flex flex-col h-full">
      {/* Terminal chrome */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs text-neutral-400 font-mono ml-2">tmux session</span>
      </div>

      {/* Pane grid */}
      <div className="flex-1 flex flex-col p-2 gap-px min-h-[280px]">
        {config.rows.map((row, ri) => {
          const paneSizes = computeSizes(row.panes);
          return (
            <div key={ri} className="flex gap-px" style={{ flex: `${rowSizes[ri]} 0 0%` }}>
              {row.panes.map((pane, pi) => (
                <div
                  key={pi}
                  className={`flex flex-col rounded-sm px-3 py-2 bg-neutral-800/80 ${
                    pane.focus ? "border-l-2 border-l-green-500" : ""
                  }`}
                  style={{ flex: `${paneSizes[pi]} 0 0%` }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-neutral-200 truncate">
                      {pane.title || `Pane ${pi + 1}`}
                    </span>
                    {pane.role === "lead" && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium shrink-0">
                        lead
                      </span>
                    )}
                    {pane.role === "teammate" && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium shrink-0">
                        team
                      </span>
                    )}
                  </div>
                  {pane.command && (
                    <span className="text-[11px] font-mono text-neutral-500 truncate mt-0.5">
                      $ {pane.command}
                    </span>
                  )}
                  {pane.task && (
                    <span className="text-[10px] text-neutral-500 truncate mt-0.5 italic">
                      {pane.task}
                    </span>
                  )}
                  {pane.focus && (
                    <span className="text-[10px] text-green-500 mt-auto">◉ focus</span>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/10 text-[11px] font-mono text-neutral-500">
        <span>[0] {config.name || "session"}</span>
        <span>12:00</span>
      </div>
    </div>
  );
}

// ── Playground ─────────────────────────────────────────────────────────

export function ConfigPlayground() {
  const [yamlText, setYamlText] = useState(templates[0].yaml);
  const [config, setConfig] = useState<IdeConfig>(() => parseConfig(templates[0].yaml)!);
  const [error, setError] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string>("default");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleYamlChange = useCallback(
    (text: string) => {
      setYamlText(text);
      if (activeTemplate) setActiveTemplate("");
      const parsed = parseConfig(text);
      if (parsed) {
        setConfig(parsed);
        setError(null);
      } else {
        setError("Invalid YAML");
      }
    },
    [activeTemplate],
  );

  const handleTemplateClick = useCallback((t: (typeof templates)[0]) => {
    setYamlText(t.yaml);
    setActiveTemplate(t.id);
    setConfig(parseConfig(t.yaml)!);
    setError(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newText = yamlText.substring(0, start) + "  " + yamlText.substring(end);
        setYamlText(newText);
        // Update config from the new text
        const parsed = parseConfig(newText);
        if (parsed) {
          setConfig(parsed);
          setError(null);
        }
        // Restore cursor position after React re-renders
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
    },
    [yamlText],
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Template buttons */}
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTemplateClick(t)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTemplate === t.id
                ? "bg-fd-primary text-fd-primary-foreground"
                : "bg-fd-muted text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Editor + Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {/* YAML editor */}
        <div className="rounded-lg border border-fd-border bg-fd-background overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-fd-border">
            <span className="text-xs text-fd-muted-foreground font-mono">ide.yml</span>
            {error && <span className="text-xs text-red-500 font-mono">{error}</span>}
          </div>
          <textarea
            ref={textareaRef}
            value={yamlText}
            onChange={(e) => handleYamlChange(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="flex-1 p-4 font-mono text-sm leading-relaxed bg-transparent text-fd-foreground/80 resize-none outline-none min-h-[320px]"
          />
        </div>

        {/* Layout preview */}
        <div className="rounded-lg border border-fd-border overflow-hidden bg-neutral-900 text-neutral-200 flex flex-col">
          <LayoutPreview config={config} />
        </div>
      </div>
    </div>
  );
}

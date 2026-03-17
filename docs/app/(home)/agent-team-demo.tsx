"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────

interface DemoPane {
  id: string;
  title: string;
  role?: "lead" | "teammate";
  lines: string[];
}

interface DemoRow {
  size: number;
  panes: DemoPane[];
}

// ── Pane component ───────────────────────────────────────────────────

function DemoPaneView({
  pane,
  isActive,
  isNew,
}: {
  pane: DemoPane;
  isActive: boolean;
  isNew: boolean;
}) {
  return (
    <div
      className={`
        flex flex-col rounded-sm overflow-hidden min-w-0
        ${isNew ? "animate-pane-in" : ""}
        ${isActive ? "ring-1 ring-amber-500/40" : ""}
      `}
      style={isNew ? undefined : { flex: "1 1 0%" }}
    >
      {/* Pane title bar */}
      <div
        className={`
          flex items-center gap-1.5 px-2.5 py-1 text-[11px] border-b shrink-0
          ${isActive ? "border-amber-500/40 bg-amber-500/5" : "border-white/5 bg-white/[0.02]"}
        `}
      >
        <span
          className={`font-medium truncate ${isActive ? "text-amber-400" : "text-neutral-400"}`}
        >
          {isActive ? "▸" : "·"} {pane.title}
        </span>
        {pane.role === "lead" && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium shrink-0 ml-auto">
            lead
          </span>
        )}
        {pane.role === "teammate" && (
          <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium shrink-0 ml-auto">
            teammate
          </span>
        )}
      </div>
      {/* Pane content */}
      <div className="flex-1 p-2.5 bg-neutral-900/80 font-mono text-[11px] leading-[1.6] overflow-hidden">
        {pane.lines.map((line, i) => (
          <div key={i} className={lineColor(line)}>
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

function lineColor(line: string): string {
  if (line.startsWith("$")) return "text-neutral-300";
  if (line.startsWith("→") || line.startsWith("✓")) return "text-green-400/80";
  if (line.startsWith("⟡") || line.startsWith("●")) return "text-amber-400/80";
  if (line.startsWith("…")) return "text-blue-400/70";
  return "text-neutral-500";
}

// ── Demo orchestrator ────────────────────────────────────────────────

export function AgentTeamDemo() {
  const [rows, setRows] = useState<DemoRow[]>([]);
  const [activePane, setActivePane] = useState("lead");
  const [newPaneId, setNewPaneId] = useState<string | null>(null);
  const [phase, setPhase] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addLine = useCallback((paneId: string, line: string) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        panes: row.panes.map((p) => (p.id === paneId ? { ...p, lines: [...p.lines, line] } : p)),
      })),
    );
  }, []);

  const resetDemo = useCallback(() => {
    for (const t of timeoutsRef.current) clearTimeout(t);
    timeoutsRef.current = [];
    setNewPaneId(null);
    setActivePane("lead");
    setPhase(0);

    // Initial state: Lead + Frontend teammate | Dev + Shell
    setRows([
      {
        size: 70,
        panes: [
          {
            id: "lead",
            title: "Lead",
            role: "lead",
            lines: ['> "Start an agent team for my-app."'],
          },
          {
            id: "frontend",
            title: "Frontend",
            role: "teammate",
            lines: ["… teammate pane ready"],
          },
        ],
      },
      {
        size: 30,
        panes: [
          { id: "dev", title: "Next.js", lines: ["$ pnpm dev", "→ ready on localhost:3000"] },
          { id: "shell", title: "Shell", lines: ["$"] },
        ],
      },
    ]);

    const schedule = (ms: number, fn: () => void) => {
      timeoutsRef.current.push(setTimeout(fn, ms));
    };

    // Lead analyzes
    schedule(800, () => {
      addLine("lead", "⟡ Analyzing project structure...");
      addLine("frontend", "… Waiting for task assignment...");
      setPhase(1);
    });

    // Lead decides to spawn
    schedule(2200, () => {
      addLine("lead", "● Need an API specialist. Adding a teammate pane...");
      setPhase(2);
    });

    // New pane slides in
    schedule(3200, () => {
      setRows((prev) => {
        const newRows = [...prev];
        newRows[0] = {
          ...newRows[0],
          panes: [
            ...newRows[0].panes,
            {
              id: "api",
              title: "API Agent",
              role: "teammate",
              lines: ["… teammate pane ready"],
            },
          ],
        };
        return newRows;
      });
      setNewPaneId("api");
      setPhase(3);
    });

    // Team ready
    schedule(4000, () => {
      addLine("lead", "✓ Team ready — 3 Claude panes coordinating.");
      setNewPaneId(null);
      setPhase(4);
    });

    // Assign tasks
    schedule(5000, () => {
      addLine("lead", "");
      addLine("lead", "⟡ Assigning tasks:");
      addLine("lead", "  → Frontend: React components");
      addLine("lead", "  → API Agent: REST endpoints");
      setPhase(5);
    });

    // Teammates acknowledge
    schedule(6000, () => {
      addLine("frontend", "✓ Task received: React components");
      addLine("frontend", "… Reading src/components/...");
      setActivePane("frontend");
      setPhase(6);
    });

    schedule(6800, () => {
      addLine("api", "✓ Task received: REST endpoints");
      addLine("api", "… Reading src/api/routes/...");
      setActivePane("api");
    });

    // Working state
    schedule(7800, () => {
      setActivePane("lead");
      addLine("lead", "");
      addLine("lead", "⟡ Monitoring team progress...");
      setPhase(7);
    });

    // Loop
    schedule(11000, () => resetDemo());
  }, [addLine]);

  useEffect(() => {
    resetDemo();
    return () => {
      for (const t of timeoutsRef.current) clearTimeout(t);
    };
  }, [resetDemo]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="rounded-xl border border-white/10 overflow-hidden bg-neutral-950 shadow-2xl shadow-black/40">
        {/* Terminal chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-neutral-900/50">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
          </div>
          <span className="text-[11px] text-neutral-500 font-mono ml-2">MY-APP IDE</span>
          <div className="ml-auto flex items-center gap-2">
            {phase >= 3 ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-400/80 font-mono animate-fade-in">
                3 agents
              </span>
            ) : phase > 0 ? (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400/80 font-mono">
                2 agents
              </span>
            ) : null}
          </div>
        </div>

        {/* Pane grid */}
        <div className="flex flex-col min-h-[340px]">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-px" style={{ flex: `${row.size} 0 0%` }}>
              {row.panes.map((pane) => (
                <DemoPaneView
                  key={pane.id}
                  pane={pane}
                  isActive={activePane === pane.id}
                  isNew={newPaneId === pane.id}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/10 text-[10px] font-mono bg-neutral-900/50">
          <span className="text-amber-400/60">MY-APP IDE</span>
          <span className="text-neutral-600">
            {phase >= 3
              ? "team: my-app (3 members)"
              : phase > 0
                ? "team: my-app (2 members)"
                : "team: my-app"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Based on VibeTunnel (MIT) — github.com/amantus-ai/vibetunnel
import Foundation

/// A provider for generating tooltip strings for the status bar item.
enum TooltipProvider {
    @MainActor
    static func generateTooltip(
        serverManager: ServerManager,
        ngrokService: NgrokService,
        tailscaleService: TailscaleService,
        sessionMonitor: SessionMonitor)
        -> String
    {
        var parts: [String] = []

        // Daemon status
        if serverManager.isRunning {
            parts.append("Daemon: \(serverManager.bindAddress):\(serverManager.port)")
        } else {
            parts.append("Daemon stopped")
        }

        // Session info
        let sessions = Array(sessionMonitor.sessions.values)
        if !sessions.isEmpty {
            let active = sessions.filter(\.isActivityActive)
            let idle = sessions.count - active.count
            if !active.isEmpty {
                if idle > 0 {
                    parts.append("\(active.count) active, \(idle) idle")
                } else {
                    parts.append("\(active.count) active session\(active.count == 1 ? "" : "s")")
                }
            } else {
                parts.append("\(sessions.count) idle session\(sessions.count == 1 ? "" : "s")")
            }
        }

        // Orchestrator
        if sessionMonitor.orchestratorStatus {
            let progress = sessionMonitor.taskProgress
            if progress.total > 0 {
                parts.append("Tasks: \(progress.done)/\(progress.total)")
            }
        }

        return parts.joined(separator: "\n")
    }
}

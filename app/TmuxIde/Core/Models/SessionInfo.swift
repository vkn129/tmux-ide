// Based on VibeTunnel (MIT) — github.com/amantus-ai/vibetunnel
import Foundation

/// Information about a tmux session, combining tmux list-sessions data
/// with richer command-center REST API data when the daemon is running.
struct SessionInfo: Identifiable, Sendable {
    let id: String       // session name (tmux session_name)
    let name: String
    var windowCount: Int
    var attached: Bool
    var created: Date
    var panes: [PaneInfo]
    var agentCount: Int
    var missionTitle: String?
    var tasksDone: Int
    var tasksTotal: Int
    var orchestratorRunning: Bool

    /// Process id for window matching (optional).
    var pid: Int? = nil
    /// Working directory hint for window/title matching.
    var workingDir: String = ""
    /// Lifecycle status for window tracking (`"running"`, `"exited"`, …).
    var status: String = "running"

    /// True when the session is alive in tmux.
    var isRunning: Bool { status != "exited" }

    /// True when there is at least one attached client.
    var isActivityActive: Bool { attached }

    /// Alias used by VibeTunnel-derived status bar code.
    var startedAt: Date { created }
}

/// Minimal pane metadata from tmux or the command-center API.
struct PaneInfo: Identifiable, Sendable {
    let id: String       // tmux pane_id (%N)
    var title: String
    var currentCommand: String?
    var role: String?
    var isBusy: Bool
}

/// Type alias so VibeTunnel-derived views that reference `ServerSessionInfo`
/// continue to compile without changes.
typealias ServerSessionInfo = SessionInfo

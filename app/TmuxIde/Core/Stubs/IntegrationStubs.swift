// Minimal stubs for VibeTunnel-derived integrations (WS v3 events, ngrok metrics, dev server).
import Foundation

// MARK: - Ngrok

struct TunnelMetrics: Codable, Equatable, Sendable {
    let connectionsCount: Int
    let bytesIn: Int
    let bytesOut: Int
}

// MARK: - Dev server (AppConstants)

struct DevServerConfig: Sendable {
    var useDevServer: Bool

    static func current() -> DevServerConfig {
        DevServerConfig(useDevServer: UserDefaults.standard.bool(forKey: "useDevServer"))
    }
}

// MARK: - Server events (notification service / WS v3)

enum ServerEventType: String, Sendable {
    case sessionStart
    case sessionExit
    case commandFinished
    case commandError
    case bell
    case connected
    case testNotification
}

struct ServerEvent: Sendable {
    var type: ServerEventType
    var displayName: String = ""
    var sessionId: String?
    var sessionName: String?
    var command: String?
    var exitCode: Int?
    var duration: Int?
    var formattedDuration: String?
    var message: String?
    var title: String?
    var body: String?
}

// MARK: - WS v3 client (stub — real transport can be wired to command-center later)

enum WsV3ConnectionState: Equatable, Sendable {
    case disconnected
    case connecting
    case connected
}

@MainActor
final class WsV3SocketClient {
    static let shared = WsV3SocketClient()

    var onConnectionStateChange: ((WsV3ConnectionState) -> Void)?
    var onServerEvent: ((ServerEvent, Data?) -> Void)?

    private init() {}

    func connect(serverPort: String, authMode: String, token: String?) {
        onConnectionStateChange?(.connecting)
        // Stub: no live socket; mark disconnected so UI does not assume streaming.
        onConnectionStateChange?(.disconnected)
    }

    func disconnect() {
        onConnectionStateChange?(.disconnected)
    }

    func subscribeGlobalEvents() {}
}

// MARK: - Unix socket (stub — daemon IPC not used in tmux-ide Mac app yet)

final class SharedUnixSocketManager: @unchecked Sendable {
    static let shared = SharedUnixSocketManager()

    static let unixSocketReadyNotification = Notification.Name("tmuxide.unixSocketReady")

    /// Stub: treated as ready so `NotificationService` can proceed without blocking.
    var isConnected: Bool { true }

    private init() {}
}

// MARK: - App shell (legacy VibeTunnel entry points)

@MainActor
final class AppDelegate: NSObject {
    static weak var shared: AppDelegate?

    /// Wired when using `NSApplicationDelegateAdaptor`; optional for SwiftUI-only lifecycle.
    var statusBarController: StatusBarController?

    static func showWelcomeScreen() {
        NotificationCenter.default.post(name: .showWelcomeScreen, object: nil)
    }
}

/// Placeholder for future session orchestration APIs referenced by the status bar menu.
@MainActor
@Observable
final class SessionService {
    let serverManager: ServerManager
    let sessionMonitor: SessionMonitor

    init(serverManager: ServerManager, sessionMonitor: SessionMonitor) {
        self.serverManager = serverManager
        self.sessionMonitor = sessionMonitor
    }

    func terminateSession(named _: String) async {}
}

enum DashboardURLBuilder {
    static func dashboardURL(port: String) -> URL? {
        URL(string: "http://127.0.0.1:\(port)")
    }

    static func dashboardURL(port: String, sessionId: String) -> URL? {
        let enc = sessionId.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) ?? sessionId
        return URL(string: "http://127.0.0.1:\(port)/project/\(enc)")
    }
}

@MainActor
final class SparkleUpdaterManager {
    static let shared = SparkleUpdaterManager()

    func checkForUpdates() {
        // Sparkle not bundled in the stub build.
    }

    private init() {}
}

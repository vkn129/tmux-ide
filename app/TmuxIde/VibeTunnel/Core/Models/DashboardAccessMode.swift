// Based on VibeTunnel (MIT) — github.com/amantus-ai/vibetunnel
import Foundation

/// Controls whether the dashboard is accessible only from localhost or across the network.
enum DashboardAccessMode: String, CaseIterable {
    case localhost
    case network

    var displayName: String {
        switch self {
        case .localhost: "Localhost Only"
        case .network: "Network"
        }
    }

    /// Bind address passed to server configuration helpers / logging.
    var bindAddress: String {
        switch self {
        case .localhost: "127.0.0.1"
        case .network: "0.0.0.0"
        }
    }
}

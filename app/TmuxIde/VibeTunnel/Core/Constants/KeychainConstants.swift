// Based on VibeTunnel (MIT) — github.com/amantus-ai/vibetunnel
import Foundation

/// Centralized keychain service and account names
enum KeychainConstants {
    // MARK: - Service Names

    static let tmuxIdeService = "sh.tmuxide.tmuxide"

    // MARK: - Account Names

    static let ngrokAuthToken = "ngrokAuthToken"
    static let authToken = "authToken"
    static let dashboardPassword = "dashboard-password"
}

// Based on VibeTunnel (MIT) — github.com/amantus-ai/vibetunnel
import Foundation

/// Update channel selection (stub — Sparkle updates not yet integrated).
enum UpdateChannel: String, CaseIterable, Identifiable {
    case stable
    case beta

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .stable: "Stable"
        case .beta: "Beta"
        }
    }

    /// CustomStringConvertible-style label for settings UI.
    var description: String { displayName }
}

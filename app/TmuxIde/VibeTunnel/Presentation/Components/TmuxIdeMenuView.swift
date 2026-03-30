// Based on VibeTunnel (MIT) — github.com/amantus-ai/vibetunnel
import AppKit
import SwiftUI

/// Main menu view displayed when left-clicking the status bar item.
/// Shows daemon status, tmux session list, and quick actions.
struct TmuxIdeMenuView: View {
    @Environment(SessionMonitor.self)
    var sessionMonitor
    @Environment(ServerManager.self)
    var serverManager
    @Environment(\.colorScheme)
    private var colorScheme

    @State private var hoveredSessionId: String?
    @State private var hasStartedKeyboardNavigation = false
    @FocusState private var focusedField: MenuFocusField?

    var body: some View {
        VStack(spacing: 0) {
            // Header: daemon status
            HStack {
                Image(systemName: serverManager.isRunning ? "circle.fill" : "circle")
                    .foregroundColor(serverManager.isRunning ? .green : .secondary)
                    .font(.system(size: 8))
                Text(serverManager.isRunning ? "Daemon running" : "Daemon stopped")
                    .font(.system(size: 12, weight: .medium))
                Spacer()
                if sessionMonitor.orchestratorStatus {
                    Text("orch")
                        .font(.system(size: 9, weight: .medium, design: .monospaced))
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(Capsule().fill(.blue.opacity(0.2)))
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(
                LinearGradient(
                    colors: self.colorScheme == .dark ? MenuStyles.headerGradientDark : MenuStyles
                        .headerGradientLight,
                    startPoint: .top,
                    endPoint: .bottom))

            Divider()

            // Session list
            ScrollView {
                LazyVStack(spacing: 0) {
                    let active = activeSessions
                    let idle = idleSessions

                    if active.isEmpty && idle.isEmpty {
                        Text("No tmux sessions")
                            .font(.system(size: 12))
                            .foregroundColor(.secondary)
                            .padding(.vertical, 20)
                    }

                    if !active.isEmpty {
                        sectionHeader("Active")
                        ForEach(active, id: \.key) { entry in
                            sessionRow(entry.key, entry.value)
                        }
                    }
                    if !idle.isEmpty {
                        sectionHeader("Idle")
                        ForEach(idle, id: \.key) { entry in
                            sessionRow(entry.key, entry.value)
                        }
                    }
                }
            }
            .frame(maxHeight: 600)

            Divider()

            // Bottom action bar
            MenuActionBar(
                showingNewSession: .constant(false),
                focusedField: Binding(
                    get: { self.focusedField },
                    set: { self.focusedField = $0 }),
                hasStartedKeyboardNavigation: self.hasStartedKeyboardNavigation)
        }
        .frame(width: MenuStyles.menuWidth)
        .background(Color.clear)
        .focusable()
        .focusEffectDisabled()
        .onKeyPress { keyPress in
            if keyPress.key == .tab && !self.hasStartedKeyboardNavigation {
                self.hasStartedKeyboardNavigation = true
                return .ignored
            }
            if keyPress.key == .upArrow || keyPress.key == .downArrow {
                self.hasStartedKeyboardNavigation = true
                return self.handleArrowKeyNavigation(keyPress.key == .upArrow)
            }
            if keyPress.key == .return {
                return self.handleEnterKey()
            }
            return .ignored
        }
    }

    // MARK: - Subviews

    private func sectionHeader(_ title: String) -> some View {
        Text(title.uppercased())
            .font(.system(size: 10, weight: .semibold))
            .foregroundColor(.secondary)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 16)
            .padding(.top, 10)
            .padding(.bottom, 4)
    }

    private func sessionRow(_ name: String, _ info: SessionInfo) -> some View {
        HStack {
            Circle()
                .fill(info.attached ? Color.green : Color.secondary.opacity(0.5))
                .frame(width: 6, height: 6)
            Text(name)
                .font(.system(size: 12, weight: .medium, design: .monospaced))
            Spacer()
            if info.agentCount > 0 {
                Text("\(info.agentCount) agents")
                    .font(.system(size: 10))
                    .foregroundColor(.secondary)
            }
            Text("\(info.windowCount)W")
                .font(.system(size: 10))
                .foregroundColor(.secondary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 6)
                .fill(hoveredSessionId == name
                    ? AppColors.Fallback.controlBackground(for: colorScheme).opacity(0.5)
                    : Color.clear))
        .onHover { hovering in hoveredSessionId = hovering ? name : nil }
        .onTapGesture {
            // Attach to the session via tmux
            let process = Process()
            process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
            process.arguments = ["tmux-ide", "attach", name]
            try? process.run()
            NSApp.windows.first { $0.className == "TmuxIdeMenuWindow" }?.close()
        }
    }

    // MARK: - Data

    private var activeSessions: [(key: String, value: SessionInfo)] {
        self.sessionMonitor.sessions
            .filter { $0.value.isRunning && $0.value.isActivityActive }
            .sorted { $0.value.startedAt > $1.value.startedAt }
    }

    private var idleSessions: [(key: String, value: SessionInfo)] {
        self.sessionMonitor.sessions
            .filter { $0.value.isRunning && !$0.value.isActivityActive }
            .sorted { $0.value.startedAt > $1.value.startedAt }
    }

    // MARK: - Keyboard Navigation

    private func handleArrowKeyNavigation(_ isUpArrow: Bool) -> KeyPress.Result {
        let allSessions = self.activeSessions + self.idleSessions
        let focusableFields: [MenuFocusField] = allSessions.map { .sessionRow($0.key) } +
            [.settingsButton, .quitButton]

        guard let currentFocus = focusedField,
              let currentIndex = focusableFields.firstIndex(of: currentFocus)
        else {
            if !focusableFields.isEmpty {
                self.focusedField = focusableFields[0]
            }
            return .handled
        }

        let newIndex: Int = if isUpArrow {
            currentIndex > 0 ? currentIndex - 1 : focusableFields.count - 1
        } else {
            currentIndex < focusableFields.count - 1 ? currentIndex + 1 : 0
        }

        self.focusedField = focusableFields[newIndex]
        return .handled
    }

    private func handleEnterKey() -> KeyPress.Result {
        guard let currentFocus = focusedField else { return .ignored }

        switch currentFocus {
        case let .sessionRow(sessionId):
            if sessionMonitor.sessions[sessionId] != nil {
                let process = Process()
                process.executableURL = URL(fileURLWithPath: "/usr/bin/env")
                process.arguments = ["tmux-ide", "attach", sessionId]
                try? process.run()
                NSApp.windows.first { $0.className == "TmuxIdeMenuWindow" }?.close()
            }
            return .handled

        case .newSessionButton:
            return .handled

        case .settingsButton:
            SettingsOpener.openSettings()
            NSApp.windows.first { $0.className == "TmuxIdeMenuWindow" }?.close()
            return .handled

        case .quitButton:
            NSApplication.shared.terminate(nil)
            return .handled
        }
    }
}

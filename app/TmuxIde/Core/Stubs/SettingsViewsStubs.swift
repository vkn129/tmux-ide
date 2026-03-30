// Minimal SwiftUI stubs for settings tabs that were not vendored with VibeTunnel.
import os.log
import SwiftUI

/// Placeholder for the full authentication picker (moved from Security tab).
struct AuthenticationSection: View {
    @Binding var authMode: AuthenticationMode
    var enableSSHKeys: Binding<Bool>
    let logger: Logger
    let serverManager: ServerManager

    var body: some View {
        Section {
            Text("Authentication mode is managed via UserDefaults in this build.")
                .font(.callout)
                .foregroundStyle(.secondary)
            Picker("Mode", selection: self.$authMode) {
                ForEach(AuthenticationMode.allCases, id: \.self) { mode in
                    Text(mode.displayName).tag(mode)
                }
            }
            .onChange(of: self.authMode) { _, newValue in
                self.logger.debug("auth mode \(newValue.rawValue)")
                UserDefaults.standard.set(newValue.rawValue, forKey: AppConstants.UserDefaultsKeys.authenticationMode)
                Task { await self.serverManager.restart() }
            }
            Toggle("Enable SSH keys", isOn: self.enableSSHKeys)
                .disabled(true)
        } header: {
            Text("Authentication")
        }
    }
}

/// Dashboard / command-center URL tab (stub UI).
struct DashboardSettingsView: View {
    @AppStorage(AppConstants.UserDefaultsKeys.serverPort)
    private var serverPort = "4020"

    var body: some View {
        Form {
            Section {
                Text("Open the local dashboard in your browser when the daemon is running.")
                    .font(.callout)
                    .foregroundStyle(.secondary)
                if let url = DashboardURLBuilder.dashboardURL(port: serverPort) {
                    Link("Open dashboard", destination: url)
                }
            } header: {
                Text("Dashboard")
            }
        }
        .formStyle(.grouped)
        .frame(minWidth: 500, idealWidth: 600)
    }
}

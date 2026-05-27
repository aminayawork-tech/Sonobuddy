import SwiftUI
import OneSignalFramework

@main
struct SonoBuddyApp: App {
    @StateObject private var purchaseManager = PurchaseManager.shared

    init() {
        // Replace with your OneSignal App ID from onesignal.com → Settings → Keys & IDs
        OneSignal.initialize("YOUR_ONESIGNAL_APP_ID", withLaunchOptions: nil)
        OneSignal.Notifications.requestPermission({ accepted in
            print("[OneSignal] permission accepted: \(accepted)")
        }, fallbackToSettings: false)
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(purchaseManager)
                .preferredColorScheme(.dark)
                .task { await purchaseManager.checkStatus() }
        }
    }
}

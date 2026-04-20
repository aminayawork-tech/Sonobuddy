import SwiftUI

@main
struct SonoBuddyApp: App {
    @StateObject private var purchaseManager = PurchaseManager.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(purchaseManager)
                .preferredColorScheme(.dark)
                .task { await purchaseManager.checkStatus() }
        }
    }
}

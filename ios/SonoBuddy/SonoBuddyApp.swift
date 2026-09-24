import SwiftUI
import UserNotifications
import WebKit

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        Self.purgeStaleWebViewCacheOnce()

        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, _ in
            guard granted else { return }
            DispatchQueue.main.async {
                UIApplication.shared.registerForRemoteNotifications()
            }
        }
        return true
    }

    /// Older builds cached HTTP responses for the app's custom URL schemes
    /// before those responses declared `Cache-Control: no-store`, including
    /// 404s for pathology images that didn't exist yet at the time. Because
    /// WKWebView's cache lives in the app's persistent container, that stale
    /// 404 survives a normal App Store/TestFlight update and keeps hiding
    /// images that are now bundled — only a full delete+reinstall would clear
    /// it otherwise. Run once per install to purge just the HTTP cache
    /// layers; localStorage (onboarding state, quick-access picks, the
    /// share-unlock flag) is untouched.
    private static func purgeStaleWebViewCacheOnce() {
        let key = "purgedStaleWebViewCache_v1"
        guard !UserDefaults.standard.bool(forKey: key) else { return }
        let types: Set<String> = [WKWebsiteDataTypeDiskCache, WKWebsiteDataTypeMemoryCache]
        WKWebsiteDataStore.default().removeData(ofTypes: types, modifiedSince: .distantPast) {
            UserDefaults.standard.set(true, forKey: key)
        }
    }

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        Task { await Self.saveToken(token) }
    }

    private static func saveToken(_ token: String) async {
        guard let url = URL(string: "https://www.sonobuddy.com/api/push/apns-token/") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try? JSONSerialization.data(withJSONObject: ["token": token])
        _ = try? await URLSession.shared.data(for: req)
    }
}

@main
struct SonoBuddyApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
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

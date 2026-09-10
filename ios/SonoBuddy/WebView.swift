import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL
    let purchaseManager: PurchaseManager

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true

        config.setURLSchemeHandler(WebAppSchemeHandler(), forURLScheme: "sono-web")
        config.setURLSchemeHandler(ImageSchemeHandler(), forURLScheme: "sono")

        // Inject premium flag before the page parses any JS so usePremium() reads it synchronously
        let isPremium = purchaseManager.isPremium
        let premiumScript = WKUserScript(
            source: "window.__isPremium = \(isPremium ? "true" : "false");",
            injectionTime: .atDocumentStart,
            forMainFrameOnly: true
        )
        config.userContentController.addUserScript(premiumScript)

        // Rewrite /pathologies/* image src to sono:// for offline bundle serving
        let rewriteScript = WKUserScript(
            source: imageRewriteJS,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        config.userContentController.addUserScript(rewriteScript)

        // Register the native message handler (purchase / restore actions from JS)
        config.userContentController.add(context.coordinator, name: "sonobuddy")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = false
        webView.customUserAgent = "SonoBuddyApp/iOS"
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.isOpaque = true
        let pageColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1)
        webView.backgroundColor = pageColor
        webView.scrollView.backgroundColor = pageColor

        webView.load(URLRequest(url: url))
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        // When premium is granted mid-session (purchase or checkStatus result),
        // notify the web layer so it unlocks without requiring a page reload.
        if purchaseManager.isPremium, !context.coordinator.didNotifyPremium {
            context.coordinator.didNotifyPremium = true
            webView.evaluateJavaScript("window.__onPremiumUnlocked?.()") { _, _ in }
        }
    }

    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "sonobuddy")
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    private let imageRewriteJS = """
    (function () {
      function rewrite(img) {
        var src = img.getAttribute('src');
        if (src && src.indexOf('/pathologies/') === 0) {
          var file = src.slice('/pathologies/'.length);
          img.setAttribute('src', 'sono://pathologies/' + encodeURIComponent(file));
        }
      }
      function rewriteAll() { document.querySelectorAll('img').forEach(rewrite); }
      new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          m.addedNodes.forEach(function (node) {
            if (node.nodeName === 'IMG') { rewrite(node); }
            if (node.querySelectorAll) { node.querySelectorAll('img').forEach(rewrite); }
          });
        });
      }).observe(document.documentElement, { childList: true, subtree: true });
      if (document.readyState !== 'loading') { rewriteAll(); }
      else { document.addEventListener('DOMContentLoaded', rewriteAll); }
    })();
    """

    class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler {
        var didNotifyPremium = false

        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "sonobuddy",
                  let body = message.body as? [String: Any],
                  let action = body["action"] as? String else { return }
            let webView = message.webView

            if action == "share" {
                presentShareSheet(webView: webView)
                return
            }

            Task { @MainActor in
                do {
                    switch action {
                    case "purchase":
                        try await PurchaseManager.shared.purchase()
                    case "purchaseDiscount":
                        try await PurchaseManager.shared.purchaseDiscount()
                    case "restore":
                        try await PurchaseManager.shared.restore()
                    default:
                        return
                    }
                    if PurchaseManager.shared.isPremium {
                        didNotifyPremium = true
                        webView?.evaluateJavaScript("window.__onPremiumUnlocked?.()") { _, _ in }
                    }
                } catch {
                    // A silent failure here reads to the user as "the button did
                    // nothing," which is exactly what drives someone to tap
                    // Restore Purchase over and over — surface it instead.
                    let message = (error as? PurchaseError)?.message ?? "Something went wrong — please try again."
                    let escaped = message.replacingOccurrences(of: "'", with: "\\'")
                    webView?.evaluateJavaScript("window.__onPurchaseError?.('\(escaped)')") { _, _ in }
                }
            }
        }

        /// Presents the system share sheet for the App Store listing. Calls back
        /// into JS only when the user actually completes a share (picks a
        /// target) — cancelling leaves the paywall's share offer untouched so
        /// they can try again, rather than silently unlocking the discount for
        /// someone who backed out.
        @MainActor
        private func presentShareSheet(webView: WKWebView?) {
            guard let presenter = Self.topViewController() else { return }
            let text = "I've been using SonoBuddy for ultrasound reference on the job — measurements, protocols, calculators, and pathology, all offline. Worth a look:"
            let url = URL(string: "https://apps.apple.com/us/app/sonobuddy-pro/id6761020726")!
            let activity = UIActivityViewController(activityItems: [text, url], applicationActivities: nil)
            if let popover = activity.popoverPresentationController {
                popover.sourceView = presenter.view
                popover.sourceRect = CGRect(x: presenter.view.bounds.midX, y: presenter.view.bounds.maxY, width: 0, height: 0)
                popover.permittedArrowDirections = []
            }
            activity.completionWithItemsHandler = { _, completed, _, _ in
                guard completed else { return }
                webView?.evaluateJavaScript("window.__onShareCompleted?.()") { _, _ in }
            }
            presenter.present(activity, animated: true)
        }

        private static func topViewController() -> UIViewController? {
            guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
                  let root = scene.windows.first(where: { $0.isKeyWindow })?.rootViewController else {
                return nil
            }
            var top = root
            while let presented = top.presentedViewController { top = presented }
            return top
        }

        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else { decisionHandler(.allow); return }
            let scheme = url.scheme ?? ""
            if (scheme == "http" || scheme == "https") && navigationAction.navigationType == .linkActivated {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            // mailto:/tel:/sms: can't be loaded by WKWebView — letting them
            // through fails the navigation and drops the user on the offline
            // screen. Hand them to the system instead.
            if ["mailto", "tel", "sms", "facetime"].contains(scheme) {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            let html = """
            <html>
            <head><meta name='viewport' content='width=device-width, initial-scale=1'>
            <style>
            * { box-sizing: border-box; }
            body { background: #0F172A; color: #94A3B8; font-family: -apple-system, sans-serif;
                   display: flex; flex-direction: column; align-items: center; justify-content: center;
                   height: 100vh; margin: 0; text-align: center; padding: 32px; }
            h2 { color: #F1F5F9; font-size: 22px; margin: 0 0 10px; }
            p  { font-size: 14px; line-height: 1.6; margin: 0 0 28px; max-width: 280px; }
            button { background: #0EA5E9; color: #fff; border: none; border-radius: 12px;
                     padding: 14px 32px; font-size: 16px; font-weight: 600; -webkit-appearance: none; }
            </style></head>
            <body>
            <h2>You're Offline</h2>
            <p>Open SonoBuddy once with a connection and all content will be available offline.</p>
            <button onclick="window.location.reload()">Try Again</button>
            </body></html>
            """
            webView.loadHTMLString(html, baseURL: nil)
        }
    }
}

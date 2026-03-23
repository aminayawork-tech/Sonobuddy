import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        webView.isOpaque = false
        // sky-100 (#e0f2fe) — matches page top gradient so iOS overscroll doesn't flash dark
        webView.backgroundColor = UIColor(red: 224/255, green: 242/255, blue: 254/255, alpha: 1)
        webView.scrollView.backgroundColor = UIColor(red: 224/255, green: 242/255, blue: 254/255, alpha: 1)

        let request = URLRequest(url: url, cachePolicy: .returnCacheDataElseLoad)
        webView.load(request)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        // Intentionally empty — load happens once in makeUIView
    }

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    class Coordinator: NSObject, WKNavigationDelegate {
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.allow)
                return
            }
            // Open external links in Safari
            if let host = url.host, !host.contains("sonobuddy") && navigationAction.navigationType == .linkActivated {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            // Load offline fallback page on network error
            let html = """
            <html>
            <head>
            <meta name='viewport' content='width=device-width, initial-scale=1'>
            <style>
            body { background: #0F172A; color: #94A3B8; font-family: -apple-system; display: flex;
                   flex-direction: column; align-items: center; justify-content: center;
                   height: 100vh; margin: 0; text-align: center; padding: 24px; box-sizing: border-box; }
            h2 { color: #F1F5F9; margin-bottom: 8px; }
            p  { font-size: 14px; line-height: 1.6; }
            </style>
            </head>
            <body>
            <h2>You're Offline</h2>
            <p>SonoBuddy needs an internet connection to load.<br>Please check your connection and try again.</p>
            </body>
            </html>
            """
            webView.loadHTMLString(html, baseURL: nil)
        }
    }
}

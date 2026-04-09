import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true

        // Serve bundled pathology images via sono:// so they work offline
        config.setURLSchemeHandler(ImageSchemeHandler(), forURLScheme: "sono")

        // Rewrite /pathologies/* image src attributes to sono://pathologies/*
        // so the native scheme handler intercepts them instead of the network.
        // Uses MutationObserver to catch images React renders after hydration.
        let script = WKUserScript(
            source: imageRewriteJS,
            injectionTime: .atDocumentStart,
            forMainFrameOnly: false
        )
        config.userContentController.addUserScript(script)

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = false
        // Tag requests so the web app knows it's running inside the native wrapper
        webView.customUserAgent = "SonoBuddyApp/iOS"
        // .never lets web CSS handle safe areas via env(safe-area-inset-*),
        // which fixes position:fixed elements (nav bar) moving in WKWebView
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.isOpaque = true
        // slate-100 (#F1F5F9) — matches sono-dark page background so overscroll doesn't flash a different color
        let pageColor = UIColor(red: 241/255, green: 245/255, blue: 249/255, alpha: 1)
        webView.backgroundColor = pageColor
        webView.scrollView.backgroundColor = pageColor

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

    // Rewrites /pathologies/* image src values to sono://pathologies/* so the
    // native ImageSchemeHandler serves them from the app bundle (works offline).
    private let imageRewriteJS = """
    (function () {
      function rewrite(img) {
        var src = img.getAttribute('src');
        if (src && src.indexOf('/pathologies/') === 0) {
          var file = src.slice('/pathologies/'.length);
          img.setAttribute('src', 'sono://pathologies/' + encodeURIComponent(file));
        }
      }

      function rewriteAll() {
        document.querySelectorAll('img').forEach(rewrite);
      }

      // Watch for images React adds after hydration
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

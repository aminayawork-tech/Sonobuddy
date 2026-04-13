import SwiftUI
import WebKit

struct WebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true

        // Serve the bundled Next.js static export via sono-web:// (full offline support)
        config.setURLSchemeHandler(WebAppSchemeHandler(), forURLScheme: "sono-web")

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
        // sono-dark (#0F172A) — matches app background so overscroll doesn't flash a different color
        let pageColor = UIColor(red: 15/255, green: 23/255, blue: 42/255, alpha: 1)
        webView.backgroundColor = pageColor
        webView.scrollView.backgroundColor = pageColor

        let request = URLRequest(url: url)
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
            // Open external http/https links in Safari; let sono-web:// navigate internally
            let scheme = url.scheme ?? ""
            if (scheme == "http" || scheme == "https") && navigationAction.navigationType == .linkActivated {
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
            * { box-sizing: border-box; }
            body { background: #0F172A; color: #94A3B8; font-family: -apple-system, sans-serif;
                   display: flex; flex-direction: column; align-items: center; justify-content: center;
                   height: 100vh; margin: 0; text-align: center; padding: 32px; }
            svg { margin-bottom: 20px; opacity: 0.4; }
            h2 { color: #F1F5F9; font-size: 22px; margin: 0 0 10px; }
            p  { font-size: 14px; line-height: 1.6; margin: 0 0 28px; max-width: 280px; }
            button { background: #0EA5E9; color: #fff; border: none; border-radius: 12px;
                     padding: 14px 32px; font-size: 16px; font-weight: 600; cursor: pointer;
                     -webkit-appearance: none; }
            </style>
            </head>
            <body>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
              <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
              <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
              <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
              <line x1="12" y1="20" x2="12.01" y2="20"/>
            </svg>
            <h2>You're Offline</h2>
            <p>Open SonoBuddy once with a connection and all content will be available offline.</p>
            <button onclick="window.location.reload()">Try Again</button>
            </body>
            </html>
            """
            webView.loadHTMLString(html, baseURL: nil)
        }
    }
}

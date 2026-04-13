import WebKit

/// Serves the statically-exported Next.js web app from the app bundle via the
/// `sono-web://` custom URL scheme. This makes the entire app available offline
/// with no network connection required.
///
/// URL mapping:
///   sono-web:///home          → <Bundle>/WebApp/home/index.html
///   sono-web:///_next/static/ → <Bundle>/WebApp/_next/static/…
///   sono-web:///              → <Bundle>/WebApp/home/index.html  (root redirect)
class WebAppSchemeHandler: NSObject, WKURLSchemeHandler {

    private let webAppRoot: URL = {
        guard let resourceURL = Bundle.main.resourceURL else {
            fatalError("Bundle resourceURL not found")
        }
        return resourceURL.appendingPathComponent("WebApp")
    }()

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let requestURL = urlSchemeTask.request.url else {
            urlSchemeTask.didFailWithError(URLError(.badURL))
            return
        }

        let fileURL = resolveFileURL(for: requestURL)

        guard let data = try? Data(contentsOf: fileURL) else {
            // Return a minimal 404 instead of crashing
            let notFound = Data("Not found".utf8)
            let response = HTTPURLResponse(
                url: requestURL,
                statusCode: 404,
                httpVersion: "HTTP/1.1",
                headerFields: ["Content-Type": "text/plain"]
            )!
            urlSchemeTask.didReceive(response)
            urlSchemeTask.didReceive(notFound)
            urlSchemeTask.didFinish()
            return
        }

        let mimeType = Self.mimeType(for: fileURL.lastPathComponent)
        let response = HTTPURLResponse(
            url: requestURL,
            statusCode: 200,
            httpVersion: "HTTP/1.1",
            headerFields: [
                "Content-Type": mimeType,
                "Content-Length": "\(data.count)",
                // Allow the web app's JS to read from the same scheme origin
                "Access-Control-Allow-Origin": "*",
            ]
        )!
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

    // MARK: – Private

    private func resolveFileURL(for requestURL: URL) -> URL {
        var path = requestURL.path  // e.g. "/home", "/_next/static/css/app.css"

        // Root → load the home page
        if path == "/" || path.isEmpty {
            path = "/home"
        }

        // Remove leading slash for file system join
        let relativePath = String(path.dropFirst())
        var fileURL = webAppRoot.appendingPathComponent(relativePath)

        // If it points to a directory (no extension), look for index.html inside.
        // Next.js static export with trailingSlash:true puts pages at <route>/index.html.
        if fileURL.pathExtension.isEmpty {
            fileURL = fileURL.appendingPathComponent("index.html")
        }

        return fileURL
    }

    private static func mimeType(for filename: String) -> String {
        switch (filename as NSString).pathExtension.lowercased() {
        case "html":         return "text/html; charset=utf-8"
        case "js", "mjs":   return "application/javascript"
        case "css":          return "text/css"
        case "json":         return "application/json"
        case "svg":          return "image/svg+xml"
        case "png":          return "image/png"
        case "jpg", "jpeg":  return "image/jpeg"
        case "gif":          return "image/gif"
        case "webp":         return "image/webp"
        case "ico":          return "image/x-icon"
        case "woff":         return "font/woff"
        case "woff2":        return "font/woff2"
        case "ttf":          return "font/ttf"
        case "txt":          return "text/plain"
        case "xml":          return "application/xml"
        default:             return "application/octet-stream"
        }
    }
}

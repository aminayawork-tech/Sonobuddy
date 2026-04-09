import WebKit

/// Serves pathology images bundled inside the app via the `sono://` custom URL scheme.
/// This makes images available even when the device has no internet connection.
///
/// URL format: sono://pathologies/filename.jpg
///   → looks up  <Bundle>/Pathologies/filename.jpg
class ImageSchemeHandler: NSObject, WKURLSchemeHandler {

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        guard let url = urlSchemeTask.request.url,
              let folder = url.host,
              let resourceURL = Bundle.main.resourceURL else {
            urlSchemeTask.didFailWithError(URLError(.badURL))
            return
        }

        // url.lastPathComponent is already percent-decoded by URL
        let filename = url.lastPathComponent
        guard !filename.isEmpty else {
            urlSchemeTask.didFailWithError(URLError(.badURL))
            return
        }

        // Folder in bundle is capitalised: "pathologies" → "Pathologies"
        let bundleFolder = folder.prefix(1).uppercased() + folder.dropFirst()
        let fileURL = resourceURL
            .appendingPathComponent(bundleFolder)
            .appendingPathComponent(filename)

        guard let data = try? Data(contentsOf: fileURL) else {
            urlSchemeTask.didFailWithError(URLError(.fileDoesNotExist))
            return
        }

        let response = URLResponse(
            url: url,
            mimeType: Self.mimeType(for: filename),
            expectedContentLength: data.count,
            textEncodingName: nil
        )
        urlSchemeTask.didReceive(response)
        urlSchemeTask.didReceive(data)
        urlSchemeTask.didFinish()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {}

    private static func mimeType(for filename: String) -> String {
        switch (filename as NSString).pathExtension.lowercased() {
        case "jpg", "jpeg": return "image/jpeg"
        case "png":          return "image/png"
        case "gif":          return "image/gif"
        case "webp":         return "image/webp"
        default:             return "application/octet-stream"
        }
    }
}

import SwiftUI

struct ContentView: View {
    var body: some View {
        WebView(url: URL(string: "sono-web:///home/")!)
            .ignoresSafeArea()
    }
}

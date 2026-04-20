import SwiftUI

struct ContentView: View {
    @EnvironmentObject var purchaseManager: PurchaseManager

    var body: some View {
        WebView(url: URL(string: "sono-web:///home/")!, purchaseManager: purchaseManager)
            .ignoresSafeArea()
    }
}

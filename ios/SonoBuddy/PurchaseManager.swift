import StoreKit

@MainActor
final class PurchaseManager: ObservableObject {
    static let shared = PurchaseManager()
    static let productID = "app.sonobuddy.unlock"

    @Published private(set) var isPremium = false

    private init() {
        // Restore premium status immediately from last session
        isPremium = UserDefaults.standard.bool(forKey: "sb_premium")
    }

    func checkStatus() async {
        guard !isPremium else { return }
        // Check active StoreKit 2 entitlements (covers purchases + restores)
        for await result in Transaction.currentEntitlements {
            guard case .verified(let tx) = result, tx.productID == Self.productID else { continue }
            grant()
            return
        }
    }

    func purchase() async throws {
        let products = try await Product.products(for: [Self.productID])
        guard let product = products.first else { throw PurchaseError.productNotFound }
        let result = try await product.purchase()
        if case .success(let verification) = result,
           case .verified(let tx) = verification {
            grant()
            await tx.finish()
        }
    }

    func restore() async throws {
        try await AppStore.sync()
        await checkStatus()
    }

    private func grant() {
        isPremium = true
        UserDefaults.standard.set(true, forKey: "sb_premium")
    }
}

enum PurchaseError: Error {
    case productNotFound
}

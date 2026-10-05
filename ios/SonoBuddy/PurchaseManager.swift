import StoreKit

@MainActor
final class PurchaseManager: ObservableObject {
    static let shared = PurchaseManager()

    // Two products unlock the same entitlement. The share-discount one has to
    // exist in App Store Connect with this exact ID before a purchase of it
    // can succeed — see the comment on purchase(productID:) below.
    static let productID = "app.sonobuddy.unlock"
    static let shareDiscountProductID = "app.sonobuddy.unlock.share"
    private static let allProductIDs = [productID, shareDiscountProductID]

    @Published private(set) var isPremium = false

    private init() {
        // Restore premium status immediately from last session
        isPremium = UserDefaults.standard.bool(forKey: "sb_premium")
    }

    func checkStatus() async {
        guard !isPremium else { return }
        // Check active StoreKit 2 entitlements (covers purchases + restores).
        // Either product ID grants the same unlock, so both count.
        for await result in Transaction.currentEntitlements {
            guard case .verified(let tx) = result, Self.allProductIDs.contains(tx.productID) else { continue }
            grant()
            return
        }
    }

    /// Buys the standard $9.99 unlock. Kept separate from purchase(productID:)
    /// so existing call sites don't need to change.
    func purchase() async throws {
        try await purchase(productID: Self.productID)
    }

    /// Buys the discounted unlock offered after sharing the app.
    ///
    /// This will throw `.productNotFound` until a matching non-consumable
    /// product with ID `app.sonobuddy.unlock.share` exists in App Store
    /// Connect, priced at $6.99 — that has to be created there directly, it
    /// cannot be done from code.
    func purchaseDiscount() async throws {
        try await purchase(productID: Self.shareDiscountProductID)
    }

    private func purchase(productID: String) async throws {
        let products = try await Product.products(for: [productID])
        guard let product = products.first else { throw PurchaseError.productNotFound }
        let result = try await product.purchase()
        switch result {
        case .success(.verified(let tx)):
            grant()
            await tx.finish()
        case .success(.unverified(let tx, _)):
            // StoreKit couldn't verify the signature (rare — e.g. a tampered
            // receipt). Finish it to clear the queue, but don't grant access,
            // and surface something instead of leaving the button looking
            // dead — this and .pending below were previously the silent
            // "nothing happens" cases driving people to mash Restore Purchase.
            await tx.finish()
            throw PurchaseError.verificationFailed
        case .pending:
            throw PurchaseError.pending
        case .userCancelled:
            // Not a failure — they backed out of the sheet on purpose.
            // No grant, no throw, no error shown.
            break
        @unknown default:
            throw PurchaseError.unknown
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
    case verificationFailed
    case pending
    case unknown

    var message: String {
        switch self {
        case .productNotFound:
            return "That's not available yet — try again in a moment."
        case .verificationFailed:
            return "We couldn't verify that purchase — please try again, or contact support if you were charged."
        case .pending:
            return "Your purchase needs approval (Ask to Buy or similar) — it'll unlock automatically once approved."
        case .unknown:
            return "Something went wrong — please try again."
        }
    }
}
